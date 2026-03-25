'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, ExternalLink, Plane, MapPin, Check, Clock, X } from 'lucide-react'
import { useTripStore } from '@/store/tripStore'
import { cn } from '@/lib/utils'
import type { Stop } from '@/types'

const TripMap = dynamic(() => import('@/components/TripMap').then(m => ({ default: m.TripMap })), {
  ssr: false,
  loading: () => <div className="h-48 bg-gray-100 dark:bg-slate-800 rounded-xl animate-pulse" />,
})

const AFFILIATE_LINKS = [
  { label: 'Google Flights', desc: 'Best flight search',     emoji: '✈️', href: 'https://www.google.com/flights', color: 'bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800' },
  { label: 'Hostelworld',    desc: 'Hostels worldwide',      emoji: '🏠', href: 'https://www.hostelworld.com',   color: 'bg-orange-50 dark:bg-orange-950 border-orange-200 dark:border-orange-800' },
  { label: 'Airalo eSIM',   desc: 'Data in 200+ countries', emoji: '📶', href: 'https://www.airalo.com',        color: 'bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800' },
  { label: 'SafetyWing',    desc: 'Travel insurance',       emoji: '🛡️', href: 'https://safetywing.com',        color: 'bg-purple-50 dark:bg-purple-950 border-purple-200 dark:border-purple-800' },
]

function AddStopSheet({ tripId, onClose }: { tripId: string; onClose: () => void }) {
  const { addStop } = useTripStore()
  const [city, setCity] = useState('')
  const [country, setCountry] = useState('')
  const [countryCode, setCountryCode] = useState('')
  const [days, setDays] = useState(7)
  const [budget, setBudget] = useState(40)

  function handleSave() {
    if (!city.trim() || !country.trim()) return
    const stop: Stop = {
      id: Math.random().toString(36).slice(2, 10),
      city: city.trim(),
      country: country.trim(),
      countryCode: countryCode.trim().toUpperCase() || 'XX',
      days,
      budgetPerDay: budget,
      isActive: false,
      isCompleted: false,
    }
    addStop(tripId, stop)
    onClose()
  }

  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/40 z-40" onClick={onClose} />
      <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md z-50 bg-white dark:bg-slate-900 rounded-t-2xl shadow-2xl px-5 pb-10 pt-4">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold text-gray-900 dark:text-white text-lg">Add stop</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 dark:bg-slate-800 flex items-center justify-center">
            <X size={15} className="text-gray-500" />
          </button>
        </div>

        <div className="space-y-3">
          <input value={city} onChange={e => setCity(e.target.value)} placeholder="City (e.g. Chiang Mai)"
            className="input text-sm" autoFocus />
          <div className="flex gap-2">
            <input value={country} onChange={e => setCountry(e.target.value)} placeholder="Country"
              className="input text-sm flex-1" />
            <input value={countryCode} onChange={e => setCountryCode(e.target.value)} placeholder="CC"
              className="input text-sm w-16 text-center uppercase" maxLength={2} />
          </div>

          <div className="card p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700 dark:text-gray-300">Days</span>
              <span className="font-bold text-primary-600">{days}</span>
            </div>
            <input type="range" min={1} max={60} value={days} onChange={e => setDays(+e.target.value)}
              className="w-full accent-primary-500" />
          </div>

          <div className="card p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700 dark:text-gray-300">Budget / day</span>
              <span className="font-bold text-primary-600">€{budget}</span>
            </div>
            <input type="range" min={10} max={200} step={5} value={budget} onChange={e => setBudget(+e.target.value)}
              className="w-full accent-primary-500" />
            <div className="flex justify-between text-[10px] text-gray-400">
              <span>€10 budget</span><span>€80 comfort</span><span>€200 luxury</span>
            </div>
          </div>
        </div>

        <button onClick={handleSave} disabled={!city.trim() || !country.trim()}
          className={cn('btn-primary w-full justify-center py-3.5 mt-5', (!city.trim() || !country.trim()) && 'opacity-40 cursor-not-allowed')}>
          Add to route
        </button>
      </motion.div>
    </>
  )
}

export default function TripPage() {
  const { activeTrip, updateStop, trackEvent } = useTripStore()
  const [mapExpanded, setMapExpanded] = useState(false)
  const [addStopOpen, setAddStopOpen] = useState(false)

  const trip = activeTrip()

  if (!trip) {
    return (
      <div className="min-h-[calc(100dvh-64px)] flex flex-col items-center justify-center px-6 text-center">
        <div className="text-4xl mb-3">🗺️</div>
        <p className="text-gray-500 text-sm">No active trip. <a href="/create-trip" className="text-primary-600 underline">Create one</a></p>
      </div>
    )
  }

  const completedStops = trip.stops.filter(s => s.isCompleted).length
  const totalStops = trip.stops.length

  return (
    <div className="px-4 pt-5 pb-2 space-y-4">
      <div>
        <p className="text-xs text-gray-400 font-medium">Route</p>
        <h1 className="font-bold text-xl text-gray-900 dark:text-white">{trip.emoji} {trip.name}</h1>
        <p className="text-xs text-gray-400 mt-0.5">{completedStops}/{totalStops} stops done · {trip.durationWeeks} weeks</p>
      </div>

      {/* Map */}
      <div>
        <TripMap stops={trip.stops} className={cn('w-full transition-all duration-300', mapExpanded ? 'h-72' : 'h-48')} />
        <button onClick={() => setMapExpanded(p => !p)} className="text-xs text-primary-600 mt-1.5 w-full text-center">
          {mapExpanded ? 'Collapse map ↑' : 'Expand map ↓'}
        </button>
      </div>

      {/* Stops */}
      <div>
        <div className="flex items-center justify-between mb-2.5">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Stops</p>
          <button onClick={() => setAddStopOpen(true)} className="text-xs text-primary-600 font-semibold flex items-center gap-1">
            <Plus size={12} /> Add stop
          </button>
        </div>

        <div className="relative">
          <div className="absolute left-[19px] top-6 bottom-6 w-px bg-gray-100 dark:bg-slate-700" />
          <div className="space-y-3">
            {trip.stops.map((stop, i) => (
              <motion.div key={stop.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}
                className="flex items-start gap-3">
                <div className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center shrink-0 z-10 text-sm border-2',
                  stop.isCompleted ? 'bg-gray-100 dark:bg-slate-800 border-gray-200 dark:border-slate-600 text-gray-400' :
                  stop.isActive ? 'bg-primary-500 border-primary-500 text-white' :
                  'bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-600 text-gray-500'
                )}>
                  {stop.isCompleted ? <Check size={16} /> : stop.isActive ? <MapPin size={16} /> : i + 1}
                </div>
                <div className={cn('flex-1 card p-3', stop.isActive && 'border-primary-200 dark:border-primary-800')}>
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="font-semibold text-sm text-gray-900 dark:text-white">{stop.city}</p>
                        {stop.isActive && <span className="text-[10px] bg-primary-500 text-white px-1.5 py-0.5 rounded-full font-bold">NOW</span>}
                      </div>
                      <p className="text-xs text-gray-400">{stop.country} · {stop.days} days · €{stop.budgetPerDay}/day</p>
                    </div>
                    <button
                      onClick={() => {
                        updateStop(trip.id, stop.id, { isCompleted: !stop.isCompleted })
                        if (!stop.isCompleted) trackEvent('check_in', { stopId: stop.id })
                      }}
                      className={cn('text-xs px-2 py-1 rounded-lg transition-all', stop.isCompleted ? 'bg-gray-100 dark:bg-slate-700 text-gray-500' : 'bg-primary-50 dark:bg-primary-950 text-primary-600')}
                    >
                      {stop.isCompleted ? 'Undo' : 'Done'}
                    </button>
                  </div>
                  {stop.character && (
                    <p className="text-[11px] text-gray-400 mt-1.5 italic">{stop.character}</p>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Flights */}
      {trip.flights && trip.flights.length > 0 && (
        <div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2.5">Flights</p>
          <div className="space-y-2">
            {trip.flights.map(flight => (
              <div key={flight.id} className="card p-3 flex items-center gap-3">
                <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center shrink-0',
                  flight.status === 'booked' ? 'bg-primary-50 dark:bg-primary-950' : 'bg-amber-50 dark:bg-amber-950')}>
                  <Plane size={15} className={flight.status === 'booked' ? 'text-primary-500' : 'text-amber-500'} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {flight.flightNumber ?? 'Flight to book'}
                  </p>
                  <p className="text-[10px] text-gray-400 flex items-center gap-1">
                    {flight.status === 'booked' ? <><Check size={10} className="text-primary-500" /> Booked</> : <><Clock size={10} /> To book</>}
                    {flight.price ? ` · €${flight.price}` : ''}
                  </p>
                </div>
                {flight.status !== 'booked' && (
                  <a href="https://www.google.com/flights" target="_blank" rel="noopener noreferrer"
                    className="text-xs text-primary-600 font-semibold flex items-center gap-1">
                    Search <ExternalLink size={11} />
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Smart links */}
      <div>
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2.5">Smart links</p>
        <div className="grid grid-cols-2 gap-2">
          {AFFILIATE_LINKS.map(link => (
            <a key={link.label} href={link.href} target="_blank" rel="noopener noreferrer"
              onClick={() => trackEvent('affiliate_click', { label: link.label })}
              className={cn('card p-3 border flex items-center gap-2.5 active:scale-95 transition-transform', link.color)}>
              <span className="text-xl">{link.emoji}</span>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-gray-900 dark:text-white truncate">{link.label}</p>
                <p className="text-[10px] text-gray-400 truncate">{link.desc}</p>
              </div>
              <ExternalLink size={11} className="text-gray-300 ml-auto shrink-0" />
            </a>
          ))}
        </div>
      </div>

      {/* Add Stop Sheet */}
      <AnimatePresence>
        {addStopOpen && (
          <AddStopSheet tripId={trip.id} onClose={() => setAddStopOpen(false)} />
        )}
      </AnimatePresence>
    </div>
  )
}
