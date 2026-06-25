import { useState, useEffect } from 'react'
import MediaCard from './MediaCard.jsx'
import { tmdb, mediaType } from '../utils.js'

export default function SearchView({ query, visible, onCardClick }) {
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    if (!query || !visible) return
    setLoading(true)
    setFailed(false)
    tmdb('/search/multi', { query, include_adult: 'false' })
      .then(data => {
        const filtered = (data.results || []).filter(r => r.media_type === 'movie' || r.media_type === 'tv')
        setResults(filtered)
        setLoading(false)
      })
      .catch(() => { setFailed(true); setLoading(false) })
  }, [query, visible])

  if (!visible) return null

  return (
    <section className="search-view show">
      <h2 className="search-heading">Results for "{query}"</h2>
      {loading && (
        <div className="search-grid">
          {Array.from({ length: 12 }).map((_, i) => <div key={i} className="skel" style={{ width: '100%' }} />)}
        </div>
      )}
      {!loading && failed && (
        <div className="empty-row">Search failed — try again in a moment.</div>
      )}
      {!loading && !failed && results.length === 0 && (
        <div className="empty-row">No titles matched "{query}".</div>
      )}
      {!loading && !failed && results.length > 0 && (
        <div className="search-grid">
          {results.map(item => (
            <MediaCard
              key={item.id}
              item={item}
              onClick={() => onCardClick(item.id, mediaType(item))}
            />
          ))}
        </div>
      )}
    </section>
  )
}
