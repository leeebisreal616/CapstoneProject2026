import { useState, useEffect } from 'react'

export default function OfflineBanner() {
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [showReconnected, setShowReconnected] = useState(false)

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      setShowReconnected(true)
      setTimeout(() => setShowReconnected(false), 3000)
    }
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  if (isOnline && !showReconnected) return null

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-[9999] text-center py-2.5 text-[13px] font-semibold text-white transition-all ${isOnline ? 'bg-[#1D9E75]' : 'bg-red-600'}`}
      style={{ paddingTop: 'calc(0.625rem + env(safe-area-inset-top))' }}
    >
      {isOnline ? (
        <span className="flex items-center justify-center gap-2">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
            <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Back online. Your connection has been restored.
        </span>
      ) : (
        <span className="flex items-center justify-center gap-2">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
            <path d="M18.364 5.636a9 9 0 010 12.728m0 0l-3.536-3.536m3.536 3.536L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-3.536-3.536M3 3l18 18" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          No internet connection. Form submissions won't work until you're back online.
        </span>
      )}
    </div>
  )
}