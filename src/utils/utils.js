const TMDB_KEY = 'b1941699110de014fceb3d15828f4718'
const BASE = 'https://api.themoviedb.org/3'

export const IMG_POSTER = 'https://image.tmdb.org/t/p/w400'
export const IMG_BACKDROP = 'https://image.tmdb.org/t/p/w1280'
export const IMG_BACKDROP_SMALL = 'https://image.tmdb.org/t/p/w780'

export async function tmdb(path, params = {}) {
  const url = new URL(BASE + path)
  url.searchParams.set('api_key', TMDB_KEY)
  url.searchParams.set('language', 'en-US')
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v))
  let res = await fetch(url)
  if (res.status === 429) {
    const wait = Number(res.headers.get('Retry-After') || 1) * 1000
    await new Promise(r => setTimeout(r, wait))
    res = await fetch(url)
  }
  if (!res.ok) throw new Error('TMDB request failed: ' + res.status)
  return res.json()
}

export const imgUrl = (path, size) => (path ? size + path : null)

export function mediaTitle(item) { return item.title || item.name || 'Untitled' }
export function mediaYear(item) {
  const d = item.release_date || item.first_air_date
  return d ? d.slice(0, 4) : '—'
}
export function mediaType(item) {
  return item.media_type || (item.first_air_date ? 'tv' : 'movie')
}

/* ---- Watchlist ---- */
const WL_KEY = 'velvet_watchlist'
export const getWatchlist = () => JSON.parse(localStorage.getItem(WL_KEY) || '[]')
export const setWatchlist = list => localStorage.setItem(WL_KEY, JSON.stringify(list))
export const isInWatchlist = (id, type) => getWatchlist().some(i => i.id === id && i.media_type === type)
export function toggleWatchlist(item) {
  let list = getWatchlist()
  const exists = list.some(i => i.id === item.id && i.media_type === item.media_type)
  if (exists) {
    list = list.filter(i => !(i.id === item.id && i.media_type === item.media_type))
  } else {
    list.unshift(item)
  }
  setWatchlist(list)
  return !exists
}

/* ---- Continue Watching ---- */
const CW_KEY = 'netflix_continue_watching'
export const getContinueWatching = () => JSON.parse(localStorage.getItem(CW_KEY) || '[]')
export const setContinueWatching = list => localStorage.setItem(CW_KEY, JSON.stringify(list))
export function addToContinueWatching(item) {
  let list = getContinueWatching()
  const idx = list.findIndex(i => i.id === item.id && i.media_type === item.media_type)
  if (idx >= 0) list.splice(idx, 1)
  list.unshift({ ...item, timestamp: Date.now() })
  setContinueWatching(list.slice(0, 20))
}

/* ---- Recent Searches ---- */
const RECENT_KEY = 'netflix_recent_searches'
export const getRecent = () => JSON.parse(localStorage.getItem(RECENT_KEY) || '[]')
export const setRecent = list => localStorage.setItem(RECENT_KEY, JSON.stringify(list))
export function addRecent(q) {
  q = q.trim()
  if (!q) return
  let list = getRecent().filter(i => i.toLowerCase() !== q.toLowerCase())
  list.unshift(q)
  setRecent(list.slice(0, 8))
}
