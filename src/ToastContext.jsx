import { createContext, useContext, useState, useCallback, useRef } from 'react'

const ToastContext = createContext(null)

export function ToastProvider({ children }) {
  const [toast, setToast] = useState({ msg: '', visible: false })
  const timerRef = useRef(null)

  const showToast = useCallback((msg) => {
    clearTimeout(timerRef.current)
    setToast({ msg, visible: true })
    timerRef.current = setTimeout(() => setToast(t => ({ ...t, visible: false })), 1800)
  }, [])

  return (
    <ToastContext.Provider value={showToast}>
      {children}
      <div className={`toast ${toast.visible ? 'show' : ''}`}>{toast.msg}</div>
    </ToastContext.Provider>
  )
}

export const useToast = () => useContext(ToastContext)
