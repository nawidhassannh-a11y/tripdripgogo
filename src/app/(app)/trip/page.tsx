'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, ExternalLink, Plane, X, ChevronDown, ChevronUp } from 'lucide-react'
import { useTripStore } from '@/store/tripStore'
import type { Stop } from '@/types'

const TripMap = dynamic(() => import('@/components/TripMap').then(m => ({ default: m.TripMap })), {
  ssr: false,
  loading: () => <div style={{ height: 160, background: 'var(--card)', borderRadius: 20, marginBottom: 16 }} />,
})


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
      city: city.trim(), country: country.trim(),
      countryCode: countryCode.trim().toUpperCase() || 'XX',
      days, budgetPerDay: budget, isActive: false, isCompleted: false,
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
        className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md z-50 rounded-t-[24px] shadow-2xl px-6 pb-10 pt-4"
        style={{ background: 'var(--surface)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)' }}>Add stop</h3>
          <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--card)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <X size={15} color="var(--text2)" />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <input value={city} onChange={e => setCity(e.target.value)} placeholder="City (e.g. Chiang Mai)"
            className="input" autoFocus />
          <div style={{ display: 'flex', gap: 8 }}>
            <input value={country} onChange={e => setCountry(e.target.value)} placeholder="Country"
              className="input" style={{ flex: 1 }} />
            <input value={countryCode} onChange={e => setCountryCode(e.target.value)} placeholder="CC"
              className="input" style={{ width: 64, textAlign: 'center', textTransform: 'uppercase' }} maxLength={2} />
          </div>

          <div style={{ background: 'var(--card)', borderRadius: 14, padding: '14px 16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 13, color: 'var(--text2)' }}>Days</span>
              <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)' }}>{days}</span>
            </div>
            <input type="range" min={1} max={60} value={days} onChange={e => setDays(+e.target.value)}
              style={{ width: '100%', accentColor: '#000' }} />
          </div>

          <div style={{ background: 'var(--card)', borderRadius: 14, padding: '14px 16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 13, color: 'var(--text2)' }}>Budget / day</span>
              <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)' }}>€{budget}</span>
            </div>
            <input type="range" min={10} max={200} step={5} value={budget} onChange={e => setBudget(+e.target.value)}
              style={{ width: '100%', accentColor: '#000' }} />
          </div>
        </div>

        <button onClick={handleSave} disabled={!city.trim() || !country.trim()}
          className="btn-primary"
          style={{ width: '100%', justifyContent: 'center', padding: 18, marginTop: 20, opacity: (!city.trim() || !country.trim()) ? 0.4 : 1 }}>
          Add to route
        </button>
      </motion.div>
    </>
  )
}

function StopCard({ stop, tripId }: { stop: Stop; tripId: string }) {
  const { updateStop, trackEvent } = useTripStore()
  const [expanded, setExpanded] = useState(stop.isActive)

  const dotColor = stop.isCompleted ? '#ABABAB' : stop.isActive ? '#34C759' : '#E8E8E8'

  return (
    <div style={{
      background: 'var(--card)', borderRadius: 20, marginBottom: 8, overflow: 'hidden',
      border: stop.isActive ? '1.5px solid rgba(52,199,89,0.5)' : '1.5px solid transparent',
      opacity: stop.isCompleted ? 0.5 : 1,
    }}>
      <button
        onClick={() => setExpanded(p => !p)}
        style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '16px 18px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}
      >
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: dotColor, flexShrink: 0 }} />
        <span style={{ fontSize: 28 }}>{stop.countryCode ? getFlag(stop.countryCode) : '🌍'}</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 17, fontWeight: 600, color: 'var(--text)' }}>{stop.city}</div>
          <div style={{ fontSize: 12, color: 'var(--text2)' }}>{stop.country}</div>
        </div>
        <div style={{ textAlign: 'right', marginRight: 8 }}>
          <div style={{ fontSize: 13, color: 'var(--text2)' }}>{stop.days}d · €{stop.budgetPerDay}/d</div>
          {stop.isActive && (
            <div style={{ fontSize: 10, fontWeight: 700, color: '#34C759', marginTop: 2 }}>NOW</div>
          )}
        </div>
        {expanded ? <ChevronUp size={14} color="var(--text3)" /> : <ChevronDown size={14} color="var(--text3)" />}
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            style={{ overflow: 'hidden' }}>
            <div style={{ padding: '0 18px 18px', borderTop: '1px solid var(--border)' }}>
              {stop.character && (
                <p style={{ fontSize: 14, color: 'var(--text2)', fontStyle: 'italic', margin: '12px 0' }}>
                  &ldquo;{stop.character}&rdquo;
                </p>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 0', borderBottom: '1px solid var(--border)' }}>
                <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: 0.8, textTransform: 'uppercase', color: 'var(--text3)' }}>BUDGET</span>
                <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)' }}>€{stop.budgetPerDay * stop.days} total</span>
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 12 }}>
                <a href="https://www.hostelworld.com" target="_blank" rel="noopener noreferrer"
                  style={{ padding: '6px 12px', borderRadius: 999, border: '1px solid var(--border)', fontSize: 11, color: 'var(--text)', background: 'white', textDecoration: 'none' }}>
                  🏨 Hostelworld
                </a>
                <a href="https://www.skyscanner.com" target="_blank" rel="noopener noreferrer"
                  style={{ padding: '6px 12px', borderRadius: 999, border: '1px solid var(--border)', fontSize: 11, color: 'var(--text)', background: 'white', textDecoration: 'none' }}>
                  ✈️ Skyscanner
                </a>
                <a href="https://www.airalo.com" target="_blank" rel="noopener noreferrer"
                  style={{ padding: '6px 12px', borderRadius: 999, border: '1px solid var(--border)', fontSize: 11, color: 'var(--text)', background: 'white', textDecoration: 'none' }}>
                  📶 Airalo
                </a>
              </div>
              <div style={{ marginTop: 14, display: 'flex', gap: 8 }}>
                <button
                  onClick={() => { updateStop(tripId, stop.id, { isCompleted: !stop.isCompleted }); if (!stop.isCompleted) trackEvent('check_in', { stopId: stop.id }) }}
                  style={{
                    flex: 1, padding: '10px', borderRadius: 12, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600,
                    background: stop.isCompleted ? 'var(--card-deep)' : '#000', color: stop.isCompleted ? 'var(--text2)' : '#fff',
                  }}
                >
                  {stop.isCompleted ? 'Mark active' : 'Mark done'}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function getFlag(cc: string): string {
  if (!cc || cc.length !== 2) return '🌍'
  try {
    const u = cc.toUpperCase()
    return String.fromCodePoint(0x1F1E6 - 65 + u.charCodeAt(0), 0x1F1E6 - 65 + u.charCodeAt(1))
  } catch { return '🌍' }
}

export default function TripPage() {
  const { activeTrip } = useTripStore()
  const [addStopOpen, setAddStopOpen] = useState(false)

  const trip = activeTrip()

  if (!trip) {
    return (
      <div style={{ minHeight: 'calc(100dvh - 64px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 24px', textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>🗺️</div>
        <p style={{ color: 'var(--text2)', fontSize: 14 }}>No active trip. <a href="/home" style={{ color: '#000', fontWeight: 700 }}>Create one</a></p>
      </div>
    )
  }

  return (
    <div style={{ padding: '20px 24px 8px' }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 32, fontWeight: 700, color: 'var(--text)', letterSpacing: -0.5 }}>
          {trip.emoji} {trip.name}
        </h1>
        <p style={{ fontSize: 14, color: 'var(--text2)', marginTop: 4 }}>
          {trip.stops.length} stops · {trip.stops.reduce((s, st) => s + st.days, 0)} days · €{trip.totalBudget.toLocaleString()}
        </p>
      </div>

      {/* Route pills */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 5, overflowX: 'auto', marginBottom: 24 }} className="no-scrollbar">
        <span style={{ fontSize: 18 }}>🏠</span>
        <span style={{ fontSize: 18, color: 'var(--text3)' }}>›</span>
        {trip.stops.map((stop, i) => (
          <div key={stop.id} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 5, padding: '8px 12px', borderRadius: 999,
              background: stop.isActive ? '#000' : 'var(--card)',
              opacity: stop.isCompleted ? 0.4 : 1, flexShrink: 0,
            }}>
              <span style={{ fontSize: 14 }}>{getFlag(stop.countryCode ?? '')}</span>
              <span style={{ fontSize: 10, fontWeight: 700, color: stop.isActive ? '#fff' : 'var(--text)' }}>
                {stop.city}
              </span>
            </div>
            {i < trip.stops.length - 1 && (
              <span style={{ fontSize: 18, color: 'var(--text3)' }}>›</span>
            )}
          </div>
        ))}
        <span style={{ fontSize: 18, color: 'var(--text3)' }}>›</span>
        <span style={{ fontSize: 18 }}>🏠</span>
      </div>

      {/* Map */}
      <div style={{ borderRadius: 20, overflow: 'hidden', marginBottom: 16 }}>
        <TripMap stops={trip.stops} className="w-full h-40" />
      </div>

      {/* Stops */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <div className="section-label" style={{ margin: 0 }}>STOPS</div>
        <button onClick={() => setAddStopOpen(true)} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, fontWeight: 600, color: 'var(--text)', background: 'none', border: 'none', cursor: 'pointer' }}>
          <Plus size={14} /> Add stop
        </button>
      </div>

      {trip.stops.map((stop, i) => (
        <div key={stop.id}>
          <StopCard stop={stop} tripId={trip.id} />
          {/* Connector */}
          {i < trip.stops.length - 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '2px 0' }}>
              <div style={{ width: 1, height: 10, background: 'var(--border)' }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'white', border: '1px solid var(--border)', borderRadius: 14, padding: '10px 14px', width: '100%' }}>
                <span style={{ fontSize: 16 }}>✈️</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>
                    {stop.city} → {trip.stops[i + 1].city}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text2)', marginTop: 2 }}>Via Skyscanner · Rome2Rio</div>
                </div>
                <a href="https://www.skyscanner.com" target="_blank" rel="noopener noreferrer"
                  style={{ padding: '4px 10px', borderRadius: 999, background: '#FFF4E5', color: '#FF9500', fontSize: 10, fontWeight: 700, textDecoration: 'none' }}>
                  To book
                </a>
              </div>
              <div style={{ width: 1, height: 10, background: 'var(--border)' }} />
            </div>
          )}
        </div>
      ))}

      {/* Flights */}
      {trip.flights && trip.flights.length > 0 && (
        <>
          <div className="section-label" style={{ marginTop: 24 }}>FLIGHTS</div>
          {trip.flights.map(flight => (
            <div key={flight.id} style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'var(--card)', borderRadius: 16, padding: '14px 16px', marginBottom: 8 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: flight.status === 'booked' ? '#E8F9ED' : '#FFF4E5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Plane size={16} color={flight.status === 'booked' ? '#34C759' : '#FF9500'} />
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>{flight.flightNumber ?? 'Flight to book'}</p>
                <p style={{ fontSize: 11, color: 'var(--text3)', display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                  {flight.status === 'booked' ? '✓ Booked' : '○ To book'}
                  {flight.price ? ` · €${flight.price}` : ''}
                </p>
              </div>
              {flight.status !== 'booked' && (
                <a href="https://www.google.com/flights" target="_blank" rel="noopener noreferrer"
                  style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 4, textDecoration: 'none' }}>
                  Search <ExternalLink size={11} />
                </a>
              )}
            </div>
          ))}
        </>
      )}

      <div style={{ height: 32 }} />

      <AnimatePresence>
        {addStopOpen && (
          <AddStopSheet tripId={trip.id} onClose={() => setAddStopOpen(false)} />
        )}
      </AnimatePresence>
    </div>
  )
}
