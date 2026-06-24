import { imgUrl, mediaTitle, mediaYear, IMG_POSTER } from '../utils.js'

export default function MediaCard({ item, onClick }) {
  const posterUrl = imgUrl(item.poster_path, IMG_POSTER)
  const title = mediaTitle(item)
  const year = mediaYear(item)
  const rating = item.vote_average ? item.vote_average.toFixed(1) : '–'

  return (
    <div className="card" onClick={onClick} role="button" tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && onClick()}>
      {posterUrl
        ? <img loading="lazy" src={posterUrl} alt={title} />
        : <div className="card-fallback">{title}</div>
      }
      <div className="card-meta">
        <div>{title}</div>
        <div><span className="r">★ {rating}</span> · {year}</div>
      </div>
    </div>
  )
}
