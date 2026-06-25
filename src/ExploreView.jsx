import { useState, useEffect, useRef, useCallback } from 'react'
import MediaCard from './MediaCard.jsx'
import { tmdb, mediaType } from '../utils.js'

const FILTERS = [
  { label: 'All',          type: 'all'   },
  { label: 'Movies',       type: 'movie' },
  { label: 'TV Shows',     type: 'tv'    },
  { label: 'Action',       type: '28'    },
  { label: 'Comedy',       type: '35'    },
  { label: 'Horror',       type: '27'    },
  { label: 'Sci-Fi',       type: '878'   },
  { label: 'Drama',        type: '18'    },
  { label: 'Romance',      type: '10749' },
  { label: 'Thriller',     type: '53'    },
  { label: 'Animation',    type: '16'    },
  { label: 'Documentary',  type: '99'    },
]

const SORTS = [
  { label: 'Most Popular',  value: 'popularity.desc'    },
  { label: 'Top Rated',     value: 'vote_average.desc'  },
  { label: 'Newest First',  value: 'release_date.desc'  },
  { label: 'Box Office',    value: 'revenue.desc'       },
]

function getEndpoint(filter, sort, page) {
  if (filter === 'all')   return ['/trending/all/week', { page }]
  if (filter === 'movie') return ['/discover/movie', { sort_by: sort, page, include_adult: 'false', 'vote_count.gte': 20 }]
  if (filter === 'tv')    return ['/discover/tv',    { sort_by: sort, page, include_adult: 'false', 'vote_count.gte': 10 }]
  // numeric = genre id
  return ['/discover/movie', { with_genres: filter, sort_by: sort, page, include_adult: 'false', 'vote_count.gte': 10 }]
}

export default function ExploreView({ visible, onClose, onCardClick }) {
  const [filter, setFilter]         = useState('all')
  const [sort, setSort]             = useState('popularity.desc')
  const [items, setItems]           = useState([])
  const [page, setPage]             = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalResults, setTotalResults] = useState(0)
  const [loading, setLoading]       = useState(false)
  const [reachedEnd, setReachedEnd] = useState(false)
  const [resetKey, setResetKey]     = useState(0)

  const sentinelRef  = useRef(null)
  const observerRef  = useRef(null)
  const isFetching   = useRef(false)

  // Lock body scroll while explore is open
  useEffect(() => {
    if (visible) document.body.style.overflow = 'hidden'
    else         document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [visible])

  // ESC key closes explore
  useEffect(() => {
    const handler = e => { if (e.key === 'Escape' && visible) onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [visible, onClose])

  // Reset when filter/sort changes
  const doReset = useCallback(() => {
    setItems([])
    setPage(1)
    setTotalPages(1)
    setTotalResults(0)
    setReachedEnd(false)
    isFetching.current = false
    setResetKey(k => k + 1)
  }, [])

  const handleFilterChange = f => { setFilter(f); doReset() }
  const handleSortChange   = s => { setSort(s);   doReset() }

  // Fetch one page
  const fetchPage = useCallback(async (currentPage, currentFilter, currentSort) => {
    if (isFetching.current) return
    isFetching.current = true
    setLoading(true)
    try {
      const [endpoint, params] = getEndpoint(currentFilter, currentSort, currentPage)
      const data = await tmdb(endpoint, params)
      const results = (data.results || []).filter(r => r.poster_path)
      const tp = Math.min(data.total_pages || 1, 500)
      setTotalPages(tp)
      setTotalResults(data.total_results || 0)
      setItems(prev => currentPage === 1 ? results : [...prev, ...results])
      setPage(currentPage + 1)
      if (currentPage >= tp) setReachedEnd(true)
    } catch (e) {
      console.error('Explore fetch error:', e)
    }
    setLoading(false)
    isFetching.current = false
  }, [])

  // Initial fetch when resetKey changes (filter/sort reset) or on first open
  useEffect(() => {
    if (!visible) return
    fetchPage(1, filter, sort)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetKey, visible])

  // IntersectionObserver for infinite scroll
  useEffect(() => {
    if (!visible) return
    if (observerRef.current) observerRef.current.disconnect()
    observerRef.current = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && !reachedEnd && !isFetching.current) {
          fetchPage(page, filter, sort)
        }
      },
      { threshold: 0, rootMargin: '400px' }
    )
    if (sentinelRef.current) observerRef.current.observe(sentinelRef.current)
    return () => observerRef.current?.disconnect()
  }, [visible, page, filter, sort, reachedEnd, fetchPage])

  const approxCount = totalResults > 10000 ? '10,000+' : totalResults.toLocaleString()

  return (
    <div className={`explore-view${visible ? ' show' : ''}`}>
      {/* Sticky Header */}
      <div className="explore-header">
        <div className="explore-header-left">
          <button
            className="explore-back"
            onClick={onClose}
            title="Back to Home"
            aria-label="Back to Home"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M19 12H5M5 12l7 7M5 12l7-7"/>
            </svg>
          </button>
          <div className="explore-title-text">Explore All</div>
        </div>

        <div className="explore-filters" id="exploreFilters">
          {FILTERS.map(f => (
            <button
              key={f.type}
              className={`filter-pill${filter === f.type ? ' active' : ''}`}
              onClick={() => handleFilterChange(f.type)}
            >
              {f.label}
            </button>
          ))}
        </div>

        <select
          className="explore-sort"
          value={sort}
          onChange={e => handleSortChange(e.target.value)}
        >
          {SORTS.map(s => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
      </div>

      {/* Count */}
      {totalResults > 0 && (
        <div className="explore-count">{approxCount} titles</div>
      )}

      {/* Grid */}
      <div className="explore-grid">
        {items.map(item => (
          <MediaCard
            key={`${item.id}-${item.media_type || 'movie'}`}
            item={{ ...item, media_type: item.media_type || (item.first_air_date ? 'tv' : 'movie') }}
            onClick={() => onCardClick(item.id, mediaType(item))}
          />
        ))}

        {/* Skeleton placeholders on initial load */}
        {loading && items.length === 0 &&
          Array.from({ length: 20 }).map((_, i) => (
            <div key={i} className="explore-skel" />
          ))
        }
      </div>

      {/* Loader dots */}
      {loading && items.length > 0 && (
        <div className="explore-loader">
          <div className="explore-loader-dot" />
          <div className="explore-loader-dot" />
          <div className="explore-loader-dot" />
        </div>
      )}

      {/* End message */}
      {reachedEnd && !loading && (
        <div className="explore-end">
          You've seen it all — <span style={{ color: 'var(--accent)' }}>impressive.</span>
        </div>
      )}

      {/* Sentinel for IntersectionObserver */}
      <div ref={sentinelRef} style={{ height: 1 }} />
    </div>
  )
}
