import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { tmdb } from '../utils.js'

export default function PlayerOverlay({ id, type, imdbId, numSeasons, onClose }) {
  const [season, setSeason] = useState(1)
  const [episode, setEpisode] = useState(1)
  const [episodes, setEpisodes] = useState([])

  useEffect(() => {
    if (type === 'tv') {
      tmdb(`/tv/${id}/season/${season}`)
        .then(data => {
          const eps = (data.episodes || []).map(e => e.episode_number)
          setEpisodes(eps)
          setEpisode(eps[0] || 1)
        })
        .catch(() => setEpisodes([]))
    }
  }, [id, type, season])

  // Build vidfast URL per docs
  const buildUrl = () => {
    if (type === 'movie') {
      return `https://vidfast.pro/movie/${imdbId}?autoPlay=true&title=true&poster=true&nextButton=true`
    }
    return `https://vidfast.pro/tv/${imdbId}/${season}/${episode}?autoPlay=true&title=true&poster=true&nextButton=true&autoNext=true`
  }

  // Close on Escape
  useEffect(() => {
    const handler = e => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  const overlay = (
    <div className="player-overlay" onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="player-overlay-inner">
        <button className="player-overlay-close" onClick={onClose}>✕</button>

        {type === 'tv' && (
          <div className="player-tv-controls">
            <label>
              Season:
              <select
                className="season-select"
                value={season}
                onChange={e => { setSeason(Number(e.target.value)); setEpisode(1) }}
              >
                {Array.from({ length: numSeasons || 1 }, (_, i) => i + 1).map(s => (
                  <option key={s} value={s}>S{s}</option>
                ))}
              </select>
            </label>
            <label>
              Episode:
              <select
                className="season-select"
                value={episode}
                onChange={e => setEpisode(Number(e.target.value))}
              >
                {(episodes.length ? episodes : [1]).map(ep => (
                  <option key={ep} value={ep}>E{ep}</option>
                ))}
              </select>
            </label>
          </div>
        )}

        <div className="player-overlay-frame">
          <iframe
            key={buildUrl()}
            src={buildUrl()}
            width="100%"
            height="100%"
            frameBorder="0"
            allowFullScreen
            allow="autoplay; encrypted-media; fullscreen"
            title="Player"
          />
        </div>
      </div>
    </div>
  )

  return createPortal(overlay, document.body)
}
