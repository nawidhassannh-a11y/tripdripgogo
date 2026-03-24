'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Check, Trash2, RotateCcw, ExternalLink } from 'lucide-react'
import { useTripStore } from '@/store/tripStore'
import { cn } from '@/lib/utils'

const CURRENCIES = ['EUR', 'USD', 'GBP', 'AUD', 'CAD', 'CHF', 'SEK', 'NOK', 'DKK']
const TRAVELER_TYPES: { value: 'backpacker' | 'budget' | 'comfort' | 'flashpacker'; label: string; emoji: string }[] = [
  { value: 'backpacker', label: 'Backpacker', emoji: '🎒' },
  { value: 'budget',     label: 'Budget',     emoji: '💰' },
  { value: 'comfort',    label: 'Comfort',    emoji: '🛋️' },
  { value: 'flashpacker',label: 'Flashpacker',emoji: '✨' },
]

export default function SettingsPage() {
  const router = useRouter()
  const { profile, setProfile, trips, activeTripId, setActiveTrip } = useTripStore()

  const [name, setName]         = useState(profile?.name ?? '')
  const [currency, setCurrency] = useState(profile?.currency ?? 'EUR')
  const [traveler, setTraveler] = useState<'backpacker' | 'budget' | 'comfort' | 'flashpacker'>(profile?.travelerType ?? 'backpacker')
  const [saved, setSaved]       = useState(false)
  const [confirmReset, setConfirmReset] = useState(false)

  function save() {
    setProfile({ name, currency, homeCountry: profile?.homeCountry ?? '', travelerType: traveler as 'backpacker' | 'budget' | 'comfort' | 'flashpacker' })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  function resetAll() {
    if (!confirmReset) { setConfirmReset(true); return }
    localStorage.removeItem('tripdripgogo-store')
    window.location.href = '/'
  }

  return (
    <div className="px-4 pt-5 pb-10 space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="w-9 h-9 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-800">
          <ArrowLeft size={20} />
        </button>
        <h1 className="font-bold text-xl text-gray-900 dark:text-white">Settings</h1>
      </div>

      {/* Profile */}
      <div className="card p-4 space-y-3">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Profile</p>

        <div>
          <label className="text-xs text-gray-500 mb-1 block">Name</label>
          <input type="text" value={name} onChange={e => setName(e.target.value)}
            placeholder="Your name" className="input text-sm" />
        </div>

        <div>
          <label className="text-xs text-gray-500 mb-2 block">Home currency</label>
          <div className="flex flex-wrap gap-1.5">
            {CURRENCIES.map(c => (
              <button key={c} onClick={() => setCurrency(c)}
                className={cn('px-3 py-1.5 rounded-full text-xs font-semibold transition-all',
                  currency === c ? 'bg-primary-500 text-white' : 'bg-gray-100 dark:bg-slate-800 text-gray-500')}>
                {c}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-xs text-gray-500 mb-2 block">Travel style</label>
          <div className="grid grid-cols-2 gap-2">
            {TRAVELER_TYPES.map(t => (
              <button key={t.value} onClick={() => setTraveler(t.value)}
                className={cn('flex items-center gap-2 p-3 rounded-xl border-2 text-left transition-all',
                  traveler === t.value ? 'border-primary-500 bg-primary-50 dark:bg-primary-950' : 'border-gray-200 dark:border-slate-700')}>
                <span>{t.emoji}</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">{t.label}</span>
                {traveler === t.value && <Check size={14} className="text-primary-500 ml-auto" />}
              </button>
            ))}
          </div>
        </div>

        <button onClick={save} className={cn('btn-primary w-full justify-center py-3', saved && 'bg-primary-700')}>
          {saved ? <><Check size={16} /> Saved!</> : 'Save profile'}
        </button>
      </div>

      {/* Trips */}
      {trips.length > 1 && (
        <div className="card p-4">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Switch trip</p>
          <div className="space-y-2">
            {trips.map(trip => (
              <button key={trip.id} onClick={() => setActiveTrip(trip.id)}
                className={cn('w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all',
                  trip.id === activeTripId ? 'border-primary-500 bg-primary-50 dark:bg-primary-950' : 'border-gray-100 dark:border-slate-700')}>
                <span className="text-xl">{trip.emoji}</span>
                <div className="flex-1 text-left">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">{trip.name}</p>
                  <p className="text-xs text-gray-400">{trip.stops.length} stops · €{trip.totalBudget}</p>
                </div>
                {trip.id === activeTripId && <Check size={16} className="text-primary-500" />}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Links */}
      <div className="card p-4 space-y-2">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Info</p>
        <a href="https://github.com/nawidhassannh-a11y/tripdripgogo" target="_blank" rel="noopener noreferrer"
          className="flex items-center justify-between py-2.5 text-sm text-gray-700 dark:text-slate-300 hover:text-primary-600">
          GitHub repo <ExternalLink size={14} className="text-gray-300" />
        </a>
        <div className="h-px bg-gray-100 dark:bg-slate-700" />
        <div className="flex items-center justify-between py-1">
          <span className="text-xs text-gray-400">Version</span>
          <span className="text-xs font-mono text-gray-400">v0.1.0</span>
        </div>
      </div>

      {/* Danger zone */}
      <div className="card p-4 border-red-100 dark:border-red-900">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Danger zone</p>
        <button onClick={resetAll}
          className={cn('w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all',
            confirmReset ? 'bg-red-500 text-white' : 'bg-red-50 dark:bg-red-950 text-red-500')}>
          {confirmReset ? <><Trash2 size={15} /> Confirm — delete everything</> : <><RotateCcw size={15} /> Reset all data</>}
        </button>
        {confirmReset && (
          <p className="text-xs text-red-400 text-center mt-2">Tap again to confirm. This cannot be undone.</p>
        )}
      </div>
    </div>
  )
}
