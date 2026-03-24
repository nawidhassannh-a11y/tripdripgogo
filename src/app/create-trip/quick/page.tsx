'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft, ArrowRight, MapPin } from 'lucide-react'
import { useTripStore } from '@/store/tripStore'
import { DESTINATIONS } from '@/data/destinations'
import { cn } from '@/lib/utils'
import type { Stop } from '@/types'

function nanoidShort() {
  return Math.random().toString(36).slice(2, 10)
}

export default function QuickStartPage() {
  const router = useRouter()
  const { addTrip, setActiveTrip } = useTripStore()

  const [city, setCity]       = useState('')
  const [budget, setBudget]   = useState(500)
  const [query, setQuery]     = useState('')
  const [selectedDest, setSelectedDest] = useState<typeof DESTINATIONS[0] | null>(null)

  const filtered = query.length >= 1
    ? DESTINATIONS.filter(d =>
        d.city.toLowerCase().includes(query.toLowerCase()) ||
        d.country.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 6)
    : []

  function selectCity(dest: typeof DESTINATIONS[0]) {
    setSelectedDest(dest)
    setCity(dest.city)
    setQuery(dest.city)
  }

  function start() {
    const nanoid = nanoidShort
    const stopId = nanoid()
    const tripId = nanoid()

    const stop: Stop = {
      id: stopId,
      city: selectedDest?.city ?? city,
      country: selectedDest?.country ?? '',
      countryCode: selectedDest?.countryCode ?? '',
      days: 7,
      budgetPerDay: selectedDest ? selectedDest.budgetPerDay.backpacker : Math.round(budget / 7),
      character: selectedDest?.character[0] ?? 'city',
      isActive: true,
      isCompleted: false,
    }

    addTrip({
      id: tripId,
      name: `${stop.city} trip`,
      emoji: '⚡',
      totalBudget: budget,
      region: selectedDest?.region ?? 'SEA',
      durationWeeks: 1,
      stops: [stop],
      flights: [],
      createdAt: new Date().toISOString(),
    })
    setActiveTrip(tripId)
    router.push('/budget')
  }

  return (
    <div className="min-h-dvh flex flex-col bg-surface dark:bg-surface-dark">
      <header className="max-w-md mx-auto w-full px-5 pt-6 pb-4 flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="w-9 h-9 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-800"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <p className="font-semibold text-gray-900 dark:text-white text-sm">Quick-start</p>
          <p className="text-xs text-gray-400">You&apos;re already on the road</p>
        </div>
        <span className="ml-auto text-xl">⚡</span>
      </header>

      <main className="flex-1 max-w-md mx-auto w-full px-5 pb-6">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Where are you now?</h1>
          <p className="text-gray-500 text-sm mb-6">Start tracking expenses immediately.</p>

          {/* City search */}
          <div className="mb-4">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Current city</p>
            <div className="relative">
              <MapPin size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search your city..."
                value={query}
                onChange={e => { setQuery(e.target.value); setCity(e.target.value); setSelectedDest(null) }}
                className="input pl-10 text-sm"
                autoFocus
              />
            </div>

            {/* Suggestions */}
            {filtered.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-2 space-y-1"
              >
                {filtered.map(dest => (
                  <button
                    key={`${dest.city}-${dest.country}`}
                    onClick={() => selectCity(dest)}
                    className={cn(
                      'w-full flex items-center gap-3 p-3 rounded-xl text-left text-sm transition-all',
                      selectedDest?.city === dest.city
                        ? 'bg-primary-50 dark:bg-primary-950 border-2 border-primary-500'
                        : 'bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 hover:border-primary-200'
                    )}
                  >
                    <span className="text-xl">{dest.emoji}</span>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{dest.city}</p>
                      <p className="text-xs text-gray-400">{dest.country} · ~€{dest.budgetPerDay.backpacker}/day</p>
                    </div>
                  </button>
                ))}
              </motion.div>
            )}
          </div>

          {/* Remaining budget */}
          <div className="mb-6">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Remaining budget (€)</p>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">€</span>
              <input
                type="number"
                min={1}
                max={100000}
                step={50}
                value={budget}
                onChange={e => setBudget(Number(e.target.value))}
                className="input pl-9 text-2xl font-bold"
              />
            </div>
            <p className="text-xs text-gray-400 mt-2">How much cash/card budget do you have left?</p>
          </div>

          {/* Info card */}
          <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-xl p-4 mb-6">
            <p className="text-sm font-semibold text-amber-800 dark:text-amber-200 mb-1">⚡ Quick-start mode</p>
            <p className="text-xs text-amber-700 dark:text-amber-300 leading-relaxed">
              We&apos;ll create a single active stop with your current location. Start logging expenses immediately — you can add more stops and details later.
            </p>
          </div>
        </motion.div>
      </main>

      <footer className="max-w-md mx-auto w-full px-5 pb-8 pt-3">
        <button
          onClick={start}
          disabled={!city.trim() || budget < 1}
          className={cn('btn-primary w-full justify-center py-4', (!city.trim() || budget < 1) && 'opacity-40 cursor-not-allowed')}
        >
          Start tracking <ArrowRight size={18} />
        </button>
      </footer>
    </div>
  )
}
