'use client'

import { useEffect, useState } from 'react'

/**
 * Prevents SSR/hydration mismatch for Zustand persist stores.
 * Renders children only after the store has rehydrated from localStorage.
 */
export function HydrationGuard({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  if (!mounted) return null
  return <>{children}</>
}
