import { useEffect, useState } from 'react'

/**
 * Animation splash screen shown on first load.
 * Replace the contents of this component with your own animation.
 * Call `onComplete()` when the animation finishes to reveal the app.
 */
export default function Animation({ onComplete }) {
  const [fading, setFading] = useState(false)

  // TODO: Replace this placeholder with your real animation.
  // Call onComplete() when the animation ends so the app appears.
  useEffect(() => {
    // Example: auto-complete after 1ms (passthrough until you add real animation)
    const t = setTimeout(() => {
      setFading(true)
      setTimeout(onComplete, 400)
    }, 1)
    return () => clearTimeout(t)
  }, [onComplete])

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: '#0a0a0c',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: fading ? 0 : 1,
        transition: 'opacity 0.4s ease',
        pointerEvents: fading ? 'none' : 'all',
      }}
    >
      {/* ── YOUR ANIMATION GOES HERE ── */}
    </div>
  )
}
