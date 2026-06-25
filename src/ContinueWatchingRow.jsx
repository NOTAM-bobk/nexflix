import MediaCard from './MediaCard.jsx'
import { getContinueWatching, setContinueWatching, mediaType } from '../utils.js'
import { useToast } from '../ToastContext.jsx'

export default function ContinueWatchingRow({ onCardClick, hidden, onUpdate }) {
  const showToast = useToast()
  const list = getContinueWatching()

  if (!list.length) return null

  const handleClear = () => {
    setContinueWatching([])
    showToast('Continue Watching cleared')
    onUpdate()
  }

  return (
    <div className="row" style={hidden ? { display: 'none' } : {}}>
      <div className="row-head">
        <div className="row-title">Continue Watching</div>
        <div className="row-head-actions">
          <button className="clear-cw-btn" onClick={handleClear}>Clear All</button>
        </div>
      </div>
      <div className="row-track">
        {list.map(item => (
          <MediaCard
            key={`${item.id}-${item.media_type}`}
            item={item}
            onClick={() => onCardClick(item.id, mediaType(item))}
          />
        ))}
      </div>
    </div>
  )
}
