'use client'

import Link from 'next/link'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, MapPin, ArrowRight } from 'lucide-react'
import { useTripStore } from '@/store/tripStore'
import { CategoryBadge } from '@/components/CategoryBadge'
import { AddExpenseSheet } from '@/components/AddExpenseSheet'
import { formatEur, budgetStatus } from '@/lib/utils'
import { cn } from '@/lib/utils'

export default function HomePage() {
  const { activeTrip, activeTripExpenses, totalSpent, loadDemoTrip } = useTripStore()
  const [sheetOpen, setSheetOpen] = useState(false)

  const trip = activeTrip()
  const expenses = activeTripExpenses()
  const spent = totalSpent()

  /* ── Empty state ──────────────────────────────────────────────────────── */
  if (!trip) {
    return (
      <div className="min-h-[calc(100dvh-64px)] flex flex-col items-center justify-center px-6 text-center gap-5">
        <div className="text-5xl">🌍</div>
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-1">No trip yet</h1>
          <p className="text-gray-400 text-sm">Start planning or load a demo.</p>
        </div>
        <Link href="/create-trip" className="btn-primary px-8 py-3.5">Plan a trip <ArrowRight size={16} /></Link>
        <button onClick={loadDemoTrip} className="text-sm text-gray-400 underline">Load demo</button>
      </div>
    )
  }

  /* ── Derived state ────────────────────────────────────────────────────── */
  const remaining = trip.totalBudget - spent
  const pct = trip.totalBudget > 0 ? Math.min(100, (spent / trip.totalBudget) * 100) : 0
  const status = budgetStatus(Math.round(pct))
  const activeStop = trip.stops.find(s => s.isActive) ?? trip.stops[0]
  const recent = expenses.slice(0, 8)

  const heroGradient =
    status === 'danger'  ? 'from-red-500 to-red-600' :
    status === 'warning' ? 'from-amber-500 to-orange-500' :
                           'from-primary-500 to-emerald-600'

  /* ── Arc math (SVG) ───────────────────────────────────────────────────── */
  const r = 54
  const circ = 2 * Math.PI * r
  const dash = circ * (1 - pct / 100)

  return (
    <div className="min-h-[calc(100dvh-64px)] flex flex-col">

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <div className={cn('bg-gradient-to-br text-white px-6 pt-8 pb-10 relative overflow-hidden', heroGradient)}>
        {/* subtle blob */}
        <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full bg-white/10 blur-2xl pointer-events-none" />

        {/* Trip chip */}
        <div className="flex items-center gap-1.5 mb-6">
          <span className="text-white/70 text-sm">{trip.emoji}</span>
          <span className="text-white/70 text-sm font-medium">{trip.name}</span>
          {activeStop && (
            <>
              <span className="text-white/40 text-xs">·</span>
              <MapPin size={11} className="text-white/60" />
              <span className="text-white/70 text-xs">{activeStop.city}</span>
            </>
          )}
        </div>

        {/* Main number + arc */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white/60 text-xs font-medium uppercase tracking-wider mb-1">Remaining</p>
            <motion.p
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              className="text-4xl font-bold tracking-tight"
            >
              {formatEur(remaining)}
            </motion.p>
            <p className="text-white/60 text-sm mt-1">of {formatEur(trip.totalBudget)} · {pct.toFixed(0)}% used</p>
          </div>

          {/* SVG arc progress */}
          <svg width="72" height="72" viewBox="0 0 120 120" className="-rotate-90">
            <circle cx="60" cy="60" r={r} fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="10" />
            <motion.circle
              cx="60" cy="60" r={r} fill="none"
              stroke="white" strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={circ}
              initial={{ strokeDashoffset: circ }}
              animate={{ strokeDashoffset: dash }}
              transition={{ duration: 1, ease: 'easeOut' }}
            />
          </svg>
        </div>
      </div>

      {/* ── Feed ──────────────────────────────────────────────────────────── */}
      <div className="flex-1 bg-surface dark:bg-surface-dark px-4 pt-4 pb-24">
        {recent.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-3xl mb-3">💸</p>
            <p className="text-gray-400 text-sm">No expenses yet.</p>
            <p className="text-gray-300 dark:text-slate-600 text-xs mt-1">Tap + to log your first one.</p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Recent</p>
              <Link href="/budget" className="text-xs text-primary-600 font-semibold">All →</Link>
            </div>
            <div className="space-y-px">
              {recent.map((expense, i) => (
                <motion.div
                  key={expense.id}
                  initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="flex items-center gap-3 py-3 border-b border-gray-100 dark:border-slate-800 last:border-0"
                >
                  <CategoryBadge category={expense.category} size="md" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {expense.label || expense.raw}
                    </p>
                    {expense.currency !== 'EUR' && (
                      <p className="text-[10px] text-gray-400">{expense.amount} {expense.currency}</p>
                    )}
                  </div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white shrink-0">
                    {formatEur(expense.amountEur)}
                  </p>
                </motion.div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* ── FAB ───────────────────────────────────────────────────────────── */}
      <button
        onClick={() => setSheetOpen(true)}
        className="fixed bottom-20 right-4 z-30 w-14 h-14 rounded-full bg-primary-500 flex items-center justify-center shadow-elevated active:scale-95 transition-transform"
      >
        <Plus size={26} className="text-white" />
      </button>

      <AddExpenseSheet open={sheetOpen} onClose={() => setSheetOpen(false)} />
    </div>
  )
}
