import { useState, useEffect, useRef, useCallback } from 'react'
import { getRecent, setRecent, addRecent } from '../utils.js'

export default function Navbar({ category, onCategory, onSearch, onClearSearch, onLogoClick }) {
  const [scrolled, setScrolled] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [recents, setRecents] = useState([])
  const inputRef = useRef(null)
  const debounceRef = useRef(null)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 30)
    window.addEventListener('scroll', handler)
    return () => window.removeEventListener('scroll', handler)
  }, [])

  const openSearch = useCallback(() => {
    setSearchOpen(true)
    setRecents(getRecent())
    setTimeout(() => inputRef.current?.focus(), 50)
  }, [])

  const closeSearch = useCallback(() => {
    setSearchOpen(false)
  }, [])

  useEffect(() => {
    const handler = e => {
      if (!e.target.closest('.search-wrap')) closeSearch()
    }
    document.addEventListener('click', handler)
    return () => document.removeEventListener('click', handler)
  }, [closeSearch])

  const handleInput = e => {
    const q = e.target.value
    setQuery(q)
    clearTimeout(debounceRef.current)
    if (!q.trim()) { onClearSearch(); return }
    debounceRef.current = setTimeout(() => {
      addRecent(q)
      setRecents(getRecent())
      onSearch(q)
    }, 400)
  }

  const handleKeyDown = e => {
    if (e.key === 'Enter') {
      clearTimeout(debounceRef.current)
      const q = query.trim()
      if (q) { addRecent(q); setRecents(getRecent()); onSearch(q) }
    } else if (e.key === 'Escape') {
      closeSearch()
    }
  }

  const handleClear = e => {
    e.stopPropagation()
    setQuery('')
    onClearSearch()
    inputRef.current?.focus()
    setRecents(getRecent())
  }

  const handleRecentClick = q => {
    setQuery(q)
    onSearch(q)
  }

  const clearAllRecents = e => {
    e.stopPropagation()
    setRecent([])
    setRecents([])
  }

  const cats = ['home', 'movies', 'tv', 'mylist']
  const catLabels = { home: 'Home', movies: 'Movies', tv: 'TV Shows', mylist: 'My List' }

  return (
    <nav className={`nav${scrolled ? ' scrolled' : ''}`}>
      <div className="logo" onClick={onLogoClick}>Netflix</div>

      <div className="nav-links">
        {cats.map(cat => (
          <a
            key={cat}
            href="#"
            className={category === cat ? 'active' : ''}
            data-cat={cat}
            onClick={e => { e.preventDefault(); onCategory(cat) }}
          >
            {catLabels[cat]}
          </a>
        ))}
      </div>

      <div className="nav-right">
        <div className="search-wrap">
          <button
            className={`icon-btn${searchOpen ? ' active' : ''}`}
            onClick={e => { e.stopPropagation(); searchOpen ? closeSearch() : openSearch() }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
          </button>

          <div className={`search-panel${searchOpen ? ' open' : ''}`}>
            <div className="search-field">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input
                ref={inputRef}
                value={query}
                onChange={handleInput}
                onKeyDown={handleKeyDown}
                placeholder="Titles, people, genres…"
                autoComplete="off"
              />
              {query && (
                <button className="search-clear" onClick={handleClear}>✕</button>
              )}
            </div>

            <div className="recent-wrap">
              <div className="recent-head">
                <span>Recent Searches</span>
                <button onClick={clearAllRecents} type="button">Clear</button>
              </div>
              <div className="recent-list">
                {recents.length === 0
                  ? <div className="recent-empty">Your recent searches will show up here.</div>
                  : recents.map(q => (
                    <div key={q} className="recent-item" onClick={() => handleRecentClick(q)}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/>
                      </svg>
                      <span>{q}</span>
                    </div>
                  ))
                }
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}
