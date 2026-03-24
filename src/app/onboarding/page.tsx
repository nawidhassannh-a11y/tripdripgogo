'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { ArrowRight, ArrowLeft, Check } from 'lucide-react'
import { useTripStore } from '@/store/tripStore'
import { cn } from '@/lib/utils'

/* ── Types ─────────────────────────────────────────────────────────────────── */

interface OnboardingState {
  region: string
  durationWeeks: number
  budget: number
  travelerType: 'backpacker' | 'budget' | 'comfort' | 'flashpacker'
  name: string
}

/* ── Data ───────────────────────────────────────────────────────────────────── */

const REGIONS = [
  { value: 'SEA',    label: 'Southeast Asia',  emoji: '🌴', hint: '~€25–45/day' },
  { value: 'EUROPE', label: 'Europe',           emoji: '🏰', hint: '~€60–120/day' },
  { value: 'LATAM',  label: 'Latin America',    emoji: '🦜', hint: '~€30–55/day' },
  { value: 'SOUTH_ASIA', label: 'South Asia',  emoji: '🕌', hint: '~€20–35/day' },
  { value: 'EAST_ASIA',  label: 'East Asia',   emoji: '🏯', hint: '~€40–80/day' },
  { value: 'AFRICA', label: 'Africa',           emoji: '🦁', hint: '~€25–50/day' },
  { value: 'MIDEAST', label: 'Middle East',    emoji: '🌙', hint: '~€35–70/day' },
  { value: 'OTHER',  label: 'Somewhere else',   emoji: '🌍', hint: 'Custom budget' },
]

type TravelerType = 'backpacker' | 'budget' | 'comfort' | 'flashpacker'
const TRAVELER_TYPES: { value: TravelerType; label: string; emoji: string; desc: string }[] = [
  { value: 'backpacker', label: 'Backpacker',   emoji: '🎒', desc: 'Hostels, street food, local transport' },
  { value: 'budget',     label: 'Budget',       emoji: '💰', desc: 'Mix of hostels & private rooms' },
  { value: 'comfort',    label: 'Comfort',      emoji: '🛋️', desc: 'Private rooms, sit-down restaurants' },
  { value: 'flashpacker',label: 'Flashpacker',  emoji: '✨', desc: 'Nice stays, but still adventure-first' },
]

const DURATION_OPTIONS = [
  { weeks: 2,  label: '2 weeks' },
  { weeks: 4,  label: '1 month' },
  { weeks: 6,  label: '6 weeks' },
  { weeks: 8,  label: '2 months' },
  { weeks: 12, label: '3 months' },
  { weeks: 24, label: '6 months' },
]

/* ── Step components ────────────────────────────────────────────────────────── */

function StepRegion({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Where to?</h2>
      <p className="text-gray-500 text-sm mb-6">Pick your dream region to start.</p>
      <div className="grid grid-cols-2 gap-2.5">
        {REGIONS.map(r => (
          <button
            key={r.value}
            onClick={() => onChange(r.value)}
            className={cn(
              'flex flex-col items-start p-3.5 rounded-xl border-2 text-left transition-all active:scale-95',
              value === r.value
                ? 'border-primary-500 bg-primary-50 dark:bg-primary-950'
                : 'border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-primary-200'
            )}
          >
            <span className="text-2xl mb-1.5">{r.emoji}</span>
            <p className="font-semibold text-sm text-gray-900 dark:text-white leading-tight">{r.label}</p>
            <p className="text-[11px] text-gray-400 mt-0.5">{r.hint}</p>
            {value === r.value && (
              <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary-500 flex items-center justify-center">
                <Check size={11} className="text-white" />
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}

function StepBudget({
  budget, durationWeeks,
  onBudget, onDuration
}: {
  budget: number
  durationWeeks: number
  onBudget: (v: number) => void
  onDuration: (v: number) => void
}) {
  const perDay = durationWeeks > 0 ? Math.round(budget / (durationWeeks * 7)) : 0

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">What&apos;s your budget?</h2>
      <p className="text-gray-500 text-sm mb-6">We&apos;ll calculate how much you can spend per day.</p>

      {/* Budget input */}
      <div className="mb-6">
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">
          Total budget (€)
        </label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">€</span>
          <input
            type="number"
            min={100}
            max={50000}
            step={50}
            value={budget || ''}
            onChange={e => onBudget(Number(e.target.value))}
            placeholder="2000"
            className="input pl-9 text-xl font-bold"
          />
        </div>
      </div>

      {/* Duration picker */}
      <div className="mb-6">
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">
          Trip duration
        </label>
        <div className="grid grid-cols-3 gap-2">
          {DURATION_OPTIONS.map(d => (
            <button
              key={d.weeks}
              onClick={() => onDuration(d.weeks)}
              className={cn(
                'py-2.5 rounded-xl border-2 text-sm font-semibold transition-all active:scale-95',
                durationWeeks === d.weeks
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-950 text-primary-700 dark:text-primary-300'
                  : 'border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-300 hover:border-primary-200'
              )}
            >
              {d.label}
            </button>
          ))}
        </div>
      </div>

      {/* Per-day calc */}
      {budget > 0 && durationWeeks > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="gradient-budget rounded-xl p-4 text-white text-center"
        >
          <p className="text-white/70 text-xs mb-1">That&apos;s roughly</p>
          <p className="text-3xl font-bold">€{perDay}<span className="text-lg font-normal">/day</span></p>
          <p className="text-white/70 text-xs mt-1">{durationWeeks * 7} days total</p>
        </motion.div>
      )}
    </div>
  )
}

function StepTravelerType({
  value, name,
  onChange, onName
}: {
  value: string
  name: string
  onChange: (v: TravelerType) => void
  onName: (v: string) => void
}) {
  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Your travel style</h2>
      <p className="text-gray-500 text-sm mb-5">We&apos;ll set smarter defaults for you.</p>

      {/* Name */}
      <div className="mb-5">
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">
          First name (optional)
        </label>
        <input
          type="text"
          placeholder="What do your travel mates call you?"
          value={name}
          onChange={e => onName(e.target.value)}
          className="input text-sm"
        />
      </div>

      {/* Traveler type */}
      <div className="space-y-2.5">
        {TRAVELER_TYPES.map(t => (
          <button
            key={t.value}
            onClick={() => onChange(t.value)}
            className={cn(
              'w-full flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all active:scale-95',
              value === t.value
                ? 'border-primary-500 bg-primary-50 dark:bg-primary-950'
                : 'border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-primary-200'
            )}
          >
            <span className="text-2xl shrink-0">{t.emoji}</span>
            <div className="flex-1">
              <p className="font-semibold text-sm text-gray-900 dark:text-white">{t.label}</p>
              <p className="text-xs text-gray-400 mt-0.5">{t.desc}</p>
            </div>
            {value === t.value && (
              <div className="w-5 h-5 rounded-full bg-primary-500 flex items-center justify-center shrink-0">
                <Check size={11} className="text-white" />
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}

function StepReady({ data }: { data: OnboardingState }) {
  const region = REGIONS.find(r => r.value === data.region)
  const traveler = TRAVELER_TYPES.find(t => t.value === data.travelerType)
  const perDay = data.durationWeeks > 0 && data.budget > 0
    ? Math.round(data.budget / (data.durationWeeks * 7))
    : 0

  return (
    <div>
      <div className="text-center mb-6">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 12 }}
          className="text-5xl mb-3 inline-block"
        >
          🎉
        </motion.div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
          {data.name ? `${data.name}, you're ready!` : "You're all set!"}
        </h2>
        <p className="text-gray-500 text-sm">Here&apos;s your trip snapshot</p>
      </div>

      {/* Preview card */}
      <div className="card p-5 mb-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Destination</span>
          <span className="font-semibold text-sm text-gray-900 dark:text-white">
            {region?.emoji} {region?.label}
          </span>
        </div>
        <div className="h-px bg-gray-100 dark:bg-slate-700" />
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Duration</span>
          <span className="font-semibold text-sm text-gray-900 dark:text-white">
            {data.durationWeeks} weeks
          </span>
        </div>
        <div className="h-px bg-gray-100 dark:bg-slate-700" />
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Budget</span>
          <span className="font-bold text-primary-600">€{data.budget.toLocaleString()}</span>
        </div>
        {perDay > 0 && (
          <>
            <div className="h-px bg-gray-100 dark:bg-slate-700" />
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Daily allowance</span>
              <span className="font-bold text-gray-900 dark:text-white">€{perDay}/day</span>
            </div>
          </>
        )}
        <div className="h-px bg-gray-100 dark:bg-slate-700" />
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Style</span>
          <span className="font-semibold text-sm text-gray-900 dark:text-white">
            {traveler?.emoji} {traveler?.label}
          </span>
        </div>
      </div>

      <p className="text-xs text-gray-400 text-center">
        Create an account to save your trip, or continue without one — we&apos;ll store it locally.
      </p>
    </div>
  )
}

/* ── Main page ─────────────────────────────────────────────────────────────── */

const TOTAL_STEPS = 4

export default function OnboardingPage() {
  const router = useRouter()
  const { setProfile, setOnboardingDone } = useTripStore()

  const [step, setStep] = useState(0)
  const [direction, setDirection] = useState(1)
  const [data, setData] = useState<OnboardingState>({
    region: '',
    durationWeeks: 4,
    budget: 2000,
    travelerType: 'backpacker',
    name: '',
  })

  const stepValid = [
    data.region !== '',
    data.budget >= 100 && data.durationWeeks > 0,
    !!data.travelerType,
    true,
  ]

  function goNext() {
    if (step < TOTAL_STEPS - 1) {
      setDirection(1)
      setStep(s => s + 1)
    }
  }

  function goBack() {
    if (step > 0) {
      setDirection(-1)
      setStep(s => s - 1)
    }
  }

  function finish(saveAccount: boolean) {
    setProfile({
      name: data.name || 'Traveler',
      homeCountry: '',
      currency: 'EUR',
      travelerType: data.travelerType,
    })
    setOnboardingDone(true)

    if (saveAccount) {
      router.push(`/auth/sign-in?next=/create-trip`)
    } else {
      router.push('/create-trip')
    }
  }

  const variants = {
    enter: (d: number) => ({ opacity: 0, x: d > 0 ? 40 : -40 }),
    center: { opacity: 1, x: 0 },
    exit:  (d: number) => ({ opacity: 0, x: d > 0 ? -40 : 40 }),
  }

  return (
    <div className="min-h-dvh flex flex-col bg-surface dark:bg-surface-dark">
      {/* Header */}
      <header className="max-w-md mx-auto w-full px-5 pt-6 pb-2 flex items-center justify-between">
        <button
          onClick={goBack}
          className={cn(
            'w-9 h-9 rounded-full flex items-center justify-center transition-all',
            step > 0
              ? 'text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800'
              : 'invisible'
          )}
        >
          <ArrowLeft size={20} />
        </button>

        {/* Progress dots */}
        <div className="flex items-center gap-1.5">
          {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
            <div
              key={i}
              className={cn(
                'rounded-full transition-all duration-300',
                i === step
                  ? 'w-6 h-2 bg-primary-500'
                  : i < step
                    ? 'w-2 h-2 bg-primary-300'
                    : 'w-2 h-2 bg-gray-200 dark:bg-slate-700'
              )}
            />
          ))}
        </div>

        <button
          onClick={() => finish(false)}
          className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-slate-300 transition-colors py-2 px-1"
        >
          Skip
        </button>
      </header>

      {/* Step content */}
      <main className="flex-1 overflow-hidden max-w-md mx-auto w-full px-5 pt-4 pb-6">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={step}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="h-full"
          >
            {step === 0 && (
              <StepRegion value={data.region} onChange={v => setData(d => ({ ...d, region: v }))} />
            )}
            {step === 1 && (
              <StepBudget
                budget={data.budget}
                durationWeeks={data.durationWeeks}
                onBudget={v => setData(d => ({ ...d, budget: v }))}
                onDuration={v => setData(d => ({ ...d, durationWeeks: v }))}
              />
            )}
            {step === 2 && (
              <StepTravelerType
                value={data.travelerType}
                name={data.name}
                onChange={v => setData(d => ({ ...d, travelerType: v }))}
                onName={v => setData(d => ({ ...d, name: v }))}
              />
            )}
            {step === 3 && <StepReady data={data} />}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* CTA */}
      <footer className="max-w-md mx-auto w-full px-5 pb-8 pt-3 space-y-2.5">
        {step < TOTAL_STEPS - 1 ? (
          <button
            onClick={goNext}
            disabled={!stepValid[step]}
            className={cn(
              'btn-primary w-full justify-center py-4',
              !stepValid[step] && 'opacity-40 cursor-not-allowed'
            )}
          >
            Continue <ArrowRight size={18} />
          </button>
        ) : (
          <>
            <button
              onClick={() => finish(true)}
              className="btn-primary w-full justify-center py-4"
            >
              Save my trip <ArrowRight size={18} />
            </button>
            <button
              onClick={() => finish(false)}
              className="w-full text-center text-sm text-gray-400 hover:text-gray-600 dark:hover:text-slate-300 py-2 transition-colors"
            >
              Continue without account
            </button>
          </>
        )}
      </footer>
    </div>
  )
}
