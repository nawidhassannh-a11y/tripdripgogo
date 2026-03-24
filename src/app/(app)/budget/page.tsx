'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Trash2, Filter, Lightbulb, Loader2 } from 'lucide-react'
import { useTripStore } from '@/store/tripStore'
import { HealthRing } from '@/components/HealthRing'
import { CategoryBadge, CATEGORY_META } from '@/components/CategoryBadge'
import { AddExpenseSheet } from '@/components/AddExpenseSheet'
import { calcHealthScore, formatEur, budgetStatus } from '@/lib/utils'
import { cn } from '@/lib/utils'
import type { ExpenseCategory } from '@/types'

const ALL_CATEGORIES = Object.keys(CATEGORY_META) as ExpenseCategory[]

export default function BudgetPage() {
  const { activeTrip, activeTripExpenses, totalSpent, removeExpense } = useTripStore()
  const [sheetOpen, setSheetOpen] = useState(false)
  const [filterCat, setFilterCat] = useState<ExpenseCategory | 'all'>('all')
  const [rescueTips, setRescueTips] = useState<string[]>([])
  const [rescueLoading, setRescueLoading] = useState(false)
  const [rescueOpen, setRescueOpen] = useState(false)

  const trip = activeTrip()
  const allExpenses = activeTripExpenses()
  const spent = totalSpent()

  if (!trip) {
    return (
      <div className="min-h-[calc(100dvh-64px)] flex flex-col items-center justify-center px-6 text-center">
        <div className="text-4xl mb-3">💸</div>
        <p className="text-gray-500 text-sm">No active trip. <a href="/create-trip" className="text-primary-600 underline">Create one</a></p>
      </div>
    )
  }

  const health = calcHealthScore(trip, allExpenses, [])

  async function fetchRescueTips() {
    if (rescueTips.length > 0) { setRescueOpen(p => !p); return }
    setRescueLoading(true); setRescueOpen(true)
    const topCategories = ALL_CATEGORIES
      .map(cat => ({ category: cat, total: allExpenses.filter(e => e.category === cat).reduce((s, e) => s + e.amountEur, 0) }))
      .filter(c => c.total > 0).sort((a, b) => b.total - a.total).slice(0, 3)
    const activeStop = trip?.stops.find(s => s.isActive) ?? trip?.stops[0]
    try {
      const res = await fetch('/api/budget-rescue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ totalBudget: trip?.totalBudget ?? 0, spent, daysRemaining: trip?.durationWeeks ? trip.durationWeeks * 7 : 30, topCategories, currentCity: activeStop?.city ?? 'current city', travelerType: 'backpacker' }),
      })
      const data = await res.json()
      setRescueTips(data.tips ?? [])
    } catch { setRescueTips(['Track every expense to stay on budget.']) }
    setRescueLoading(false)
  }
  const status = budgetStatus(trip.totalBudget > 0 ? Math.round((spent / trip.totalBudget) * 100) : 0)
  const remaining = trip.totalBudget - spent
  const pct = trip.totalBudget > 0 ? Math.min(100, (spent / trip.totalBudget) * 100) : 0

  const byCategory = ALL_CATEGORIES.map(cat => ({
    cat,
    total: allExpenses.filter(e => e.category === cat).reduce((s, e) => s + e.amountEur, 0),
    count: allExpenses.filter(e => e.category === cat).length,
  })).filter(c => c.total > 0).sort((a, b) => b.total - a.total)

  const filtered = filterCat === 'all' ? allExpenses : allExpenses.filter(e => e.category === filterCat)

  const stopBreakdown = trip.stops.map(stop => ({
    stop,
    spent: allExpenses.filter(e => e.stopId === stop.id).reduce((s, e) => s + e.amountEur, 0),
    budget: stop.budgetPerDay * stop.days,
  }))

  return (
    <div className="px-4 pt-5 pb-2 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-400 font-medium">Budget tracker</p>
          <h1 className="font-bold text-xl text-gray-900 dark:text-white">{trip.emoji} {trip.name}</h1>
        </div>
        <HealthRing score={health.total} size={64} />
      </div>

      <div className={cn('rounded-2xl p-5 text-white', status === 'danger' ? 'bg-red-500' : status === 'warning' ? 'bg-amber-500' : 'gradient-budget')}>
        <div className="flex justify-between items-start mb-4">
          <div>
            <p className="text-white/70 text-xs mb-1">Remaining</p>
            <p className="text-3xl font-bold">{formatEur(remaining)}</p>
          </div>
          <div className="text-right">
            <p className="text-white/70 text-xs mb-1">Spent</p>
            <p className="text-xl font-bold">{formatEur(spent)}</p>
          </div>
        </div>
        <div className="h-2 bg-white/20 rounded-full overflow-hidden">
          <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.8 }}
            className="h-full bg-white rounded-full" />
        </div>
        <p className="text-white/70 text-xs mt-2 text-right">{pct.toFixed(0)}% of {formatEur(trip.totalBudget)}</p>
      </div>

      {/* Budget rescue */}
      <button onClick={fetchRescueTips}
        className="w-full flex items-center gap-3 card p-3.5 hover:shadow-card-hover transition-shadow active:scale-[0.99]">
        <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950 flex items-center justify-center shrink-0">
          {rescueLoading ? <Loader2 size={16} className="text-amber-500 animate-spin" /> : <Lightbulb size={16} className="text-amber-500" />}
        </div>
        <p className="text-sm font-semibold text-gray-900 dark:text-white flex-1 text-left">Budget rescue tips</p>
        <span className="text-xs text-gray-400">{rescueOpen ? '↑' : '↓'}</span>
      </button>
      <AnimatePresence>
        {rescueOpen && rescueTips.length > 0 && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            className="card p-4 space-y-2.5 overflow-hidden">
            {rescueTips.map((tip, i) => (
              <div key={i} className="flex gap-2.5">
                <span className="text-amber-400 shrink-0 mt-0.5">💡</span>
                <p className="text-sm text-gray-700 dark:text-slate-300 leading-relaxed">{tip}</p>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {byCategory.length > 0 && (
        <div className="card p-4">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">By category</p>
          <div className="space-y-2.5">
            {byCategory.map(({ cat, total, count }) => {
              const pctOfSpent = spent > 0 ? (total / spent) * 100 : 0
              const barColor = cat === 'food' ? 'bg-orange-400' : cat === 'transport' ? 'bg-blue-400' : cat === 'stay' ? 'bg-purple-400' : cat === 'activities' ? 'bg-pink-400' : cat === 'drinks' ? 'bg-amber-400' : 'bg-gray-400'
              return (
                <div key={cat}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <CategoryBadge category={cat} size="sm" showLabel />
                      <span className="text-xs text-gray-400">{count}x</span>
                    </div>
                    <span className="text-xs font-bold text-gray-900 dark:text-white">{formatEur(total)}</span>
                  </div>
                  <div className="h-1 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${pctOfSpent}%` }}
                      transition={{ duration: 0.5 }} className={cn('h-full rounded-full', barColor)} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {stopBreakdown.length > 1 && (
        <div className="card p-4">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">By stop</p>
          <div className="space-y-2">
            {stopBreakdown.map(({ stop, spent: s, budget: b }) => (
              <div key={stop.id} className="flex items-center gap-3">
                <div className={cn('w-2 h-2 rounded-full shrink-0', stop.isActive ? 'bg-primary-500 animate-pulse' : 'bg-gray-300')} />
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center">
                    <p className="text-xs font-medium text-gray-700 dark:text-slate-300 truncate">{stop.city}</p>
                    <p className="text-xs font-bold text-gray-900 dark:text-white shrink-0 ml-2">{formatEur(s)}<span className="text-gray-400 font-normal">/{formatEur(b)}</span></p>
                  </div>
                  <div className="h-1 bg-gray-100 dark:bg-slate-700 rounded-full mt-1 overflow-hidden">
                    <div className={cn('h-full rounded-full', b > 0 && s / b > 1 ? 'bg-red-400' : 'bg-primary-400')}
                      style={{ width: `${Math.min(100, b > 0 ? (s / b) * 100 : 0)}%` }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1 mb-3">
          <button onClick={() => setFilterCat('all')}
            className={cn('shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-all',
              filterCat === 'all' ? 'bg-primary-500 text-white' : 'bg-gray-100 dark:bg-slate-800 text-gray-500')}>
            All ({allExpenses.length})
          </button>
          {byCategory.map(({ cat, count }) => (
            <button key={cat} onClick={() => setFilterCat(cat)}
              className={cn('shrink-0 flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-semibold transition-all',
                filterCat === cat ? 'bg-primary-500 text-white' : 'bg-gray-100 dark:bg-slate-800 text-gray-500')}>
              {CATEGORY_META[cat].emoji} {count}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="card p-6 text-center">
            <Filter size={20} className="text-gray-200 mx-auto mb-2" />
            <p className="text-sm text-gray-400">No expenses yet</p>
          </div>
        ) : (
          <div className="space-y-2">
            <AnimatePresence>
              {filtered.map(expense => (
                <motion.div key={expense.id} layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -20 }}
                  className="card px-4 py-3 flex items-center gap-3">
                  <CategoryBadge category={expense.category} size="md" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{expense.label || expense.raw}</p>
                    <p className="text-[10px] text-gray-400">
                      {expense.currency !== 'EUR' ? `${expense.amount} ${expense.currency} · ` : ''}
                      {new Date(expense.date).toLocaleDateString('en', { month: 'short', day: 'numeric' })}
                    </p>
                  </div>
                  <p className="text-sm font-bold text-gray-900 dark:text-white shrink-0">{formatEur(expense.amountEur)}</p>
                  <button onClick={() => removeExpense(expense.id)} className="text-gray-200 hover:text-red-400 transition-colors ml-1">
                    <Trash2 size={14} />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      <div className="fixed bottom-20 right-4 z-30">
        <button onClick={() => setSheetOpen(true)}
          className="w-14 h-14 rounded-full bg-primary-500 flex items-center justify-center shadow-elevated active:scale-95 transition-transform">
          <Plus size={24} className="text-white" />
        </button>
      </div>

      <AddExpenseSheet open={sheetOpen} onClose={() => setSheetOpen(false)} />
    </div>
  )
}
