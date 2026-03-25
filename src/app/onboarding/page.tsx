'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { ArrowRight, ArrowLeft } from 'lucide-react'
import { useTripStore } from '@/store/tripStore'
import { DESTINATIONS } from '@/data/destinations'

/* ── Region data ────────────────────────────────────────────────────────────── */
const REGIONS = [
  { value: 'SEA',        label: 'Southeast Asia', emoji: '🌴', hint: '€20–45/day' },
  { value: 'EAST_ASIA',  label: 'East Asia',      emoji: '🏯', hint: '€40–80/day' },
  { value: 'EUROPE',     label: 'Europe',          emoji: '🏰', hint: '€50–120/day' },
  { value: 'LATAM',      label: 'Latin America',   emoji: '🦜', hint: '€30–55/day' },
  { value: 'SOUTH_ASIA', label: 'South Asia',      emoji: '🕌', hint: '€20–35/day' },
  { value: 'AFRICA',     label: 'Africa',           emoji: '🦁', hint: '€25–50/day' },
  { value: 'MIDEAST',    label: 'Middle East',      emoji: '🌙', hint: '€35–70/day' },
  { value: 'OTHER',      label: 'Everywhere',       emoji: '🌍', hint: 'Custom' },
]

const DURATION_OPTIONS = [
  { weeks: 1,  label: '1 week' },
  { weeks: 2,  label: '2 weeks' },
  { weeks: 4,  label: '1 month' },
  { weeks: 6,  label: '6 weeks' },
  { weeks: 8,  label: '2 months' },
  { weeks: 12, label: '3 months' },
  { weeks: 24, label: '6 months' },
]

type TravelerType = 'backpacker' | 'budget' | 'comfort' | 'flashpacker'
const TRAVELER_TYPES: { value: TravelerType; label: string; emoji: string }[] = [
  { value: 'backpacker', label: 'Backpacker', emoji: '🎒' },
  { value: 'budget',     label: 'Budget',     emoji: '💰' },
  { value: 'comfort',    label: 'Comfort',    emoji: '🛋️' },
  { value: 'flashpacker',label: 'Flashpacker',emoji: '✨' },
]

interface State {
  name: string
  region: string
  durationWeeks: number
  budget: number
  travelerType: TravelerType
}

/* ── Progress bar ───────────────────────────────────────────────────────────── */
function ProgressDots({ total, current }: { total: number; current: number }) {
  return (
    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
      {Array.from({ length: total }).map((_, i) => (
        <motion.div key={i} animate={{ width: i === current ? 24 : 8, opacity: i <= current ? 1 : 0.3 }}
          style={{ height: 6, borderRadius: 999, background: '#000' }} />
      ))}
    </div>
  )
}

/* ── Step 1: Name ────────────────────────────────────────────────────────────── */
function StepName({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div style={{ paddingTop: 16 }}>
      <div style={{ fontSize: 13, color: 'var(--text3)', marginBottom: 28, letterSpacing: 0.5 }}>
        TripDripGoGo 🌍
      </div>
      <h2 style={{ fontSize: 36, fontWeight: 800, color: 'var(--text)', letterSpacing: -1, lineHeight: 1.1, marginBottom: 32 }}>
        What&apos;s your name?
      </h2>
      <input
        type="text"
        autoFocus
        autoComplete="given-name"
        placeholder="Enter your name"
        value={value}
        onChange={e => onChange(e.target.value)}
        style={{
          width: '100%', fontSize: 28, fontWeight: 700, color: 'var(--text)',
          background: 'none', border: 'none', borderBottom: '2px solid var(--border)',
          outline: 'none', padding: '8px 0', letterSpacing: -0.5,
        }}
      />
      {value && (
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          style={{ fontSize: 14, color: 'var(--text2)', marginTop: 12 }}>
          Nice to meet you, {value}! 👋
        </motion.p>
      )}
    </div>
  )
}

/* ── Step 2: Region + City chips ─────────────────────────────────────────────── */
function StepDestination({ region, onChange }: { region: string; onChange: (v: string) => void }) {
  const [activeRegion, setActiveRegion] = useState(region || 'SEA')

  const regionCities = DESTINATIONS.filter(d => d.region === activeRegion).slice(0, 16)

  return (
    <div>
      <h2 style={{ fontSize: 36, fontWeight: 800, color: 'var(--text)', letterSpacing: -1, lineHeight: 1.1, marginBottom: 6 }}>
        Where to?
      </h2>
      <p style={{ fontSize: 14, color: 'var(--text2)', marginBottom: 20 }}>Pick your dream region.</p>

      {/* Region tabs */}
      <div style={{ display: 'flex', gap: 6, overflowX: 'auto', marginBottom: 20, paddingBottom: 4 }} className="no-scrollbar">
        {REGIONS.map(r => (
          <button key={r.value}
            onClick={() => { setActiveRegion(r.value); onChange(r.value) }}
            style={{
              flexShrink: 0, display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 999,
              border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 700,
              background: activeRegion === r.value ? '#000' : 'var(--card)',
              color: activeRegion === r.value ? '#fff' : 'var(--text2)',
            }}>
            <span>{r.emoji}</span>
            <span>{r.label}</span>
          </button>
        ))}
      </div>

      {/* City chips */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {regionCities.map(dest => (
          <motion.button key={dest.city}
            whileTap={{ scale: 0.95 }}
            onClick={() => onChange(activeRegion)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 14,
              border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600,
              background: region === activeRegion ? 'var(--card-deep)' : 'var(--card)',
              color: 'var(--text)',
            }}>
            <span style={{ fontSize: 16 }}>{dest.emoji}</span>
            {dest.city}
          </motion.button>
        ))}
      </div>

      {region && (
        <motion.p initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          style={{ fontSize: 13, color: 'var(--text2)', marginTop: 16 }}>
          ✓ {REGIONS.find(r => r.value === region)?.label} selected · {REGIONS.find(r => r.value === region)?.hint}
        </motion.p>
      )}
    </div>
  )
}

/* ── Step 3: Budget + Duration ───────────────────────────────────────────────── */
function StepBudget({
  budget, durationWeeks, travelerType,
  onBudget, onDuration, onTraveler
}: {
  budget: number; durationWeeks: number; travelerType: TravelerType
  onBudget: (v: number) => void; onDuration: (v: number) => void; onTraveler: (v: TravelerType) => void
}) {
  const perDay = durationWeeks > 0 && budget > 0 ? Math.round(budget / (durationWeeks * 7)) : 0

  return (
    <div>
      <h2 style={{ fontSize: 36, fontWeight: 800, color: 'var(--text)', letterSpacing: -1, lineHeight: 1.1, marginBottom: 6 }}>
        What&apos;s your budget?
      </h2>
      <p style={{ fontSize: 14, color: 'var(--text2)', marginBottom: 24 }}>Total for the whole trip.</p>

      {/* Budget hero input */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
          <span style={{ fontSize: 40, fontWeight: 400, color: 'var(--text3)' }}>€</span>
          <input type="number" min={100} max={50000} step={50} value={budget || ''}
            onChange={e => onBudget(Number(e.target.value))} placeholder="2000"
            style={{
              fontSize: 48, fontWeight: 800, color: 'var(--text)', letterSpacing: -2, lineHeight: 1,
              background: 'none', border: 'none', outline: 'none', width: '100%',
            }} />
        </div>
        {perDay > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            style={{ background: 'var(--card)', borderRadius: 14, padding: '12px 16px', marginTop: 12, display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 13, color: 'var(--text2)' }}>That&apos;s roughly</span>
            <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)' }}>€{perDay}/day</span>
          </motion.div>
        )}
      </div>

      {/* Duration */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: 'var(--text3)', marginBottom: 10 }}>
          DURATION
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {DURATION_OPTIONS.map(d => (
            <button key={d.weeks} onClick={() => onDuration(d.weeks)}
              style={{
                padding: '8px 16px', borderRadius: 999, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 700,
                background: durationWeeks === d.weeks ? '#000' : 'var(--card)',
                color: durationWeeks === d.weeks ? '#fff' : 'var(--text2)',
              }}>
              {d.label}
            </button>
          ))}
        </div>
      </div>

      {/* Travel style */}
      <div>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: 'var(--text3)', marginBottom: 10 }}>
          TRAVEL STYLE
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {TRAVELER_TYPES.map(t => (
            <button key={t.value} onClick={() => onTraveler(t.value)}
              style={{
                display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 999, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 700,
                background: travelerType === t.value ? '#000' : 'var(--card)',
                color: travelerType === t.value ? '#fff' : 'var(--text2)',
              }}>
              <span>{t.emoji}</span> {t.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ── Step 4: Launch ──────────────────────────────────────────────────────────── */
function StepLaunch({ data }: { data: State }) {
  const region = REGIONS.find(r => r.value === data.region)
  const traveler = TRAVELER_TYPES.find(t => t.value === data.travelerType)
  const perDay = data.durationWeeks > 0 && data.budget > 0
    ? Math.round(data.budget / (data.durationWeeks * 7))
    : 0

  return (
    <div>
      <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 12 }}
        style={{ fontSize: 60, marginBottom: 12, display: 'inline-block' }}>
        🎒
      </motion.div>
      <h2 style={{ fontSize: 36, fontWeight: 800, color: 'var(--text)', letterSpacing: -1, lineHeight: 1.1, marginBottom: 6 }}>
        {data.name ? `${data.name}, ready!` : "You're ready!"}
      </h2>
      <p style={{ fontSize: 14, color: 'var(--text2)', marginBottom: 28 }}>Your trip at a glance.</p>

      <div style={{ background: 'var(--card)', borderRadius: 20, overflow: 'hidden', marginBottom: 20 }}>
        {[
          { label: 'DESTINATION', value: `${region?.emoji} ${region?.label}` },
          { label: 'BUDGET',      value: `€${data.budget.toLocaleString()}` },
          { label: 'DURATION',    value: `${data.durationWeeks} weeks` },
          { label: 'PER DAY',     value: perDay > 0 ? `€${perDay}` : '—' },
          { label: 'STYLE',       value: `${traveler?.emoji} ${traveler?.label}` },
        ].map(({ label, value }, i, arr) => (
          <div key={label} style={{
            display: 'flex', justifyContent: 'space-between', padding: '16px 18px',
            borderBottom: i < arr.length - 1 ? '1px solid var(--border)' : 'none',
          }}>
            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: 'var(--text3)', alignSelf: 'center' }}>{label}</span>
            <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)' }}>{value}</span>
          </div>
        ))}
      </div>

      <p style={{ fontSize: 12, color: 'var(--text3)', textAlign: 'center' }}>
        All data is stored locally. No account needed.
      </p>
    </div>
  )
}

/* ── Main ────────────────────────────────────────────────────────────────────── */
const TOTAL_STEPS = 4

export default function OnboardingPage() {
  const router = useRouter()
  const { setProfile, setOnboardingDone } = useTripStore()

  const [step, setStep] = useState(0)
  const [dir, setDir] = useState(1)
  const [data, setData] = useState<State>({
    name: '', region: 'SEA', durationWeeks: 4, budget: 2000, travelerType: 'backpacker',
  })

  const canNext = [
    true, // name is optional
    data.region !== '',
    data.budget >= 100 && data.durationWeeks > 0,
    true,
  ]

  function next() { setDir(1); setStep(s => s + 1) }
  function back() { setDir(-1); setStep(s => s - 1) }

  function finish() {
    setProfile({ name: data.name || 'Traveler', homeCountry: '', currency: 'EUR', travelerType: data.travelerType })
    setOnboardingDone(true)
    router.push('/home')
  }

  const variants = {
    enter: (d: number) => ({ opacity: 0, x: d > 0 ? 32 : -32 }),
    center: { opacity: 1, x: 0 },
    exit:  (d: number) => ({ opacity: 0, x: d > 0 ? -32 : 32 }),
  }

  return (
    <div style={{ minHeight: '100dvh', background: 'var(--surface)', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px 0' }}>
        <button onClick={step > 0 ? back : () => router.push('/')}
          style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--card)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <ArrowLeft size={16} color="var(--text)" />
        </button>
        <ProgressDots total={TOTAL_STEPS} current={step} />
        <button onClick={finish}
          style={{ fontSize: 13, color: 'var(--text3)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
          Skip
        </button>
      </div>

      {/* Content */}
      <div style={{ flex: 1, padding: '24px 24px 0', overflow: 'hidden' }}>
        <AnimatePresence mode="wait" custom={dir}>
          <motion.div key={step} custom={dir} variants={variants}
            initial="enter" animate="center" exit="exit"
            transition={{ duration: 0.2, ease: 'easeInOut' }}>
            {step === 0 && <StepName value={data.name} onChange={v => setData(d => ({ ...d, name: v }))} />}
            {step === 1 && <StepDestination region={data.region} onChange={v => setData(d => ({ ...d, region: v }))} />}
            {step === 2 && (
              <StepBudget
                budget={data.budget} durationWeeks={data.durationWeeks} travelerType={data.travelerType}
                onBudget={v => setData(d => ({ ...d, budget: v }))}
                onDuration={v => setData(d => ({ ...d, durationWeeks: v }))}
                onTraveler={v => setData(d => ({ ...d, travelerType: v }))}
              />
            )}
            {step === 3 && <StepLaunch data={data} />}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* CTA */}
      <div style={{ padding: '24px 24px 40px' }}>
        {step < TOTAL_STEPS - 1 ? (
          <button onClick={next} disabled={!canNext[step]}
            style={{
              width: '100%', padding: 18, borderRadius: 16, border: 'none', cursor: canNext[step] ? 'pointer' : 'not-allowed',
              background: canNext[step] ? '#000' : '#E8E8E8', color: canNext[step] ? '#fff' : '#ABABAB',
              fontSize: 16, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}>
            Continue <ArrowRight size={18} />
          </button>
        ) : (
          <button onClick={finish}
            style={{
              width: '100%', padding: 18, borderRadius: 16, border: 'none', cursor: 'pointer',
              background: '#000', color: '#fff', fontSize: 16, fontWeight: 700,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}>
            Let&apos;s go <ArrowRight size={18} />
          </button>
        )}
      </div>
    </div>
  )
}
