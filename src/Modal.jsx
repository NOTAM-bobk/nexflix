import { useState, useEffect, useRef, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { tmdb, imgUrl, isInWatchlist, toggleWatchlist, addToContinueWatching, IMG_BACKDROP_SMALL } from '../utils.js'
import PlayerOverlay from './PlayerOverlay.jsx'
import { useToast } from '../ToastContext.jsx'

export default function Modal({ id, type, onClose, autoplayTrailer }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [closing, setClosing] = useState(false)
  const [inList, setInList] = useState(false)
  const [trailerOpen, setTrailerOpen] = useState(false)
  const [playerOpen, setPlayerOpen] = useState(false)
  const touchStartY = useRef(0)
  const touchCurrentY = useRef(0)
  const modalRef = useRef(null)
  const showToast = useToast()

  useEffect(() => {
    setLoading(true)
    tmdb(`/${type}/${id}`, { append_to_response: 'videos,credits,external_ids' })
      .then(d => {
        setData(d)
        setInList(isInWatchlist(id, type))
        setLoading(false)
        if (autoplayTrailer) setTrailerOpen(true)
      })
      .catch(() => setLoading(false))
  }, [id, type])

  const handleClose = useCallback(() => {
    setClosing(true)
    setTimeout(() => onClose(), 320)
  }, [onClose])

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    const handler = e => { if (e.key === 'Escape') handleClose() }
    window.addEventListener('keydown', handler)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', handler)
    }
  }, [handleClose])

  const handleToggleWatchlist = () => {
    const nowIn = toggleWatchlist({
      id, media_type: type,
      title: data.title || data.name,
      poster_path: data.poster_path,
      vote_average: data.vote_average,
      release_date: data.release_date,
      first_air_date: data.first_air_date,
    })
    setInList(nowIn)
    showToast(nowIn ? 'Added to My List' : 'Removed from My List')
  }

  const handlePlay = () => {
    if (data) {
      addToContinueWatching({
        id, media_type: type,
        title: data.title || data.name,
        poster_path: data.poster_path,
        vote_average: data.vote_average,
        release_date: data.release_date,
        first_air_date: data.first_air_date,
      })
    }
    setPlayerOpen(true)
  }

  // Swipe to close
  const onTouchStart = e => { touchStartY.current = e.touches[0].clientY }
  const onTouchMove = e => {
    touchCurrentY.current = e.touches[0].clientY
    const diff = touchCurrentY.current - touchStartY.current
    if (diff > 0 && modalRef.current) modalRef.current.style.transform = `translateY(${diff}px)`
  }
  const onTouchEnd = () => {
    const diff = touchCurrentY.current - touchStartY.current
    if (modalRef.current) modalRef.current.style.transform = ''
    if (diff > 100) handleClose()
  }

  const trailer = data?.videos?.results?.find(v => v.site === 'YouTube' && v.type === 'Trailer')
    || data?.videos?.results?.find(v => v.site === 'YouTube')
  const genres = (data?.genres || []).map(g => g.name)
  const cast = (data?.credits?.cast || []).slice(0, 5).map(c => c.name).join(', ')
  const title = data?.title || data?.name || ''
  const year = (data?.release_date || data?.first_air_date || '').slice(0, 4)
  const runtime = type === 'movie'
    ? (data?.runtime ? `${data.runtime} min` : null)
    : (data?.number_of_seasons ? `${data.number_of_seasons} season${data.number_of_seasons > 1 ? 's' : ''}` : null)
  const backdropUrl = imgUrl(data?.backdrop_path, IMG_BACKDROP_SMALL)
  const imdbId = data?.external_ids?.imdb_id || `tt${id}`

  const modal = (
    <div className="modal-backdrop show" onClick={e => { if (e.target.classList.contains('modal-backdrop')) handleClose() }}>
      <div ref={modalRef} className={`modal${closing ? ' closing' : ''}`}>
        <div
          className="modal-drag-handle"
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          <div className="bar" />
        </div>

        <div className="modal-scroll">
          {loading ? (
            <div style={{ padding: '80px', textAlign: 'center', color: 'var(--text-dim)' }}>Loading…</div>
          ) : !data ? (
            <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-dim)' }}>
              <button className="modal-close" onClick={handleClose} style={{ position: 'static', display: 'inline-flex', marginBottom: 20 }}>✕</button>
              <br />Something went wrong loading this title.
            </div>
          ) : (
            <>
              <div
                className="modal-hero"
                style={{ backgroundImage: backdropUrl ? `url(${backdropUrl})` : undefined, background: backdropUrl ? undefined : '#1c1c1f' }}
              >
                <button className="modal-close" onClick={handleClose}>✕</button>
                <div className="modal-title-wrap">
                  <div className="modal-title">{title}</div>
                </div>
              </div>

              <div className="modal-body">
                <div className="modal-meta">
                  <span style={{ color: 'var(--gold)', fontWeight: 700 }}>★ {data.vote_average ? data.vote_average.toFixed(1) : '–'}</span>
                  <span>{year || '—'}</span>
                  {runtime && <span>{runtime}</span>}
                </div>

                <div className="pills">
                  {genres.map(g => <span key={g} className="pill">{g}</span>)}
                </div>

                <div className="modal-actions">
                  <button
                    className="btn btn-primary"
                    disabled={!trailer}
                    style={!trailer ? { opacity: 0.4, cursor: 'default' } : {}}
                    onClick={() => trailer && setTrailerOpen(t => !t)}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                    Trailer
                  </button>

                  <button
                    className="btn btn-primary"
                    style={{ background: 'var(--accent)' }}
                    onClick={handlePlay}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                    Play
                  </button>

                  <button className="btn btn-ghost" onClick={handleToggleWatchlist}>
                    {inList ? '✓ In My List' : '+ My List'}
                  </button>
                </div>

                {trailerOpen && trailer && (
                  <div className="trailer-frame">
                    <iframe
                      src={`https://www.youtube.com/embed/${trailer.key}?autoplay=1`}
                      allow="autoplay; encrypted-media"
                      allowFullScreen
                      title="Trailer"
                    />
                  </div>
                )}

                <p className="modal-overview">{data.overview || 'No description available.'}</p>
                {cast && (
                  <>
                    <div className="cast-label">Cast</div>
                    <div className="cast-list">{cast}</div>
                  </>
                )}
                <div className="note">
                  This app streams metadata, artwork, and trailers from TMDB. Full-length playback is powered by VidFast.
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {playerOpen && data && (
        <PlayerOverlay
          id={id}
          type={type}
          imdbId={imdbId}
          numSeasons={data.number_of_seasons}
          onClose={() => setPlayerOpen(false)}
        />
      )}
    </div>
  )

  return createPortal(modal, document.body)
}
