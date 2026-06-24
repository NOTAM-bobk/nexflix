import { useState, useEffect } from 'react'
import MediaCard from './MediaCard.jsx'
import { tmdb, mediaType } from '../utils.js'

function Skeleton() {
  return (
    <div style={{ display: 'flex', gap: 10, padding: '4px 4vw 18px' }}>
      {Array.from({ length: 8 }).map((_, i) => <div key={i} className="skel" />)}
    </div>
  )
}

export default function MediaRow({ title, rowId, fetcher, fallbackType, isTop10, onCardClick, hidden }) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    fetcher()
      .then(data => { if (!cancelled) { setItems((data.results || []).map(i => ({ ...i, media_type: i.media_type || fallbackType }))); setLoading(false) } })
      .catch(() => { if (!cancelled) { setFailed(true); setLoading(false) } })
    return () => { cancelled = true }
  }, [])

  if (!loading && !items.length && !failed) return null

  return (
    <div className="row" id={rowId} style={hidden ? { display: 'none' } : {}}>
      <div className="row-head">
        <div className="row-title">{title}</div>
      </div>
      {loading
        ? <Skeleton />
        : failed
          ? <div className="empty-row">Couldn't load this row right now.</div>
          : (
            <div className={`row-track${isTop10 ? ' top10-track' : ''}`}>
              {items.map((item, index) =>
                isTop10 ? (
                  <div key={item.id} className="top10-item">
                    <div className="top10-rank">{String(index + 1).padStart(2, '0')}</div>
                    <MediaCard item={item} onClick={() => onCardClick(item.id, mediaType(item))} />
                  </div>
                ) : (
                  <MediaCard key={item.id} item={item} onClick={() => onCardClick(item.id, mediaType(item))} />
                )
              )}
            </div>
          )
      }
    </div>
  )
}
