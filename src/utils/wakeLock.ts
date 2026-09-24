import { useState, useEffect, useCallback, useRef } from 'react'

export function isWakeLockSupported(): boolean {
  return typeof window !== 'undefined' && typeof navigator !== 'undefined' && 'wakeLock' in navigator
}

export function useWakeLock(defaultActive = false) {
  const [isActive, setIsActive] = useState(false)
  const [isSupported, setIsSupported] = useState(false)
  const sentinelRef = useRef<WakeLockSentinel | null>(null)
  const shouldBeActiveRef = useRef(defaultActive)

  useEffect(() => {
    setIsSupported(isWakeLockSupported())
  }, [])

  const requestLock = useCallback(async () => {
    if (!isWakeLockSupported()) return false
    try {
      if (sentinelRef.current) {
        return true
      }
      const sentinel = await navigator.wakeLock.request('screen')
      sentinelRef.current = sentinel
      setIsActive(true)
      shouldBeActiveRef.current = true

      sentinel.addEventListener('release', () => {
        sentinelRef.current = null
        setIsActive(false)
      })
      return true
    } catch {
      setIsActive(false)
      return false
    }
  }, [])

  const releaseLock = useCallback(async () => {
    shouldBeActiveRef.current = false
    if (sentinelRef.current) {
      try {
        await sentinelRef.current.release()
      } catch {
        // Ignorar
      }
      sentinelRef.current = null
    }
    setIsActive(false)
  }, [])

  const toggleWakeLock = useCallback(async () => {
    if (isActive) {
      await releaseLock()
    } else {
      await requestLock()
    }
  }, [isActive, releaseLock, requestLock])

  // Re-adquirir automaticamente quando a aba volta ao foco se devia estar ativa
  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'visible' && shouldBeActiveRef.current && !sentinelRef.current) {
        await requestLock()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [requestLock])

  // Ativação inicial se defaultActive for true
  useEffect(() => {
    if (defaultActive) {
      requestLock()
    }
    return () => {
      if (sentinelRef.current) {
        sentinelRef.current.release().catch(() => {})
      }
    }
  }, [defaultActive, requestLock])

  return {
    isSupported,
    isActive,
    toggleWakeLock,
    requestLock,
    releaseLock,
  }
}
