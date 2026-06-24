import { useState, useEffect, useRef } from 'react'
import { tmdb, imgUrl, mediaTitle, mediaYear, mediaType, IMG_BACKDROP } from '../utils.js'

export default function Hero({ onPlay, onInfo }) {
  const [items, setItems] = useState([])
  const [index, setIndex] = useState(0)
  const timerRef = useRef(null)

  useEffect(() => {
    tmdb('/trending/all/week').then(data => {
      const filtered = (data.results || []).filter(i => i.backdrop_path).slice(0, 5)
      setItems(filtered)
    }).catch(() => {})
  }, [])

  useEffect(() => {
    if (!items.length) return
    timerRef.current = setInterval(() => setIndex(i => (i + 1) % items.length), 8000)
    return () => clearInterval(timerRef.current)
  }, [items.length])

  const item = items[index]
  if (!item) return <header className="hero"><div className="hero-scrim" /></header>

  const type = mediaType(item)

  return (
    <header className="hero">
      {items.map((it, i) => (
        <div
          key={it.id}
          className={`hero-slide${i === index ? ' active' : ''}`}
          style={{ backgroundImage: `url(${imgUrl(it.backdrop_path, IMG_BACKDROP)})` }}
        />
      ))}
      <div className="hero-scrim" />
      <div className="hero-content">
        <h1 className="hero-title">{mediaTitle(item)}</h1>
        <div className="hero-meta">
          <span className="rating">★ {item.vote_average ? item.vote_average.toFixed(1) : '–'}</span>
          <span>{mediaYear(item)}</span>
          <span>{type === 'tv' ? 'Series' : 'Film'}</span>
        </div>
        <p className="hero-overview">{item.overview || ''}</p>
        <div className="hero-actions">
          <button className="btn btn-primary" onClick={() => onPlay(item.id, type, true)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
            Play Trailer
          </button>
          <button className="btn btn-ghost" onClick={() => onInfo(item.id, type)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
            More Info
          </button>
        </div>
      </div>
      <div className="hero-dots">
        {items.map((_, i) => (
          <button key={i} className={i === index ? 'active' : ''} onClick={() => { clearInterval(timerRef.current); setIndex(i) }} />
        ))}
      </div>
    </header>
  )
}
