import { useState, useCallback } from 'react'
import { ToastProvider } from './ToastContext.jsx'
import Animation from './components/Animation.jsx'
import Navbar from './components/Navbar.jsx'
import Hero from './components/Hero.jsx'
import MediaRow from './components/MediaRow.jsx'
import ContinueWatchingRow from './components/ContinueWatchingRow.jsx'
import MyListRow from './components/MyListRow.jsx'
import SearchView from './components/SearchView.jsx'
import ExploreView from './components/ExploreView.jsx'
import Modal from './components/Modal.jsx'
import { tmdb } from './utils.js'

// Row definitions — each row knows its own fetcher
const ROWS = [
  { id: 'top10',       title: 'Top 10 This Week',          fetcher: () => tmdb('/trending/all/week'),                                                               fallback: 'movie', top10: true },
  { id: 'trending',    title: 'Trending Now',               fetcher: () => tmdb('/trending/all/week'),                                                               fallback: 'movie' },
  { id: 'popmovies',   title: 'Popular Movies',             fetcher: () => tmdb('/movie/popular'),                                                                   fallback: 'movie' },
  { id: 'tvpopular',   title: 'Popular TV Shows',           fetcher: () => tmdb('/tv/popular'),                                                                      fallback: 'tv'    },
  { id: 'topmovies',   title: 'Top Rated Films',            fetcher: () => tmdb('/movie/top_rated'),                                                                 fallback: 'movie' },
  { id: 'tvtop',       title: 'Critically Acclaimed Series',fetcher: () => tmdb('/tv/top_rated'),                                                                    fallback: 'tv'    },
  { id: 'action',      title: 'Action & Adventure',         fetcher: () => tmdb('/discover/movie', { with_genres: 28,    sort_by: 'popularity.desc' }),              fallback: 'movie' },
  { id: 'scifi',       title: 'Sci-Fi & Fantasy',           fetcher: () => tmdb('/discover/movie', { with_genres: 878,   sort_by: 'popularity.desc' }),              fallback: 'movie' },
  { id: 'comedy',      title: 'Comedies',                   fetcher: () => tmdb('/discover/movie', { with_genres: 35,    sort_by: 'popularity.desc' }),              fallback: 'movie' },
  { id: 'horror',      title: 'Horror',                     fetcher: () => tmdb('/discover/movie', { with_genres: 27,    sort_by: 'popularity.desc' }),              fallback: 'movie' },
  { id: 'animation',   title: 'Animation',                  fetcher: () => tmdb('/discover/movie', { with_genres: 16,    sort_by: 'popularity.desc' }),              fallback: 'movie' },
  { id: 'documentary', title: 'Documentaries',              fetcher: () => tmdb('/discover/movie', { with_genres: 99,    sort_by: 'popularity.desc' }),              fallback: 'movie' },
  { id: 'thriller',    title: 'Thriller',                   fetcher: () => tmdb('/discover/movie', { with_genres: 53,    sort_by: 'popularity.desc' }),              fallback: 'movie' },
  { id: 'romance',     title: 'Romance',                    fetcher: () => tmdb('/discover/movie', { with_genres: 10749, sort_by: 'popularity.desc' }),              fallback: 'movie' },
  { id: 'drama-tv',    title: 'Drama Series',               fetcher: () => tmdb('/discover/tv',    { with_genres: 18,    sort_by: 'popularity.desc' }),              fallback: 'tv'    },
  { id: 'comedy-tv',   title: 'Comedy Series',              fetcher: () => tmdb('/discover/tv',    { with_genres: 35,    sort_by: 'popularity.desc' }),              fallback: 'tv'    },
  { id: 'thriller-tv', title: 'Thriller Series',            fetcher: () => tmdb('/discover/tv',    { with_genres: 53,    sort_by: 'popularity.desc' }),              fallback: 'tv'    },
  { id: 'upcoming',    title: 'Upcoming Releases',          fetcher: () => tmdb('/movie/upcoming'),                                                                  fallback: 'movie' },
]

function rowVisible(rowId, category) {
  if (category === 'home')   return true
  if (category === 'movies') return !rowId.endsWith('-tv')
  if (category === 'tv')     return rowId.endsWith('-tv') || rowId === 'tvpopular' || rowId === 'tvtop'
  if (category === 'mylist') return false
  return true
}

export default function AppRoot() {
  const [animDone, setAnimDone] = useState(false)

  return (
    <ToastProvider>
      {!animDone && <Animation onComplete={() => setAnimDone(true)} />}
      {animDone && <App />}
    </ToastProvider>
  )
}

function App() {
  const [category, setCategory]   = useState('home')
  const [modal, setModal]         = useState(null)   // { id, type, autoplayTrailer }
  const [exploreOpen, setExploreOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchActive, setSearchActive] = useState(false)
  const [cwKey, setCwKey]         = useState(0)      // force re-render of CW row

  const openModal = useCallback((id, type, autoplayTrailer = false) => {
    setModal({ id, type, autoplayTrailer })
  }, [])

  const closeModal = useCallback(() => setModal(null), [])

  const handleCategory = useCallback((cat) => {
    setCategory(cat)
    setSearchActive(false)
    setSearchQuery('')
    if (cat === 'home') window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  const handleSearch = useCallback((q) => {
    setSearchActive(true)
    setSearchQuery(q)
  }, [])

  const handleClearSearch = useCallback(() => {
    setSearchActive(false)
    setSearchQuery('')
  }, [])

  const handleExploreClose = useCallback(() => {
    setExploreOpen(false)
  }, [])

  const showMain = !searchActive

  return (
    <>
      <Navbar
        category={category}
        onCategory={handleCategory}
        onSearch={handleSearch}
        onClearSearch={handleClearSearch}
        onLogoClick={() => handleCategory('home')}
      />

      {/* Hero — hidden during search */}
      {showMain && (
        <Hero
          onPlay={(id, type) => openModal(id, type, true)}
          onInfo={(id, type) => openModal(id, type, false)}
        />
      )}

      {/* Main rows — hidden during search */}
      {showMain && (
        <main className="rows">
          {/* Continue Watching */}
          <ContinueWatchingRow
            key={cwKey}
            onCardClick={openModal}
            hidden={category === 'mylist'}
            onUpdate={() => setCwKey(k => k + 1)}
          />

          {/* My List */}
          <MyListRow
            onCardClick={openModal}
            visible={category === 'mylist'}
          />

          {/* All content rows */}
          {ROWS.map(row => (
            <MediaRow
              key={row.id}
              title={row.title}
              rowId={`row-${row.id}`}
              fetcher={row.fetcher}
              fallbackType={row.fallback}
              isTop10={row.top10}
              onCardClick={openModal}
              hidden={!rowVisible(row.id, category)}
            />
          ))}

          {/* Explore trigger button */}
          <div className="explore-trigger-wrap">
            <button className="explore-trigger-btn" onClick={() => setExploreOpen(true)}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <path d="M12 8v4M12 16h.01"/>
                <path d="M2 12h2M20 12h2M12 2v2M12 20v2"/>
              </svg>
              Explore Everything
            </button>
          </div>
        </main>
      )}

      {/* Search results */}
      <SearchView
        query={searchQuery}
        visible={searchActive}
        onCardClick={openModal}
      />

      {/* Footer */}
      {showMain && (
        <footer className="footer">
          <div className="sprocket long">
            <span/><span/><span/><span/><span/>
          </div>
          <div>This is a personal, non-commercial project built for learning purposes using the TMDB API.</div>
          <div>Not affiliated with, endorsed by, or sponsored by Netflix, Inc. or TMDB.</div>
        </footer>
      )}

      {/* Mobile bottom nav */}
      <nav className="bottom-nav">
        {[
          { cat: 'movies', label: 'Movies', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="3" width="20" height="18" rx="2"/><path d="M7 3v18M17 3v18M2 9h5M17 9h5M2 15h5M17 15h5"/></svg> },
          { cat: 'tv',     label: 'Shows',  icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M9 21h6M12 19v2"/></svg> },
          { cat: 'mylist', label: 'Watchlist', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 3h12v18l-6-4-6 4z"/></svg> },
        ].map(({ cat, label, icon }) => (
          <button
            key={cat}
            className={category === cat ? 'active' : ''}
            onClick={() => handleCategory(cat)}
          >
            {icon}
            <span>{label}</span>
          </button>
        ))}
      </nav>

      {/* Explore full-screen overlay */}
      <ExploreView
        visible={exploreOpen}
        onClose={handleExploreClose}
        onCardClick={openModal}
      />

      {/* Detail modal */}
      {modal && (
        <Modal
          id={modal.id}
          type={modal.type}
          autoplayTrailer={modal.autoplayTrailer}
          onClose={closeModal}
        />
      )}
    </>
  )
}
