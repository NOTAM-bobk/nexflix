import MediaCard from './MediaCard.jsx'
import { getWatchlist, mediaType } from '../utils.js'

export default function MyListRow({ onCardClick, visible }) {
  const list = getWatchlist()

  return (
    <div className="row" style={!visible ? { display: 'none' } : {}}>
      <div className="row-head">
        <div className="row-title">My List</div>
      </div>
      <div className="row-track">
        {list.length === 0 ? (
          <div className="empty-row">
            Titles you save will show up here. Tap "+ My List" on anything to add it.
          </div>
        ) : (
          list.map(item => (
            <MediaCard
              key={`${item.id}-${item.media_type}`}
              item={item}
              onClick={() => onCardClick(item.id, mediaType(item))}
            />
          ))
        )}
      </div>
    </div>
  )
}
