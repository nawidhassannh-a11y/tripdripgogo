'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Plus, ArrowRight, X, MapPin } from 'lucide-react'
import { useTripStore } from '@/store/tripStore'
import { CategoryBadge } from '@/components/CategoryBadge'
import { AddExpenseSheet } from '@/components/AddExpenseSheet'
import { formatEur, budgetStatus } from '@/lib/utils'
import { cn } from '@/lib/utils'
import { searchDestinations, REGIONS, type Destination } from '@/data/destinations'
import type { Stop, Trip } from '@/types'

const BUDGET_PRESETS = [500, 1000, 1500, 2000, 3000, 5000]

function TripGenerator() {
  const { addTrip, setActiveTrip, profile } = useTripStore()
  const router = useRouter()

  const [budget, setBudget] = useState(1500)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Destination[]>([])
  const [picks, setPicks] = useState<Destination[]>([])
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setResults(query.length >= 1 ? searchDestinations(query) : [])
  }, [query])

  function addPick(dest: Destination) {
    if (picks.find(p => p.city === dest.city)) return
    setPicks(prev => [...prev, dest])
    setQuery('')
    setResults([])
  }

  function removePick(city: string) {
    setPicks(prev => prev.filter(p => p.city !== city))
  }

  function buildAndGo() {
    if (picks.length === 0) return
    const travelerType = profile?.travelerType ?? 'budget'
    const stops: Stop[] = picks.map((d, i) => ({
      id: Math.random().toString(36).slice(2, 10),
      city: d.city,
      country: d.country,
      countryCode: d.countryCode,
      days: Math.round((budget / picks.length) / d.budgetPerDay[travelerType]),
      budgetPerDay: d.budgetPerDay[travelerType],
      character: d.character.join(', '),
      isActive: i === 0,
      isCompleted: false,
    }))
    const trip: Trip = {
      id: Math.random().toString(36).slice(2, 10),
      name: picks.map(p => p.city).join(' → '),
      emoji: picks[0].emoji,
      totalBudget: budget,
      createdAt: new Date().toISOString(),
      stops,
      flights: [],
      region: picks[0].region,
    }
    addTrip(trip)
    setActiveTrip(trip.id)
    router.push('/trip')
  }

  return (
    <div className="px-4 pt-6 pb-4 space-y-4">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">Plan a trip</h1>
        <p className="text-sm text-gray-400 mt-0.5">Budget + destinations → route ready in seconds</p>
      </div>

      {/* Budget */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Budget</span>
          <span className="font-bold text-primary-600 text-lg">€{budget.toLocaleString()}</span>
        </div>
        <input type="range" min={200} max={10000} step={50} value={budget}
          onChange={e => setBudget(+e.target.value)}
          className="w-full accent-primary-500 h-1.5" />
        <div className="flex gap-1.5 flex-wrap">
          {BUDGET_PRESETS.map(p => (
            <button key={p} onClick={() => setBudget(p)}
              className={cn('px-2.5 py-1 rounded-full text-xs font-semibold transition-all',
                budget === p ? 'bg-primary-500 text-white' : 'bg-gray-100 dark:bg-slate-800 text-gray-500')}>
              €{p >= 1000 ? `${p / 1000}k` : p}
            </button>
          ))}
        </div>
      </div>

      {/* Destination search */}
      <div className="space-y-2">
        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Where to?</span>

        {/* Selected picks */}
        {picks.length > 0 && (
          <div className="flex gap-1.5 flex-wrap">
            {picks.map(p => (
              <span key={p.city}
                className="flex items-center gap-1 pl-2 pr-1 py-1 bg-primary-50 dark:bg-primary-950 text-primary-700 dark:text-primary-300 rounded-full text-xs font-semibold">
                {p.emoji} {p.city}
                <button onClick={() => removePick(p.city)} className="w-4 h-4 rounded-full flex items-center justify-center hover:bg-primary-200 dark:hover:bg-primary-800">
                  <X size={10} />
                </button>
              </span>
            ))}
          </div>
        )}

        {/* Search input */}
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search city or country…"
            className="input pl-9 text-sm"
          />
        </div>

        {/* Results dropdown */}
        <AnimatePresence>
          {results.length > 0 && (
            <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
              className="card overflow-hidden divide-y divide-gray-100 dark:divide-slate-700 shadow-lg">
              {results.map(dest => (
                <button key={dest.city} onClick={() => addPick(dest)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 dark:hover:bg-slate-800 text-left transition-colors">
                  <span className="text-xl">{dest.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{dest.city}</p>
                    <p className="text-xs text-gray-400">{dest.country}</p>
                  </div>
                  <span className="text-xs text-primary-600 font-semibold shrink-0">€{dest.budgetPerDay[profile?.travelerType ?? 'budget']}/day</span>
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Region quick-picks */}
        {picks.length === 0 && query.length === 0 && (
          <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
            {REGIONS.map(r => (
              <button key={r.value}
                onClick={() => {
                  const top = searchDestinations(r.label.split(' ')[0])
                  if (top[0]) addPick(top[0])
                }}
                className="shrink-0 flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-semibold bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-400 hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors">
                {r.emoji} {r.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* CTA */}
      <button
        onClick={buildAndGo}
        disabled={picks.length === 0}
        className={cn('btn-primary w-full justify-center py-4 text-base', picks.length === 0 && 'opacity-40 cursor-not-allowed')}>
        Build route <ArrowRight size={18} />
      </button>
    </div>
  )
}

export default function HomePage() {
  const { activeTrip, activeTripExpenses, totalSpent } = useTripStore()
  const [sheetOpen, setSheetOpen] = useState(false)

  const trip = activeTrip()
  const expenses = activeTripExpenses()
  const spent = totalSpent()

  const remaining = trip ? trip.totalBudget - spent : 0
  const pct = trip && trip.totalBudget > 0 ? Math.min(100, (spent / trip.totalBudget) * 100) : 0
  const status = budgetStatus(Math.round(pct))
  const activeStop = trip?.stops.find(s => s.isActive) ?? trip?.stops[0]
  const recent = expenses.slice(0, 6)

  const heroGradient =
    status === 'danger'  ? 'from-red-500 to-red-600' :
    status === 'warning' ? 'from-amber-500 to-orange-500' :
                           'from-primary-500 to-emerald-600'

  const r = 54, circ = 2 * Math.PI * r, dash = circ * (1 - pct / 100)

  return (
    <div className="min-h-[calc(100dvh-64px)] pb-24">

      {/* ── Trip Generator (always visible at top) ──────────────────────── */}
      <TripGenerator />

      {/* ── Active Trip Dashboard (only when trip exists) ───────────────── */}
      {trip && (
        <>
          <div className="px-4">
            <div className="h-px bg-gray-100 dark:bg-slate-800 mb-4" />
          </div>

          {/* Mini hero */}
          <div className={cn('mx-4 rounded-2xl bg-gradient-to-br text-white px-5 py-4 relative overflow-hidden', heroGradient)}>
            <div className="absolute -top-8 -right-8 w-36 h-36 rounded-full bg-white/10 blur-2xl pointer-events-none" />
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/60 text-xs mb-0.5">
                  {trip.emoji} {trip.name}
                  {activeStop && <span className="ml-1.5"><MapPin size={10} className="inline" /> {activeStop.city}</span>}
                </p>
                <p className="text-2xl font-bold">{formatEur(remaining)}</p>
                <p className="text-white/60 text-xs">{pct.toFixed(0)}% used · {formatEur(spent)} spent</p>
              </div>
              <svg width="60" height="60" viewBox="0 0 120 120" className="-rotate-90">
                <circle cx="60" cy="60" r={r} fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="12" />
                <motion.circle cx="60" cy="60" r={r} fill="none" stroke="white" strokeWidth="12"
                  strokeLinecap="round" strokeDasharray={circ}
                  initial={{ strokeDashoffset: circ }} animate={{ strokeDashoffset: dash }}
                  transition={{ duration: 0.8, ease: 'easeOut' }} />
              </svg>
            </div>
          </div>

          {/* Recent feed */}
          {recent.length > 0 && (
            <div className="px-4 mt-4">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Recent expenses</p>
              <div className="space-y-px">
                {recent.map(expense => (
                  <div key={expense.id} className="flex items-center gap-3 py-2.5 border-b border-gray-100 dark:border-slate-800 last:border-0">
                    <CategoryBadge category={expense.category} size="md" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{expense.label || expense.raw}</p>
                    </div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white shrink-0">{formatEur(expense.amountEur)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* ── FAB ─────────────────────────────────────────────────────────── */}
      {trip && (
        <button onClick={() => setSheetOpen(true)}
          className="fixed bottom-20 right-4 z-30 w-14 h-14 rounded-full bg-primary-500 flex items-center justify-center shadow-elevated active:scale-95 transition-transform">
          <Plus size={26} className="text-white" />
        </button>
      )}

      <AddExpenseSheet open={sheetOpen} onClose={() => setSheetOpen(false)} />
    </div>
  )
}
