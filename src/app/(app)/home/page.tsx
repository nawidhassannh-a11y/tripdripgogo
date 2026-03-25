'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, X, ArrowRight, Plus } from 'lucide-react'
import { useTripStore } from '@/store/tripStore'
import { AddExpenseSheet } from '@/components/AddExpenseSheet'
import { searchDestinations, DESTINATIONS, type Destination } from '@/data/destinations'
import { calcHealthScore } from '@/lib/utils'
import type { Stop, Trip } from '@/types'

// Must-see cities shown in generator
const MUST_SEE: string[] = [
  'Bangkok', 'Bali', 'Barcelona', 'Lisbon', 'Tokyo',
  'Medellín', 'Chiang Mai', 'Ho Chi Minh', 'Tbilisi', 'Cape Town',
  'Hanoi', 'Budapest', 'Mexico City', 'Kathmandu', 'Istanbul',
  'Marrakech', 'Singapore', 'Prague', 'Buenos Aires', 'Cusco',
]

const MUST_SEE_DESTS = MUST_SEE
  .map(city => DESTINATIONS.find(d => d.city === city))
  .filter(Boolean) as Destination[]

function getFlag(cc: string): string {
  if (!cc || cc.length !== 2) return '🌍'
  try {
    const u = cc.toUpperCase()
    return String.fromCodePoint(0x1F1E6 - 65 + u.charCodeAt(0), 0x1F1E6 - 65 + u.charCodeAt(1))
  } catch { return '🌍' }
}

// ── Trip Dashboard ────────────────────────────────────────────────────────────
function TripDashboard({ trip }: { trip: Trip }) {
  const { activeTripExpenses, addExpense, trackEvent } = useTripStore()
  const [sheetOpen, setSheetOpen] = useState(false)
  const [raw, setRaw] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const activeStop = trip.stops.find(s => s.isActive) ?? trip.stops[0]
  const allExpenses = activeTripExpenses()
  const todayStr = new Date().toDateString()
  const todayExpenses = allExpenses.filter(e => new Date(e.date).toDateString() === todayStr)
  const todaySpent = todayExpenses.reduce((s, e) => s + e.amountEur, 0)
  const dailyBudget = activeStop?.budgetPerDay ?? 50
  const todayLeft = dailyBudget - todaySpent
  const todayPct = Math.min(100, dailyBudget > 0 ? (todaySpent / dailyBudget) * 100 : 0)

  const health = calcHealthScore(trip, allExpenses, [])
  const healthVerdict = health.total >= 75 ? 'Healthy' : health.total >= 50 ? 'Watch it' : 'Overspending'
  const healthColor = health.total >= 75 ? '#34C759' : health.total >= 50 ? '#FF9500' : '#FF3B30'
  const healthBg = health.total >= 75 ? '#E8F9ED' : health.total >= 50 ? '#FFF4E5' : '#FFEBEA'

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  function handleQuickAdd() {
    if (!raw.trim() || !activeStop) return
    const match = raw.match(/[\d.]+/)
    const amt = parseFloat(match?.[0] ?? '0')
    if (!amt || amt <= 0) return
    addExpense({
      id: Math.random().toString(36).slice(2, 10),
      raw,
      amount: amt,
      currency: 'EUR',
      amountEur: amt,
      category: 'food',
      label: raw.slice(0, 30),
      date: new Date().toISOString(),
      stopId: activeStop.id,
    })
    trackEvent('expense_added', { category: 'food', amountEur: amt })
    setRaw('')
  }

  const dayPct = todayPct > 100 ? 100 : todayPct
  const barColor = todayPct > 90 ? '#FF3B30' : todayPct > 70 ? '#FF9500' : '#34C759'

  return (
    <div className="px-6 pt-5 pb-2">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <p style={{ fontSize: 13, color: 'var(--text2)' }}>{greeting}</p>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: 'var(--text)', letterSpacing: -0.5, marginTop: 2 }}>
            {trip.emoji} {trip.name}
          </h1>
        </div>
        <div style={{ background: 'var(--card)', padding: '8px 16px', borderRadius: 20, textAlign: 'center' }}>
          <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: 'var(--text3)' }}>
            DAY
          </div>
          <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--text)', lineHeight: 1.1 }}>
            {trip.stops.filter(s => s.isCompleted).length + 1}
          </div>
        </div>
      </div>

      {/* NOW IN card */}
      {activeStop && (
        <div style={{ background: 'var(--card)', borderRadius: 20, padding: 18, marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: 'var(--text3)', marginBottom: 4 }}>
              NOW IN
            </div>
            <div style={{ fontSize: 32, fontWeight: 700, color: 'var(--text)', letterSpacing: -1, lineHeight: 1 }}>
              {activeStop.city}
            </div>
            <div style={{ fontSize: 13, color: 'var(--text2)', marginTop: 3 }}>
              {activeStop.country} · {activeStop.days} days
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: 'var(--text3)' }}>BUDGET</div>
            <div style={{ fontSize: 26, fontWeight: 700, color: 'var(--text)', letterSpacing: -0.5 }}>
              €{activeStop.budgetPerDay}<span style={{ fontSize: 13, color: 'var(--text2)', fontWeight: 400 }}>/d</span>
            </div>
          </div>
        </div>
      )}

      {/* TODAY section */}
      <div style={{ marginBottom: 8 }}>
        <div className="section-label">TODAY</div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 14 }}>
          <span className="hero-amt">€{todaySpent.toFixed(2)}</span>
          <span style={{ fontSize: 20, color: 'var(--text3)', fontWeight: 400 }}>/ €{dailyBudget}</span>
        </div>
        <div className="prog-track">
          <motion.div className="prog-fill" initial={{ width: 0 }} animate={{ width: `${dayPct}%` }}
            style={{ background: barColor }} transition={{ duration: 0.6 }} />
        </div>
        <p style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 24 }}>
          {todayLeft >= 0 ? `€${todayLeft.toFixed(2)} left today` : `€${Math.abs(todayLeft).toFixed(2)} over budget`}
        </p>
      </div>

      {/* Health card */}
      <div style={{ background: healthBg, borderRadius: 20, padding: 18, display: 'flex', gap: 16, marginBottom: 24 }}>
        <div>
          <div style={{ fontSize: 52, fontWeight: 900, color: healthColor, letterSpacing: -3, lineHeight: 1 }}>
            {health.total}
          </div>
          <div style={{ fontSize: 12, fontWeight: 700, color: healthColor, marginTop: 3 }}>{healthVerdict}</div>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 12, lineHeight: 1.5 }}>
            {trip.totalBudget - allExpenses.reduce((s, e) => s + e.amountEur, 0) > 0
              ? `€${(trip.totalBudget - allExpenses.reduce((s, e) => s + e.amountEur, 0)).toFixed(0)} buffer remaining`
              : 'Over total budget'}
          </div>
          <div style={{ marginBottom: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: 0.8, textTransform: 'uppercase', color: 'var(--text2)' }}>Daily pace</span>
              <span style={{ fontSize: 9, fontWeight: 700, color: healthColor }}>{Math.round(todayPct)}%</span>
            </div>
            <div style={{ height: 4, background: 'rgba(0,0,0,0.07)', borderRadius: 999, overflow: 'hidden' }}>
              <div style={{ width: `${dayPct}%`, height: '100%', background: barColor, borderRadius: 999 }} />
            </div>
          </div>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: 0.8, textTransform: 'uppercase', color: 'var(--text2)' }}>Budget health</span>
              <span style={{ fontSize: 9, fontWeight: 700, color: healthColor }}>{health.total}%</span>
            </div>
            <div style={{ height: 4, background: 'rgba(0,0,0,0.07)', borderRadius: 999, overflow: 'hidden' }}>
              <div style={{ width: `${health.total}%`, height: '100%', background: healthColor, borderRadius: 999 }} />
            </div>
          </div>
        </div>
      </div>

      {/* Route row */}
      {trip.stops.length > 1 && (
        <>
          <div className="section-label">ROUTE</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, overflowX: 'auto', marginBottom: 24 }}
            className="no-scrollbar">
            {trip.stops.map((stop, i) => (
              <div key={stop.id} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <div style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center',
                  padding: '10px 13px', borderRadius: 14,
                  background: stop.isActive ? '#000' : 'var(--card)',
                  opacity: stop.isCompleted ? 0.4 : 1,
                  flexShrink: 0,
                }}>
                  <span style={{ fontSize: 20 }}>
                    {getFlag(stop.countryCode ?? '')}
                  </span>
                  <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: 0.6, textTransform: 'uppercase', color: stop.isActive ? '#fff' : 'var(--text2)', marginTop: 4 }}>
                    {stop.city.slice(0, 6)}
                  </span>
                </div>
                {i < trip.stops.length - 1 && (
                  <span style={{ fontSize: 18, color: 'var(--text3)', fontWeight: 300 }}>›</span>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      {/* Log expense */}
      <div className="section-label">LOG EXPENSE</div>
      <p style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 10 }}>
        Just type: pad thai 80 baht or taxi 50000 idr
      </p>
      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        <input
          ref={inputRef}
          type="text"
          value={raw}
          onChange={e => setRaw(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleQuickAdd()}
          placeholder="scooter 400 baht..."
          className="input"
          style={{ flex: 1 }}
        />
        <button
          onClick={handleQuickAdd}
          disabled={!raw.trim()}
          style={{
            background: '#000', color: '#fff', border: 'none', borderRadius: 14,
            padding: '0 22px', fontSize: 15, fontWeight: 600, opacity: raw.trim() ? 1 : 0.4,
            cursor: raw.trim() ? 'pointer' : 'not-allowed',
          }}
        >
          Add
        </button>
      </div>

      {/* Or open full sheet */}
      <button
        onClick={() => setSheetOpen(true)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          padding: '14px', borderRadius: 14, background: 'var(--card)',
          color: 'var(--text2)', fontSize: 14, fontWeight: 600, border: 'none', cursor: 'pointer',
          marginBottom: 24,
        }}
      >
        <Plus size={16} /> More options
      </button>

      {/* Today's expenses */}
      {todayExpenses.length > 0 && (
        <>
          <div className="section-label">TODAY&apos;S EXPENSES</div>
          <div>
            {todayExpenses.map(e => (
              <div key={e.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 0', borderBottom: '1px solid var(--border)' }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--card)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
                  {e.category === 'food' ? '🍜' : e.category === 'transport' ? '🚕' : e.category === 'stay' ? '🏠' : e.category === 'activities' ? '🎯' : e.category === 'drinks' ? '🍺' : '💳'}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)' }}>{e.label || e.raw}</div>
                  <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 1 }}>
                    {e.currency !== 'EUR' ? `${e.amount} ${e.currency}` : new Date(e.date).toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
                <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)' }}>€{e.amountEur.toFixed(2)}</div>
              </div>
            ))}
          </div>
        </>
      )}

      <div style={{ height: 32 }} />
      <AddExpenseSheet open={sheetOpen} onClose={() => setSheetOpen(false)} />
    </div>
  )
}

// ── Trip Generator ────────────────────────────────────────────────────────────
function TripGenerator() {
  const { addTrip, setActiveTrip, profile } = useTripStore()
  const router = useRouter()
  const [budget, setBudget] = useState(1500)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Destination[]>([])
  const [picked, setPicked] = useState<Destination | null>(null)

  const travelerType = profile?.travelerType ?? 'budget'

  useEffect(() => {
    setResults(query.length >= 1 ? searchDestinations(query) : [])
  }, [query])

  function pick(dest: Destination) { setPicked(dest); setQuery(''); setResults([]) }
  function clear() { setPicked(null); setQuery('') }

  function go() {
    if (!picked) return
    const days = Math.max(3, Math.round(budget / picked.budgetPerDay[travelerType]))
    const stop: Stop = {
      id: Math.random().toString(36).slice(2, 10),
      city: picked.city, country: picked.country, countryCode: picked.countryCode,
      days, budgetPerDay: picked.budgetPerDay[travelerType],
      character: picked.character.join(', '), isActive: true, isCompleted: false,
    }
    const newTrip: Trip = {
      id: Math.random().toString(36).slice(2, 10),
      name: `${picked.city} ${new Date().getFullYear()}`,
      emoji: picked.emoji, totalBudget: budget,
      createdAt: new Date().toISOString(), stops: [stop], flights: [], region: picked.region,
    }
    addTrip(newTrip); setActiveTrip(newTrip.id); router.push('/trip')
  }

  return (
    <div style={{ background: 'var(--surface)', minHeight: 'calc(100dvh - 64px)' }}>
      {/* Header */}
      <div style={{ padding: '28px 24px 8px' }}>
        <h1 style={{ fontSize: 32, fontWeight: 700, color: 'var(--text)', letterSpacing: -0.5 }}>Where next?</h1>
        <p style={{ fontSize: 14, color: 'var(--text2)', marginTop: 4 }}>Set your budget, pick a city.</p>
      </div>

      {/* Budget */}
      <div style={{ padding: '16px 24px 8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: 'var(--text3)' }}>Budget</span>
          <span style={{ fontSize: 28, fontWeight: 800, color: 'var(--text)', letterSpacing: -1 }}>€{budget.toLocaleString()}</span>
        </div>
        <input type="range" min={200} max={8000} step={50} value={budget}
          onChange={e => setBudget(+e.target.value)}
          style={{ width: '100%', accentColor: '#000', height: 6 }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--text3)', marginTop: 4 }}>
          <span>€200</span><span>€8,000</span>
        </div>
      </div>

      {/* Destination search */}
      <div style={{ padding: '12px 24px 0' }}>
        {picked ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 16, borderRadius: 20, background: '#000', color: '#fff' }}>
            <span style={{ fontSize: 24 }}>{picked.emoji}</span>
            <div style={{ flex: 1 }}>
              <p style={{ fontWeight: 700, fontSize: 16 }}>{picked.city}, {picked.country}</p>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>
                ~{Math.max(3, Math.round(budget / picked.budgetPerDay[travelerType]))} days · €{picked.budgetPerDay[travelerType]}/day
              </p>
            </div>
            <button onClick={clear} style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <X size={14} />
            </button>
          </div>
        ) : (
          <div style={{ position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--text3)' }} />
            <input
              type="text" value={query} onChange={e => setQuery(e.target.value)}
              placeholder="Search city or country…"
              className="input" style={{ paddingLeft: 44 }}
              autoComplete="off"
            />
            {query.length > 0 && (
              <button onClick={() => setQuery('')} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={14} style={{ color: 'var(--text3)' }} />
              </button>
            )}
          </div>
        )}

        {/* Search results */}
        <AnimatePresence>
          {results.length > 0 && (
            <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              style={{ marginTop: 4, background: 'var(--card)', borderRadius: 20, overflow: 'hidden', position: 'relative', zIndex: 20 }}>
              {results.map(dest => (
                <button key={dest.city} onClick={() => pick(dest)}
                  style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '14px 18px', border: 'none', background: 'none', cursor: 'pointer', textAlign: 'left', borderBottom: '1px solid var(--border)' }}>
                  <span style={{ fontSize: 22 }}>{dest.emoji}</span>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)' }}>{dest.city}</p>
                    <p style={{ fontSize: 12, color: 'var(--text3)' }}>{dest.country}</p>
                  </div>
                  <span style={{ fontSize: 12, color: 'var(--text2)', fontWeight: 600 }}>€{dest.budgetPerDay[travelerType]}/day</span>
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Go button */}
        {picked && (
          <motion.button initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            onClick={go} className="btn-primary"
            style={{ width: '100%', justifyContent: 'center', padding: '18px', marginTop: 12, fontSize: 16 }}>
            Start trip <ArrowRight size={18} />
          </motion.button>
        )}
      </div>

      {/* Must-see cities */}
      <div style={{ padding: '24px 24px 8px' }}>
        <div className="section-label">Must-see cities</div>
      </div>
      <div style={{ padding: '0 24px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, paddingBottom: 32 }}>
        {MUST_SEE_DESTS.map((dest, i) => (
          <motion.button
            key={dest.city}
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
            onClick={() => pick(dest)}
            style={{
              display: 'flex', alignItems: 'center', gap: 12, padding: 14, borderRadius: 16,
              background: picked?.city === dest.city ? '#000' : 'var(--card)',
              border: 'none', cursor: 'pointer', textAlign: 'left',
              transition: 'all 0.15s',
            }}
            className="active:scale-95"
          >
            <span style={{ fontSize: 24, lineHeight: 1 }}>{dest.emoji}</span>
            <div style={{ minWidth: 0 }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: picked?.city === dest.city ? '#fff' : 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{dest.city}</p>
              <p style={{ fontSize: 10, color: picked?.city === dest.city ? 'rgba(255,255,255,0.6)' : 'var(--text3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {dest.country} · €{dest.budgetPerDay[travelerType]}/d
              </p>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function HomePage() {
  const { activeTrip } = useTripStore()
  const trip = activeTrip()

  return trip ? <TripDashboard trip={trip} /> : <TripGenerator />
}
