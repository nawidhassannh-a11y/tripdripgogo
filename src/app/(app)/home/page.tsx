'use client'

import Link from 'next/link'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, ArrowRight, MapPin, Clock, TrendingDown } from 'lucide-react'
import { useTripStore } from '@/store/tripStore'
import { HealthRing } from '@/components/HealthRing'
import { CategoryBadge } from '@/components/CategoryBadge'
import { AddExpenseSheet } from '@/components/AddExpenseSheet'
import { calcHealthScore, formatEur, budgetStatus } from '@/lib/utils'
import { cn } from '@/lib/utils'

export default function HomePage() {
  const { activeTrip, activeTripExpenses, totalSpent, loadDemoTrip } = useTripStore()
  const [sheetOpen, setSheetOpen] = useState(false)

  const trip = activeTrip()
  const expenses = activeTripExpenses()
  const spent = totalSpent()

  if (!trip) {
    return (
      <div className="min-h-[calc(100dvh-64px)] flex flex-col items-center justify-center px-6 text-center">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
          <div className="text-5xl mb-4">🌍</div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">No trip yet</h1>
          <p className="text-gray-500 text-sm mb-8">Create your first trip to start tracking.</p>
          <div className="flex flex-col gap-3">
            <Link href="/create-trip" className="btn-primary justify-center py-4">
              Plan a new trip <ArrowRight size={18} />
            </Link>
            <button onClick={loadDemoTrip} className="text-sm text-primary-600 underline">
              Load demo trip
            </button>
          </div>
        </motion.div>
      </div>
    )
  }

  const activeStop = trip.stops.find(s => s.isActive) ?? trip.stops[0]
  const stopBudget = (activeStop?.budgetPerDay ?? 40) * (activeStop?.days ?? 1)
  const stopExpenses = expenses.filter(e => e.stopId === activeStop?.id)
  const stopSpent = stopExpenses.reduce((s, e) => s + e.amountEur, 0)
  const health = calcHealthScore(trip, expenses, [])
  const recentExpenses = expenses.slice(0, 5)
  const pctUsed = trip.totalBudget > 0 ? (spent / trip.totalBudget) * 100 : 0
  const status = budgetStatus(trip.totalBudget > 0 ? Math.round((spent / trip.totalBudget) * 100) : 0)

  return (
    <div className="px-4 pt-5 pb-2 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-400 font-medium">Active trip</p>
          <h1 className="font-bold text-xl text-gray-900 dark:text-white">{trip.emoji} {trip.name}</h1>
        </div>
        <HealthRing score={health.total} size={60} />
      </div>

      <div className="card p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Trip budget</span>
          <span className={cn('text-xs font-bold', status === 'danger' ? 'text-red-500' : status === 'warning' ? 'text-amber-500' : 'text-primary-600')}>
            {formatEur(trip.totalBudget - spent)} left
          </span>
        </div>
        <div className="h-2 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden mb-2">
          <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(100, pctUsed)}%` }} transition={{ duration: 0.8, ease: 'easeOut' }}
            className={cn('h-full rounded-full', status === 'danger' ? 'bg-red-500' : status === 'warning' ? 'bg-amber-400' : 'bg-primary-500')} />
        </div>
        <div className="flex justify-between text-xs text-gray-400">
          <span>{formatEur(spent)} spent</span>
          <span>{formatEur(trip.totalBudget)} total</span>
        </div>
      </div>

      {activeStop && (
        <div className="card p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 rounded-full bg-primary-500 animate-pulse" />
            <span className="text-xs font-semibold text-primary-600 uppercase tracking-wider">Now in</span>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                <MapPin size={14} className="text-primary-500" />{activeStop.city}, {activeStop.country}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">{activeStop.days} days · €{activeStop.budgetPerDay}/day</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-gray-900 dark:text-white">{formatEur(stopSpent)}</p>
              <p className="text-xs text-gray-400">of {formatEur(stopBudget)}</p>
            </div>
          </div>
          <div className="h-1.5 bg-gray-100 dark:bg-slate-700 rounded-full mt-3 overflow-hidden">
            <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(100, stopBudget > 0 ? (stopSpent / stopBudget) * 100 : 0)}%` }}
              transition={{ duration: 0.6, ease: 'easeOut' }} className="h-full rounded-full bg-primary-500" />
          </div>
        </div>
      )}

      <button onClick={() => setSheetOpen(true)}
        className="w-full flex items-center gap-3 card p-4 hover:shadow-card-hover transition-shadow active:scale-[0.99]">
        <div className="w-10 h-10 rounded-xl bg-primary-500 flex items-center justify-center shrink-0">
          <Plus size={20} className="text-white" />
        </div>
        <div className="text-left">
          <p className="font-semibold text-sm text-gray-900 dark:text-white">Add expense</p>
          <p className="text-xs text-gray-400">Quick log or type naturally</p>
        </div>
        <ArrowRight size={16} className="text-gray-300 ml-auto" />
      </button>

      {recentExpenses.length > 0 ? (
        <div>
          <div className="flex items-center justify-between mb-2.5">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
              <Clock size={11} /> Recent
            </p>
            <Link href="/budget" className="text-xs text-primary-600 font-semibold">See all →</Link>
          </div>
          <div className="space-y-2">
            {recentExpenses.map(expense => (
              <motion.div key={expense.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                className="card px-4 py-3 flex items-center gap-3">
                <CategoryBadge category={expense.category} size="md" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{expense.label || expense.raw}</p>
                  {expense.currency !== 'EUR' && <p className="text-[10px] text-gray-400">{expense.amount} {expense.currency}</p>}
                </div>
                <p className="text-sm font-bold text-gray-900 dark:text-white shrink-0">{formatEur(expense.amountEur)}</p>
              </motion.div>
            ))}
          </div>
        </div>
      ) : (
        <div className="card p-6 text-center">
          <TrendingDown size={24} className="text-gray-200 dark:text-slate-700 mx-auto mb-2" />
          <p className="text-sm text-gray-400">No expenses yet</p>
          <p className="text-xs text-gray-300 dark:text-slate-600 mt-0.5">Tap &ldquo;Add expense&rdquo; to start</p>
        </div>
      )}

      <AddExpenseSheet open={sheetOpen} onClose={() => setSheetOpen(false)} />
    </div>
  )
}
