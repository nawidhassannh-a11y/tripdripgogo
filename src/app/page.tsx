'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, MapPin, Wallet, Zap, Shield, WifiOff, Star, Check } from 'lucide-react'
import { AnimateIn } from '@/components/AnimateIn'
import { WaitlistForm } from '@/components/WaitlistForm'

/* ── Data ───────────────────────────────────────────────────────────────── */

const PAIN_POINTS = [
  { icon: '😵', title: 'Decision fatigue', desc: 'Everything to decide alone — where to go, how much to spend, what to book.' },
  { icon: '💸', title: '47% more expensive', desc: 'Solo travelers pay a premium. We help you find the budget that actually works.' },
  { icon: '📂', title: 'Document chaos', desc: '12 tabs open — visas, flights, insurance, boarding passes. All over the place.' },
]

const FEATURES = [
  { Icon: Wallet,    label: 'Budget Engine',    desc: 'Track every cent in any currency' },
  { Icon: Zap,       label: 'AI Route Gen',     desc: 'Route from budget + region in seconds' },
  { Icon: Shield,    label: 'Docs Vault',       desc: 'All bookings in one secure place' },
  { Icon: WifiOff,   label: '100% Offline',     desc: 'Works in the jungle, no signal needed' },
  { Icon: MapPin,    label: 'Trip Builder',     desc: 'Visual route + stop planner' },
  { Icon: ArrowRight,label: 'Smart Links',      desc: 'Best prices auto-surfaced' },
]

const HOW_IT_WORKS = [
  {
    step: '01',
    title: 'Set your budget',
    desc: 'Tell us your total budget and dream region. We calculate a realistic per-day allowance per destination.',
    emoji: '💰',
  },
  {
    step: '02',
    title: 'Build your route',
    desc: 'Add stops manually or let the AI suggest an optimized route based on your budget and travel style.',
    emoji: '🗺️',
  },
  {
    step: '03',
    title: 'Track as you go',
    desc: 'Log expenses in seconds, upload booking confirmations, and get real-time health score updates.',
    emoji: '📱',
  },
]

const TRIP_CARDS = [
  {
    name: 'Lena K.',
    flag: '🇩🇪',
    route: 'Bangkok → Chiang Mai → Hanoi',
    budget: '€2,400',
    days: 42,
    status: '🟢 On budget',
    avatar: 'LK',
    color: 'from-emerald-400 to-teal-500',
  },
  {
    name: 'Marco B.',
    flag: '🇳🇱',
    route: 'Bali → Lombok → Flores',
    budget: '€1,800',
    days: 28,
    status: '🟡 95% used',
    avatar: 'MB',
    color: 'from-primary-500 to-emerald-600',
  },
  {
    name: 'Sofia R.',
    flag: '🇸🇪',
    route: 'Ho Chi Minh → Hoi An → Da Nang',
    budget: '€1,200',
    days: 21,
    status: '🟢 €180 left',
    avatar: 'SR',
    color: 'from-teal-500 to-cyan-500',
  },
]

const SOCIAL_PROOF_NUMBERS = [
  { value: '4.2k', label: 'Trips planned' },
  { value: '€2.1M', label: 'Budgets tracked' },
  { value: '38', label: 'Countries covered' },
]

/* ── Page ───────────────────────────────────────────────────────────────── */

export default function LandingPage() {
  return (
    <div className="min-h-dvh flex flex-col bg-white dark:bg-slate-950">

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 glass border-b border-gray-100 dark:border-slate-800">
        <div className="max-w-md mx-auto px-4 h-14 flex items-center justify-between">
          <span className="font-bold text-gray-900 dark:text-white tracking-tight text-[15px]">
            TripDrip<span className="text-primary-600">GoGo</span>
          </span>
          <Link href="/onboarding" className="btn-primary text-sm py-2 px-5">
            Try free
          </Link>
        </div>
      </header>

      {/* ── Hero ───────────────────────────────────────────────────────── */}
      <section className="gradient-hero text-white px-6 pt-14 pb-20 text-center relative overflow-hidden">
        {/* Decorative blobs */}
        <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-white/5 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-56 h-56 rounded-full bg-white/5 blur-3xl pointer-events-none" />

        <div className="max-w-md mx-auto relative">
          <motion.div
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
            className="text-6xl mb-5 inline-block"
          >
            🌏
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.1 }}
            className="font-display text-[2.75rem] font-bold leading-tight mb-4 text-balance"
          >
            Your Solo Travel OS
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-white/80 text-lg mb-8 leading-relaxed max-w-xs mx-auto"
          >
            Budget-first planning, AI expense tracking, and document management — all offline-capable.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.3 }}
            className="flex flex-col gap-3"
          >
            <Link
              href="/onboarding"
              className="flex items-center justify-center gap-2 bg-white text-primary-700 font-bold py-4 px-8 rounded-full shadow-elevated active:scale-95 transition-transform"
            >
              Start planning for free <ArrowRight size={18} />
            </Link>
            <Link href="/home" className="text-white/70 text-sm py-2 hover:text-white transition-colors">
              Already have a trip? →
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ── Social proof numbers ────────────────────────────────────────── */}
      <section className="bg-primary-600 px-6 py-5">
        <div className="max-w-md mx-auto grid grid-cols-3 gap-4 text-center text-white">
          {SOCIAL_PROOF_NUMBERS.map((s, i) => (
            <AnimateIn key={s.label} delay={i * 0.08} direction="none">
              <p className="text-2xl font-bold">{s.value}</p>
              <p className="text-white/70 text-[11px] font-medium mt-0.5">{s.label}</p>
            </AnimateIn>
          ))}
        </div>
      </section>

      {/* ── Pain Points ────────────────────────────────────────────────── */}
      <section className="px-6 py-14 bg-white dark:bg-slate-900">
        <div className="max-w-md mx-auto space-y-4">
          <AnimateIn>
            <h2 className="text-xl font-bold text-center text-gray-900 dark:text-white mb-8 text-balance">
              Solo travel is hard enough
            </h2>
          </AnimateIn>
          {PAIN_POINTS.map((p, i) => (
            <AnimateIn key={p.title} delay={i * 0.1}>
              <div className="card p-4 flex gap-4">
                <span className="text-2xl mt-0.5 shrink-0">{p.icon}</span>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white text-sm">{p.title}</p>
                  <p className="text-gray-500 dark:text-slate-400 text-sm mt-0.5">{p.desc}</p>
                </div>
              </div>
            </AnimateIn>
          ))}
        </div>
      </section>

      {/* ── How It Works ───────────────────────────────────────────────── */}
      <section className="px-6 py-14 bg-surface dark:bg-surface-dark">
        <div className="max-w-md mx-auto">
          <AnimateIn>
            <h2 className="text-xl font-bold text-center text-gray-900 dark:text-white mb-10">
              Up and running in 3 steps
            </h2>
          </AnimateIn>

          <div className="relative">
            {/* Vertical connector line */}
            <div className="absolute left-[22px] top-10 bottom-10 w-px bg-gradient-to-b from-primary-500 via-primary-300 to-primary-100 dark:to-primary-900" />

            <div className="space-y-8">
              {HOW_IT_WORKS.map((step, i) => (
                <AnimateIn key={step.step} delay={i * 0.12} direction="left">
                  <div className="flex gap-5">
                    {/* Timeline dot */}
                    <div className="flex flex-col items-center shrink-0">
                      <div className="w-11 h-11 rounded-full gradient-hero flex items-center justify-center shadow-elevated z-10 text-lg">
                        {step.emoji}
                      </div>
                    </div>
                    {/* Content */}
                    <div className="pt-2 pb-2">
                      <p className="text-[10px] font-bold text-primary-500 tracking-widest uppercase mb-1">
                        Step {step.step}
                      </p>
                      <p className="font-semibold text-gray-900 dark:text-white text-sm mb-1">{step.title}</p>
                      <p className="text-gray-500 dark:text-slate-400 text-sm leading-relaxed">{step.desc}</p>
                    </div>
                  </div>
                </AnimateIn>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ───────────────────────────────────────────────────── */}
      <section className="px-6 py-14 bg-white dark:bg-slate-900">
        <div className="max-w-md mx-auto">
          <AnimateIn>
            <h2 className="text-xl font-bold text-center text-gray-900 dark:text-white mb-8">
              One app. Everything.
            </h2>
          </AnimateIn>
          <div className="grid grid-cols-2 gap-3">
            {FEATURES.map(({ Icon, label, desc }, i) => (
              <AnimateIn key={label} delay={i * 0.07}>
                <div className="card p-4 h-full">
                  <div className="w-9 h-9 rounded-lg bg-primary-50 dark:bg-primary-950 flex items-center justify-center mb-3">
                    <Icon size={18} className="text-primary-600" />
                  </div>
                  <p className="font-semibold text-gray-900 dark:text-white text-sm">{label}</p>
                  <p className="text-gray-400 text-xs mt-0.5 leading-relaxed">{desc}</p>
                </div>
              </AnimateIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── Trip Cards / Social Proof ───────────────────────────────────── */}
      <section className="px-6 py-14 bg-surface dark:bg-surface-dark">
        <div className="max-w-md mx-auto">
          <AnimateIn>
            <div className="flex items-center gap-2 justify-center mb-2">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={14} className="text-amber-400 fill-amber-400" />
              ))}
            </div>
            <h2 className="text-xl font-bold text-center text-gray-900 dark:text-white mb-2">
              Travelers love it
            </h2>
            <p className="text-gray-500 text-sm text-center mb-8">Real trips, real budgets</p>
          </AnimateIn>

          <div className="space-y-3">
            {TRIP_CARDS.map((card, i) => (
              <AnimateIn key={card.name} delay={i * 0.1} direction="right">
                <div className="card p-4 flex items-center gap-4">
                  {/* Avatar */}
                  <div className={`w-11 h-11 rounded-full bg-gradient-to-br ${card.color} flex items-center justify-center shrink-0`}>
                    <span className="text-white text-xs font-bold">{card.avatar}</span>
                  </div>
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <p className="font-semibold text-sm text-gray-900 dark:text-white">{card.name}</p>
                      <span className="text-sm">{card.flag}</span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-slate-400 truncate">{card.route}</p>
                  </div>
                  {/* Budget badge */}
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold text-gray-900 dark:text-white">{card.budget}</p>
                    <p className="text-[10px] text-gray-400">{card.days}d</p>
                  </div>
                </div>
              </AnimateIn>
            ))}
          </div>

          {/* Status pills */}
          <AnimateIn delay={0.35}>
            <div className="flex gap-2 justify-center mt-4 flex-wrap">
              {TRIP_CARDS.map(card => (
                <span key={card.name} className="text-xs bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-full px-3 py-1 text-gray-600 dark:text-slate-300">
                  {card.status}
                </span>
              ))}
            </div>
          </AnimateIn>
        </div>
      </section>

      {/* ── Testimonial ────────────────────────────────────────────────── */}
      <section className="px-6 py-14 bg-white dark:bg-slate-900">
        <div className="max-w-md mx-auto">
          <AnimateIn>
            <div className="card p-6 text-center">
              <p className="font-display text-xl text-gray-900 dark:text-white mb-4 leading-relaxed">
                &ldquo;Finally stopped overspending in Southeast Asia. Tracked every meal, every bus, every night. Came home €340 under budget.&rdquo;
              </p>
              <div className="flex items-center justify-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center">
                  <span className="text-white text-xs font-bold">JB</span>
                </div>
                <div className="text-left">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">Julia B.</p>
                  <p className="text-xs text-gray-400">56 days, SEA loop 🇹🇭🇻🇳🇮🇩</p>
                </div>
              </div>
            </div>
          </AnimateIn>
        </div>
      </section>

      {/* ── Waitlist CTA ───────────────────────────────────────────────── */}
      <section className="px-6 py-16 gradient-hero text-white text-center relative overflow-hidden">
        <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-white/5 blur-3xl pointer-events-none" />
        <div className="max-w-md mx-auto relative">
          <AnimateIn>
            <div className="text-4xl mb-4">✈️</div>
            <h2 className="font-display text-3xl font-bold mb-3 text-balance">
              Ready to travel smarter?
            </h2>
            <p className="text-white/80 mb-8 text-sm leading-relaxed">
              Join 4,200+ solo travelers who plan better with TripDripGoGo.
              Free forever. No account needed to start.
            </p>

            {/* Dual CTA */}
            <div className="flex flex-col gap-3 mb-10">
              <Link
                href="/onboarding"
                className="flex items-center justify-center gap-2 bg-white text-primary-700 font-bold py-4 px-8 rounded-full shadow-elevated active:scale-95 transition-transform"
              >
                Plan my trip — it&apos;s free <ArrowRight size={18} />
              </Link>
            </div>

            {/* Waitlist form */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 border border-white/20">
              <p className="text-sm font-semibold mb-3">Get notified when new features launch</p>
              <WaitlistForm />
            </div>
          </AnimateIn>
        </div>
      </section>

      {/* ── Feature checklist ──────────────────────────────────────────── */}
      <section className="px-6 py-10 bg-surface dark:bg-surface-dark">
        <div className="max-w-md mx-auto">
          <AnimateIn>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest text-center mb-6">What&apos;s included — free</p>
            <div className="grid grid-cols-2 gap-2">
              {[
                'Unlimited trips',
                'AI route generator',
                'Expense tracking',
                'Budget alerts',
                'Docs vault',
                'Offline mode',
                'Multi-currency',
                'Health score',
              ].map((feat) => (
                <div key={feat} className="flex items-center gap-2 text-sm text-gray-700 dark:text-slate-300">
                  <Check size={14} className="text-primary-500 shrink-0" />
                  {feat}
                </div>
              ))}
            </div>
          </AnimateIn>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────────────── */}
      <footer className="px-6 py-8 bg-white dark:bg-slate-900 border-t border-gray-100 dark:border-slate-800">
        <div className="max-w-md mx-auto text-center">
          <p className="font-bold text-gray-900 dark:text-white mb-1">
            TripDrip<span className="text-primary-600">GoGo</span>
          </p>
          <p className="text-xs text-gray-400">Solo Travel OS · Made for backpackers · © 2025</p>
        </div>
      </footer>

    </div>
  )
}
