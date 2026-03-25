'use client'

import { useState, useEffect } from 'react'
import { Check, Trash2, RotateCcw, Moon, Sun, ExternalLink } from 'lucide-react'
import { useTripStore } from '@/store/tripStore'

const CURRENCIES = ['EUR', 'USD', 'GBP', 'AUD', 'CAD', 'CHF', 'SEK', 'NOK', 'DKK']
const TRAVELER_TYPES = [
  { value: 'backpacker' as const, label: 'Backpacker', emoji: '🎒', desc: 'Hostels, street food' },
  { value: 'budget'     as const, label: 'Budget',     emoji: '💰', desc: 'Mix of hostels & privates' },
  { value: 'comfort'    as const, label: 'Comfort',    emoji: '🛋️', desc: 'Private rooms, restaurants' },
  { value: 'flashpacker'as const, label: 'Flashpacker',emoji: '✨', desc: 'Nice stays, adventure-first' },
]

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 28 }}>
      <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: 'var(--text3)', marginBottom: 12 }}>
        {label}
      </div>
      {children}
    </div>
  )
}

export default function SettingsPage() {
  const { profile, setProfile, trips, activeTripId, setActiveTrip } = useTripStore()

  const [name, setName]         = useState(profile?.name ?? '')
  const [currency, setCurrency] = useState(profile?.currency ?? 'EUR')
  const [traveler, setTraveler] = useState(profile?.travelerType ?? 'backpacker')
  const [saved, setSaved]       = useState(false)
  const [confirmReset, setConfirmReset] = useState(false)
  const [dark, setDark]         = useState(false)

  useEffect(() => { setDark(document.documentElement.classList.contains('dark')) }, [])

  function toggleDark() {
    const html = document.documentElement
    const next = !html.classList.contains('dark')
    html.classList.toggle('dark', next)
    localStorage.setItem('theme', next ? 'dark' : 'light')
    setDark(next)
  }

  function save() {
    setProfile({ name, currency, homeCountry: profile?.homeCountry ?? '', travelerType: traveler })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  function resetAll() {
    if (!confirmReset) { setConfirmReset(true); return }
    localStorage.removeItem('tripdripgogo-store')
    window.location.href = '/'
  }

  return (
    <div style={{ padding: '20px 24px 40px', minHeight: 'calc(100dvh - 64px)' }}>
      <h1 style={{ fontSize: 32, fontWeight: 700, color: 'var(--text)', letterSpacing: -0.5, marginBottom: 28 }}>Settings</h1>

      {/* Profile */}
      <Section label="PROFILE">
        <div style={{ background: 'var(--card)', borderRadius: 20, padding: '4px 16px' }}>
          <div style={{ padding: '14px 0', borderBottom: '1px solid var(--border)' }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 0.8, textTransform: 'uppercase', color: 'var(--text3)', marginBottom: 8 }}>NAME</div>
            <input type="text" value={name} onChange={e => setName(e.target.value)}
              placeholder="Your name" className="input"
              style={{ background: 'var(--card-deep)', padding: '12px 14px', fontSize: 15 }} />
          </div>

          <div style={{ padding: '14px 0', borderBottom: '1px solid var(--border)' }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 0.8, textTransform: 'uppercase', color: 'var(--text3)', marginBottom: 10 }}>HOME CURRENCY</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {CURRENCIES.map(c => (
                <button key={c} onClick={() => setCurrency(c)}
                  style={{
                    padding: '6px 14px', borderRadius: 999, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 700,
                    background: currency === c ? '#000' : 'var(--card-deep)', color: currency === c ? '#fff' : 'var(--text2)',
                  }}>
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div style={{ padding: '14px 0' }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 0.8, textTransform: 'uppercase', color: 'var(--text3)', marginBottom: 10 }}>TRAVEL STYLE</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {TRAVELER_TYPES.map(t => (
                <button key={t.value} onClick={() => setTraveler(t.value)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10, padding: 12, borderRadius: 14, border: 'none', cursor: 'pointer', textAlign: 'left',
                    background: traveler === t.value ? '#000' : 'var(--card-deep)',
                    color: traveler === t.value ? '#fff' : 'var(--text)',
                  }}>
                  <span style={{ fontSize: 20 }}>{t.emoji}</span>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700 }}>{t.label}</div>
                    <div style={{ fontSize: 10, opacity: 0.6, marginTop: 1 }}>{t.desc}</div>
                  </div>
                  {traveler === t.value && <Check size={13} style={{ marginLeft: 'auto', color: '#fff', flexShrink: 0 }} />}
                </button>
              ))}
            </div>
          </div>
        </div>

        <button onClick={save}
          style={{
            width: '100%', padding: 16, borderRadius: 14, border: 'none', cursor: 'pointer',
            background: saved ? '#34C759' : '#000', color: '#fff', fontSize: 15, fontWeight: 700, marginTop: 12,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, transition: 'background 0.2s',
          }}>
          {saved ? <><Check size={16} /> Saved</> : 'Save profile'}
        </button>
      </Section>

      {/* Switch trip */}
      {trips.length > 1 && (
        <Section label="MY TRIPS">
          <div style={{ background: 'var(--card)', borderRadius: 20, overflow: 'hidden' }}>
            {trips.map((trip, i) => (
              <button key={trip.id} onClick={() => setActiveTrip(trip.id)}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '14px 18px', border: 'none', cursor: 'pointer', textAlign: 'left',
                  background: trip.id === activeTripId ? '#000' : 'transparent',
                  borderBottom: i < trips.length - 1 ? '1px solid var(--border)' : 'none',
                }}>
                <span style={{ fontSize: 22 }}>{trip.emoji}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 15, fontWeight: 600, color: trip.id === activeTripId ? '#fff' : 'var(--text)' }}>{trip.name}</div>
                  <div style={{ fontSize: 11, color: trip.id === activeTripId ? 'rgba(255,255,255,0.6)' : 'var(--text3)', marginTop: 2 }}>
                    {trip.stops.length} stops · €{trip.totalBudget}
                  </div>
                </div>
                {trip.id === activeTripId && <Check size={14} color="#fff" />}
              </button>
            ))}
          </div>
        </Section>
      )}

      {/* Appearance */}
      <Section label="APPEARANCE">
        <div style={{ background: 'var(--card)', borderRadius: 20, padding: '4px 18px' }}>
          <button onClick={toggleDark}
            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 0', background: 'none', border: 'none', cursor: 'pointer' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {dark ? <Moon size={18} color="var(--text)" /> : <Sun size={18} color="#FF9500" />}
              <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)' }}>{dark ? 'Dark mode' : 'Light mode'}</span>
            </div>
            {/* Toggle */}
            <div style={{
              width: 44, height: 26, borderRadius: 999, background: dark ? '#000' : 'var(--card-deep)',
              position: 'relative', transition: 'background 0.2s',
            }}>
              <div style={{
                position: 'absolute', top: 3, width: 20, height: 20, borderRadius: '50%', background: '#fff',
                boxShadow: '0 1px 4px rgba(0,0,0,0.2)', transition: 'left 0.2s',
                left: dark ? 21 : 3,
              }} />
            </div>
          </button>
        </div>
      </Section>

      {/* Links */}
      <Section label="INFO">
        <div style={{ background: 'var(--card)', borderRadius: 20, overflow: 'hidden' }}>
          <a href="https://github.com/nawidhassannh-a11y/tripdripgogo" target="_blank" rel="noopener noreferrer"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 18px', color: 'var(--text)', textDecoration: 'none', borderBottom: '1px solid var(--border)' }}>
            <span style={{ fontSize: 15 }}>GitHub</span>
            <ExternalLink size={14} color="var(--text3)" />
          </a>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 18px' }}>
            <span style={{ fontSize: 15, color: 'var(--text)' }}>Version</span>
            <span style={{ fontSize: 13, color: 'var(--text3)', fontWeight: 600 }}>v0.1.0</span>
          </div>
        </div>
      </Section>

      {/* Danger zone */}
      <Section label="DANGER ZONE">
        <button onClick={resetAll}
          style={{
            width: '100%', padding: 16, borderRadius: 14, border: 'none', cursor: 'pointer', fontSize: 15, fontWeight: 700,
            background: confirmReset ? '#FF3B30' : '#FFEBEA', color: confirmReset ? '#fff' : '#FF3B30',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'all 0.2s',
          }}>
          {confirmReset ? <><Trash2 size={15} /> Confirm — delete everything</> : <><RotateCcw size={15} /> Reset all data</>}
        </button>
        {confirmReset && (
          <p style={{ fontSize: 12, color: '#FF3B30', textAlign: 'center', marginTop: 8 }}>
            Tap again to confirm. This cannot be undone.
          </p>
        )}
      </Section>
    </div>
  )
}
