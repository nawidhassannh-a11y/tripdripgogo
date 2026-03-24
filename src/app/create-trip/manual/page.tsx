'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, ArrowRight, Plus, Trash2, GripVertical, Check } from 'lucide-react'
import { useTripStore } from '@/store/tripStore'
import { DESTINATIONS } from '@/data/destinations'
import { cn } from '@/lib/utils'
import { nanoid } from 'nanoid'
import type { Stop } from '@/types'

/* ── Helpers ─────────────────────────────────────────────────────────────── */

function nanoidShort() {
  // nanoid might not be installed — fallback to Math.random
  try { return nanoid(8) } catch { return Math.random().toString(36).slice(2, 10) }
}

/* ── Step 1: Trip name ───────────────────────────────────────────────────── */
function StepName({ name, emoji, onChange }: {
  name: string; emoji: string
  onChange: (name: string, emoji: string) => void
}) {
  const EMOJIS = ['✈️', '🎒', '🌏', '🗺️', '🏖️', '🏔️', '🌴', '🚂', '🛵', '⛵']
  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Name your trip</h2>
      <p className="text-gray-500 text-sm mb-6">Give it a name you&apos;ll recognize.</p>

      {/* Emoji picker */}
      <div className="flex gap-2 flex-wrap mb-4">
        {EMOJIS.map(e => (
          <button
            key={e}
            onClick={() => onChange(name, e)}
            className={cn(
              'w-10 h-10 rounded-xl text-xl flex items-center justify-center transition-all',
              emoji === e
                ? 'bg-primary-100 dark:bg-primary-900 ring-2 ring-primary-500'
                : 'bg-white dark:bg-slate-800 hover:bg-gray-50'
            )}
          >
            {e}
          </button>
        ))}
      </div>

      <input
        type="text"
        placeholder="SEA Loop 2025"
        value={name}
        maxLength={40}
        onChange={e => onChange(e.target.value, emoji)}
        className="input text-base"
        autoFocus
      />
    </div>
  )
}

/* ── Step 2: Budget ──────────────────────────────────────────────────────── */
function StepBudget({ budget, onChange }: { budget: number; onChange: (v: number) => void }) {
  const PRESETS = [500, 1000, 1500, 2000, 3000, 5000]
  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Total budget</h2>
      <p className="text-gray-500 text-sm mb-6">How much are you taking for this trip?</p>

      <div className="relative mb-4">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">€</span>
        <input
          type="number"
          min={100}
          max={100000}
          step={50}
          value={budget || ''}
          onChange={e => onChange(Number(e.target.value))}
          placeholder="2000"
          className="input pl-9 text-2xl font-bold"
        />
      </div>

      <div className="grid grid-cols-3 gap-2">
        {PRESETS.map(p => (
          <button
            key={p}
            onClick={() => onChange(p)}
            className={cn(
              'py-2 rounded-xl border-2 text-sm font-semibold transition-all',
              budget === p
                ? 'border-primary-500 bg-primary-50 dark:bg-primary-950 text-primary-700 dark:text-primary-300'
                : 'border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-300'
            )}
          >
            €{p.toLocaleString()}
          </button>
        ))}
      </div>
    </div>
  )
}

/* ── Step 3: Add stops ───────────────────────────────────────────────────── */
function StopCard({ stop, onRemove, onUpdate, index }: {
  stop: Stop
  index: number
  onRemove: () => void
  onUpdate: (s: Partial<Stop>) => void
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="card p-4"
    >
      <div className="flex items-center gap-2 mb-3">
        <GripVertical size={16} className="text-gray-300 shrink-0" />
        <div className="w-6 h-6 rounded-full bg-primary-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
          {index + 1}
        </div>
        <span className="font-semibold text-sm text-gray-900 dark:text-white flex-1">{stop.city}, {stop.country}</span>
        <button onClick={onRemove} className="text-gray-300 hover:text-red-400 transition-colors">
          <Trash2 size={15} />
        </button>
      </div>

      <div className="flex gap-2">
        <div className="flex-1">
          <label className="text-[10px] text-gray-400 uppercase font-semibold tracking-wider mb-1 block">Days</label>
          <input
            type="number"
            min={1}
            max={90}
            value={stop.days}
            onChange={e => onUpdate({ days: Number(e.target.value) })}
            className="input text-sm py-2 text-center"
          />
        </div>
        <div className="flex-1">
          <label className="text-[10px] text-gray-400 uppercase font-semibold tracking-wider mb-1 block">€/day</label>
          <input
            type="number"
            min={5}
            max={1000}
            value={stop.budgetPerDay}
            onChange={e => onUpdate({ budgetPerDay: Number(e.target.value) })}
            className="input text-sm py-2 text-center"
          />
        </div>
      </div>
    </motion.div>
  )
}

function StepStops({ stops, region, onAdd, onRemove, onUpdate }: {
  stops: Stop[]
  region: string
  onAdd: (s: Stop) => void
  onRemove: (id: string) => void
  onUpdate: (id: string, s: Partial<Stop>) => void
}) {
  const [query, setQuery] = useState('')
  const [showSearch, setShowSearch] = useState(false)

  const regionDests = DESTINATIONS.filter(d => d.region === region || region === '')
  const filtered = query.length >= 1
    ? regionDests.filter(d =>
        d.city.toLowerCase().includes(query.toLowerCase()) ||
        d.country.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 6)
    : regionDests.slice(0, 8)

  const alreadyAdded = new Set(stops.map(s => s.city))

  function addStop(dest: typeof filtered[0]) {
    onAdd({
      id: nanoidShort(),
      city: dest.city,
      country: dest.country,
      countryCode: dest.countryCode,
      days: 4,
      budgetPerDay: dest.budgetPerDay.backpacker,
      character: dest.character[0],
      isActive: false,
      isCompleted: false,
    })
    setQuery('')
    setShowSearch(false)
  }

  const totalDays = stops.reduce((s, st) => s + st.days, 0)

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Add stops</h2>
        {totalDays > 0 && (
          <span className="text-xs font-semibold text-primary-600 bg-primary-50 dark:bg-primary-950 px-2.5 py-1 rounded-full">
            {totalDays} days total
          </span>
        )}
      </div>
      <p className="text-gray-500 text-sm mb-5">Build your route stop by stop.</p>

      {/* Stop list */}
      <div className="space-y-2 mb-4">
        <AnimatePresence>
          {stops.map((stop, i) => (
            <StopCard
              key={stop.id}
              stop={stop}
              index={i}
              onRemove={() => onRemove(stop.id)}
              onUpdate={u => onUpdate(stop.id, u)}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* Add stop */}
      {showSearch ? (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
          <input
            type="text"
            placeholder="Search city or country..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="input text-sm"
            autoFocus
          />
          <div className="grid grid-cols-2 gap-1.5 max-h-52 overflow-y-auto">
            {filtered.map(dest => (
              <button
                key={`${dest.city}-${dest.country}`}
                onClick={() => addStop(dest)}
                disabled={alreadyAdded.has(dest.city)}
                className={cn(
                  'flex items-center gap-2 p-2.5 rounded-xl text-left text-sm transition-all',
                  alreadyAdded.has(dest.city)
                    ? 'opacity-40 cursor-not-allowed bg-gray-50 dark:bg-slate-800'
                    : 'bg-white dark:bg-slate-800 hover:bg-primary-50 dark:hover:bg-primary-950 border border-gray-100 dark:border-slate-700'
                )}
              >
                <span className="text-base shrink-0">{dest.emoji}</span>
                <div className="min-w-0">
                  <p className="font-medium text-gray-900 dark:text-white truncate text-xs">{dest.city}</p>
                  <p className="text-gray-400 text-[10px] truncate">{dest.country}</p>
                </div>
                {alreadyAdded.has(dest.city) && <Check size={12} className="text-primary-500 ml-auto" />}
              </button>
            ))}
          </div>
          <button onClick={() => setShowSearch(false)} className="text-xs text-gray-400 w-full text-center py-1">
            Cancel
          </button>
        </motion.div>
      ) : (
        <button
          onClick={() => setShowSearch(true)}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed border-gray-200 dark:border-slate-700 text-gray-500 hover:border-primary-300 hover:text-primary-600 transition-all text-sm font-medium"
        >
          <Plus size={16} /> Add stop
        </button>
      )}
    </div>
  )
}

/* ── Main page ────────────────────────────────────────────────────────────── */

const TOTAL_STEPS = 3

export default function ManualBuilderPage() {
  const router = useRouter()
  const { addTrip, setActiveTrip } = useTripStore()

  const [step, setStep] = useState(0)
  const [direction, setDirection] = useState(1)
  const [tripName, setTripName] = useState('')
  const [emoji, setEmoji] = useState('✈️')
  const [budget, setBudget] = useState(2000)
  const [stops, setStops] = useState<Stop[]>([])

  // Detect region from onboarding store or default SEA
  const region = 'SEA'

  const stepValid = [
    tripName.trim().length > 0,
    budget >= 100,
    stops.length >= 1,
  ]

  const variants = {
    enter: (d: number) => ({ opacity: 0, x: d > 0 ? 40 : -40 }),
    center: { opacity: 1, x: 0 },
    exit:  (d: number) => ({ opacity: 0, x: d > 0 ? -40 : 40 }),
  }

  function addStop(s: Stop) { setStops(prev => [...prev, s]) }
  function removeStop(id: string) { setStops(prev => prev.filter(s => s.id !== id)) }
  function updateStop(id: string, u: Partial<Stop>) {
    setStops(prev => prev.map(s => s.id === id ? { ...s, ...u } : s))
  }

  function goNext() {
    if (step < TOTAL_STEPS - 1) { setDirection(1); setStep(s => s + 1) }
  }
  function goBack() {
    if (step > 0) { setDirection(-1); setStep(s => s - 1) }
    else router.back()
  }

  function save() {
    const id = nanoidShort()
    addTrip({
      id,
      name: tripName.trim() || 'My Trip',
      emoji,
      totalBudget: budget,
      region,
      durationWeeks: Math.ceil(stops.reduce((s, st) => s + st.days, 0) / 7),
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
      <header className="max-w-md mx-auto w-full px-5 pt-6 pb-2 flex items-center justify-between">
        <button
          onClick={goBack}
          className="w-9 h-9 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-800"
        >
          <ArrowLeft size={20} />
        </button>

        <div className="flex items-center gap-1.5">
          {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
            <div key={i} className={cn(
              'rounded-full transition-all duration-300',
              i === step ? 'w-6 h-2 bg-primary-500' : i < step ? 'w-2 h-2 bg-primary-300' : 'w-2 h-2 bg-gray-200 dark:bg-slate-700'
            )} />
          ))}
        </div>

        <span className="text-xs text-gray-400">{step + 1}/{TOTAL_STEPS}</span>
      </header>

      <main className="flex-1 max-w-md mx-auto w-full px-5 pt-4 pb-4 overflow-hidden">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={step}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.25, ease: 'easeInOut' }}
          >
            {step === 0 && <StepName name={tripName} emoji={emoji} onChange={(n, e) => { setTripName(n); setEmoji(e) }} />}
            {step === 1 && <StepBudget budget={budget} onChange={setBudget} />}
            {step === 2 && <StepStops stops={stops} region={region} onAdd={addStop} onRemove={removeStop} onUpdate={updateStop} />}
          </motion.div>
        </AnimatePresence>
      </main>

      <footer className="max-w-md mx-auto w-full px-5 pb-8 pt-3">
        {step < TOTAL_STEPS - 1 ? (
          <button
            onClick={goNext}
            disabled={!stepValid[step]}
            className={cn('btn-primary w-full justify-center py-4', !stepValid[step] && 'opacity-40 cursor-not-allowed')}
          >
            Continue <ArrowRight size={18} />
          </button>
        ) : (
          <button
            onClick={save}
            disabled={stops.length === 0}
            className={cn('btn-primary w-full justify-center py-4', stops.length === 0 && 'opacity-40 cursor-not-allowed')}
          >
            Create trip <ArrowRight size={18} />
          </button>
        )}
      </footer>
    </div>
  )
}
