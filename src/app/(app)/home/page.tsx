'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, X, ArrowRight } from 'lucide-react'
import { useTripStore } from '@/store/tripStore'
import { AddExpenseSheet } from '@/components/AddExpenseSheet'
import { searchDestinations, DESTINATIONS, type Destination } from '@/data/destinations'
import { cn } from '@/lib/utils'
import type { Stop, Trip } from '@/types'

// Must-see cities shown by default
const MUST_SEE: string[] = [
  'Bangkok', 'Bali', 'Barcelona', 'Lisbon', 'Tokyo',
  'Medellín', 'Chiang Mai', 'Ho Chi Minh', 'Tbilisi', 'Cape Town',
  'Hanoi', 'Budapest', 'Mexico City', 'Kathmandu', 'Istanbul',
  'Marrakech', 'Singapore', 'Prague', 'Buenos Aires', 'Cusco',
]

const MUST_SEE_DESTS = MUST_SEE
  .map(city => DESTINATIONS.find(d => d.city === city))
  .filter(Boolean) as Destination[]

export default function HomePage() {
  const { addTrip, setActiveTrip, profile } = useTripStore()
  const router = useRouter()
  const [sheetOpen, setSheetOpen] = useState(false)

  const [budget, setBudget] = useState(1500)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Destination[]>([])
  const [picked, setPicked] = useState<Destination | null>(null)

  const travelerType = profile?.travelerType ?? 'budget'

  useEffect(() => {
    setResults(query.length >= 1 ? searchDestinations(query) : [])
  }, [query])

  function pick(dest: Destination) {
    setPicked(dest)
    setQuery('')
    setResults([])
  }

  function clear() {
    setPicked(null)
    setQuery('')
  }

  function go() {
    if (!picked) return
    const days = Math.max(3, Math.round(budget / picked.budgetPerDay[travelerType]))
    const stop: Stop = {
      id: Math.random().toString(36).slice(2, 10),
      city: picked.city,
      country: picked.country,
      countryCode: picked.countryCode,
      days,
      budgetPerDay: picked.budgetPerDay[travelerType],
      character: picked.character.join(', '),
      isActive: true,
      isCompleted: false,
    }
    const newTrip: Trip = {
      id: Math.random().toString(36).slice(2, 10),
      name: `${picked.city} ${new Date().getFullYear()}`,
      emoji: picked.emoji,
      totalBudget: budget,
      createdAt: new Date().toISOString(),
      stops: [stop],
      flights: [],
      region: picked.region,
    }
    addTrip(newTrip)
    setActiveTrip(newTrip.id)
    router.push('/trip')
  }

  return (
    <div className="min-h-[calc(100dvh-64px)] bg-surface dark:bg-surface-dark">

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="px-5 pt-7 pb-2">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Where next?</h1>
        <p className="text-gray-400 text-sm mt-0.5">Set your budget, pick a city.</p>
      </div>

      {/* ── Budget ─────────────────────────────────────────────────────── */}
      <div className="px-5 pt-4 pb-2">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Budget</span>
          <span className="text-xl font-bold text-primary-600">€{budget.toLocaleString()}</span>
        </div>
        <input type="range" min={200} max={8000} step={50} value={budget}
          onChange={e => setBudget(+e.target.value)}
          className="w-full accent-primary-500 h-1.5" />
        <div className="flex justify-between text-[10px] text-gray-400 mt-1">
          <span>€200</span><span>€8,000</span>
        </div>
      </div>

      {/* ── Destination search ──────────────────────────────────────────── */}
      <div className="px-5 pt-3">
        {picked ? (
          // Picked state
          <div className="flex items-center gap-3 p-4 rounded-2xl bg-primary-500 text-white">
            <span className="text-2xl">{picked.emoji}</span>
            <div className="flex-1">
              <p className="font-bold">{picked.city}, {picked.country}</p>
              <p className="text-white/70 text-xs">~{Math.max(3, Math.round(budget / picked.budgetPerDay[travelerType]))} days · €{picked.budgetPerDay[travelerType]}/day</p>
            </div>
            <button onClick={clear} className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center">
              <X size={14} />
            </button>
          </div>
        ) : (
          // Search state
          <div className="relative">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text" value={query} onChange={e => setQuery(e.target.value)}
              placeholder="Search city or country…"
              className="input pl-10 text-sm"
              autoComplete="off"
            />
            {query.length > 0 && (
              <button onClick={() => setQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2">
                <X size={14} className="text-gray-400" />
              </button>
            )}
          </div>
        )}

        {/* Search results */}
        <AnimatePresence>
          {results.length > 0 && (
            <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="mt-1 card shadow-lg overflow-hidden divide-y divide-gray-100 dark:divide-slate-700 z-20 relative">
              {results.map(dest => (
                <button key={dest.city} onClick={() => pick(dest)}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-slate-800 text-left">
                  <span className="text-xl">{dest.emoji}</span>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{dest.city}</p>
                    <p className="text-xs text-gray-400">{dest.country}</p>
                  </div>
                  <span className="text-xs text-primary-600 font-semibold">€{dest.budgetPerDay[travelerType]}/day</span>
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Go button */}
        {picked && (
          <motion.button initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            onClick={go}
            className="btn-primary w-full justify-center py-4 mt-3 text-base">
            Start trip <ArrowRight size={18} />
          </motion.button>
        )}
      </div>

      {/* ── Divider ──────────────────────────────────────────────────────── */}
      <div className="px-5 pt-6 pb-3">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Must-see cities</p>
      </div>

      {/* ── Must-see grid ────────────────────────────────────────────────── */}
      <div className="px-5 grid grid-cols-2 gap-2 pb-8">
        {MUST_SEE_DESTS.map((dest, i) => (
          <motion.button
            key={dest.city}
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
            onClick={() => pick(dest)}
            className={cn(
              'flex items-center gap-3 p-3 rounded-xl text-left transition-all active:scale-95',
              picked?.city === dest.city
                ? 'bg-primary-50 dark:bg-primary-950 ring-2 ring-primary-500'
                : 'bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700'
            )}
          >
            <span className="text-2xl leading-none">{dest.emoji}</span>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{dest.city}</p>
              <p className="text-[10px] text-gray-400 truncate">{dest.country} · €{dest.budgetPerDay[travelerType]}/d</p>
            </div>
          </motion.button>
        ))}
      </div>

      <AddExpenseSheet open={sheetOpen} onClose={() => setSheetOpen(false)} />
    </div>
  )
}
