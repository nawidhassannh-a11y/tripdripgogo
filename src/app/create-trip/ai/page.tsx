'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, ArrowRight, Sparkles, Loader2, Check, RefreshCw } from 'lucide-react'
import { useTripStore } from '@/store/tripStore'
import { cn } from '@/lib/utils'
import type { Stop } from '@/types'

/* ── Types ──────────────────────────────────────────────────────────────── */

interface SuggestedStop {
  city: string
  country: string
  countryCode: string
  days: number
  budgetPerDay: number
  character: string
  note: string
}

/* ── Data ────────────────────────────────────────────────────────────────── */

const REGIONS = [
  { value: 'SEA',        label: 'Southeast Asia',  emoji: '🌴' },
  { value: 'EUROPE',     label: 'Europe',           emoji: '🏰' },
  { value: 'LATAM',      label: 'Latin America',    emoji: '🦜' },
  { value: 'SOUTH_ASIA', label: 'South Asia',       emoji: '🕌' },
  { value: 'EAST_ASIA',  label: 'East Asia',        emoji: '🏯' },
  { value: 'AFRICA',     label: 'Africa',           emoji: '🦁' },
]

const VIBES = [
  { value: 'culture and history',  label: 'Culture',  emoji: '🏛️' },
  { value: 'beach and relaxation', label: 'Beach',    emoji: '🏖️' },
  { value: 'food and markets',     label: 'Food',     emoji: '🍜' },
  { value: 'nature and trekking',  label: 'Nature',   emoji: '🏔️' },
  { value: 'nightlife and party',  label: 'Party',    emoji: '🎉' },
  { value: 'chill and slow travel',label: 'Chill',    emoji: '😌' },
]

const TRAVELER_TYPES = [
  { value: 'backpacker',  label: 'Backpacker', emoji: '🎒' },
  { value: 'budget',      label: 'Budget',     emoji: '💰' },
  { value: 'comfort',     label: 'Comfort',    emoji: '🛋️' },
  { value: 'flashpacker', label: 'Flashpack',  emoji: '✨' },
]

/* ── Stop result card ────────────────────────────────────────────────────── */

function StopResultCard({ stop, index }: { stop: SuggestedStop; index: number }) {
  const CHARACTER_EMOJI: Record<string, string> = {
    beach: '🏖️', culture: '🏛️', city: '🏙️', nature: '🌿',
    party: '🎉', chill: '😌', mountains: '🏔️', food: '🍜',
  }
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07 }}
      className="card p-4 flex gap-3"
    >
      <div className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center text-white text-xs font-bold shrink-0 mt-0.5">
        {index + 1}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 mb-1">
          <div>
            <p className="font-semibold text-sm text-gray-900 dark:text-white">{stop.city}, {stop.country}</p>
            <p className="text-[10px] text-gray-400">{CHARACTER_EMOJI[stop.character] || '📍'} {stop.character}</p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-xs font-bold text-primary-600">€{stop.budgetPerDay}/day</p>
            <p className="text-[10px] text-gray-400">{stop.days} days</p>
          </div>
        </div>
        {stop.note && <p className="text-xs text-gray-500 dark:text-slate-400 leading-relaxed">{stop.note}</p>}
      </div>
    </motion.div>
  )
}

/* ── Main page ────────────────────────────────────────────────────────────── */

export default function AIRouteGeneratorPage() {
  const router = useRouter()
  const { addTrip, setActiveTrip, profile } = useTripStore()

  const [region, setRegion]         = useState('')
  const [budget, setBudget]         = useState(2000)
  const [weeks, setWeeks]           = useState(4)
  const [vibe, setVibe]             = useState('')
  const [traveler, setTraveler]     = useState(profile?.travelerType || 'backpacker')
  const [tripName, setTripName]     = useState('')

  const [status, setStatus]         = useState<'idle' | 'loading' | 'done' | 'error'>('idle')
  const [suggestedStops, setSuggestedStops] = useState<SuggestedStop[]>([])
  const [errorMsg, setErrorMsg]     = useState('')

  const perDay = weeks > 0 ? Math.round(budget / (weeks * 7)) : 0

  async function generate() {
    if (!region) return
    setStatus('loading')
    setErrorMsg('')

    try {
      const res = await fetch('/api/route-suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ region, budget, durationWeeks: weeks, travelerType: traveler, vibe }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Generation failed')
      setSuggestedStops(data.stops)
      setStatus('done')
      if (!tripName) {
        const regionLabel = REGIONS.find(r => r.value === region)?.label ?? region
        setTripName(`${regionLabel} ${new Date().getFullYear()}`)
      }
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Something went wrong')
      setStatus('error')
    }
  }

  function save() {
    const nanoidShort = () => Math.random().toString(36).slice(2, 10)
    const stops: Stop[] = suggestedStops.map(s => ({
      id: nanoidShort(),
      city: s.city,
      country: s.country,
      countryCode: s.countryCode,
      days: s.days,
      budgetPerDay: s.budgetPerDay,
      character: s.character,
      isActive: false,
      isCompleted: false,
    }))

    const id = nanoidShort()
    addTrip({
      id,
      name: tripName || 'AI Trip',
      emoji: '✨',
      totalBudget: budget,
      region,
      durationWeeks: weeks,
      stops,
      flights: [],
      createdAt: new Date().toISOString(),
    })
    setActiveTrip(id)
    router.push('/home')
  }

  return (
    <div className="min-h-dvh flex flex-col bg-surface dark:bg-surface-dark">
      {/* Header */}
      <header className="max-w-md mx-auto w-full px-5 pt-6 pb-4 flex items-center gap-3">
        <button
          onClick={() => status === 'done' ? setStatus('idle') : router.back()}
          className="w-9 h-9 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-800"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <p className="font-semibold text-gray-900 dark:text-white text-sm">AI Route Generator</p>
          <p className="text-xs text-gray-400">Powered by Claude</p>
        </div>
        <span className="ml-auto text-[10px] font-bold px-2 py-1 rounded-lg bg-violet-500 text-white">AI</span>
      </header>

      <main className="flex-1 max-w-md mx-auto w-full px-5 pb-6 overflow-y-auto">
        <AnimatePresence mode="wait">
          {status !== 'done' ? (
            /* ── Form ── */
            <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {/* Region */}
              <div className="mb-5">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Where to?</p>
                <div className="grid grid-cols-3 gap-2">
                  {REGIONS.map(r => (
                    <button
                      key={r.value}
                      onClick={() => setRegion(r.value)}
                      className={cn(
                        'flex flex-col items-center py-3 px-2 rounded-xl border-2 text-center transition-all',
                        region === r.value
                          ? 'border-primary-500 bg-primary-50 dark:bg-primary-950'
                          : 'border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800'
                      )}
                    >
                      <span className="text-xl mb-1">{r.emoji}</span>
                      <span className="text-[11px] font-medium text-gray-700 dark:text-slate-300 leading-tight">{r.label}</span>
                      {region === r.value && <Check size={12} className="text-primary-500 mt-0.5" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Budget + duration */}
              <div className="grid grid-cols-2 gap-3 mb-5">
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Budget (€)</p>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">€</span>
                    <input
                      type="number"
                      min={200}
                      max={50000}
                      step={100}
                      value={budget}
                      onChange={e => setBudget(Number(e.target.value))}
                      className="input pl-8 text-sm font-bold"
                    />
                  </div>
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Weeks</p>
                  <input
                    type="number"
                    min={1}
                    max={52}
                    value={weeks}
                    onChange={e => setWeeks(Number(e.target.value))}
                    className="input text-sm font-bold text-center"
                  />
                </div>
              </div>

              {perDay > 0 && (
                <div className="bg-primary-50 dark:bg-primary-950 rounded-xl px-4 py-2.5 mb-5 flex items-center justify-between">
                  <span className="text-xs text-primary-600">Daily allowance</span>
                  <span className="font-bold text-primary-700 dark:text-primary-300">€{perDay}/day</span>
                </div>
              )}

              {/* Traveler type */}
              <div className="mb-5">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Travel style</p>
                <div className="grid grid-cols-4 gap-1.5">
                  {TRAVELER_TYPES.map(t => (
                    <button
                      key={t.value}
                      onClick={() => setTraveler(t.value as typeof traveler)}
                      className={cn(
                        'flex flex-col items-center py-2.5 rounded-xl border-2 text-center transition-all',
                        traveler === t.value
                          ? 'border-primary-500 bg-primary-50 dark:bg-primary-950'
                          : 'border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800'
                      )}
                    >
                      <span className="text-lg mb-0.5">{t.emoji}</span>
                      <span className="text-[10px] font-medium text-gray-600 dark:text-slate-400">{t.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Vibe */}
              <div className="mb-6">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Trip vibe <span className="normal-case font-normal">(optional)</span></p>
                <div className="grid grid-cols-3 gap-2">
                  {VIBES.map(v => (
                    <button
                      key={v.value}
                      onClick={() => setVibe(prev => prev === v.value ? '' : v.value)}
                      className={cn(
                        'flex items-center gap-2 px-3 py-2 rounded-xl border-2 text-left text-xs font-medium transition-all',
                        vibe === v.value
                          ? 'border-primary-500 bg-primary-50 dark:bg-primary-950 text-primary-700 dark:text-primary-300'
                          : 'border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-600 dark:text-slate-400'
                      )}
                    >
                      <span>{v.emoji}</span> {v.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Generate button */}
              <button
                onClick={generate}
                disabled={!region || status === 'loading'}
                className={cn(
                  'w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-bold text-sm transition-all',
                  region
                    ? 'bg-gradient-to-r from-violet-500 to-primary-600 text-white shadow-elevated active:scale-95'
                    : 'bg-gray-100 dark:bg-slate-800 text-gray-400 cursor-not-allowed'
                )}
              >
                {status === 'loading' ? (
                  <><Loader2 size={18} className="animate-spin" /> Generating your route...</>
                ) : (
                  <><Sparkles size={18} /> Generate my route</>
                )}
              </button>

              {status === 'error' && (
                <p className="text-xs text-red-500 text-center mt-3">{errorMsg}</p>
              )}
            </motion.div>

          ) : (
            /* ── Results ── */
            <motion.div key="results" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="font-bold text-gray-900 dark:text-white">Your AI route</p>
                  <p className="text-xs text-gray-400">
                    {suggestedStops.reduce((s, st) => s + st.days, 0)} days ·
                    €{suggestedStops.reduce((s, st) => s + st.budgetPerDay * st.days, 0).toLocaleString()} total
                  </p>
                </div>
                <button
                  onClick={generate}
                  className="flex items-center gap-1.5 text-xs text-primary-600 font-semibold py-2 px-3 rounded-xl hover:bg-primary-50 dark:hover:bg-primary-950 transition-colors"
                >
                  <RefreshCw size={13} /> Regenerate
                </button>
              </div>

              <div className="space-y-2 mb-5">
                {suggestedStops.map((stop, i) => (
                  <StopResultCard key={`${stop.city}-${i}`} stop={stop} index={i} />
                ))}
              </div>

              {/* Trip name */}
              <div className="mb-4">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Trip name</p>
                <input
                  type="text"
                  value={tripName}
                  onChange={e => setTripName(e.target.value)}
                  placeholder="My AI Trip"
                  className="input text-sm"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {status === 'done' && (
        <footer className="max-w-md mx-auto w-full px-5 pb-8 pt-3">
          <button onClick={save} className="btn-primary w-full justify-center py-4">
            Save this route <ArrowRight size={18} />
          </button>
        </footer>
      )}
    </div>
  )
}
