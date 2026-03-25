'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Trash2, Lightbulb, Loader2 } from 'lucide-react'
import { useTripStore } from '@/store/tripStore'
import { CATEGORY_META } from '@/components/CategoryBadge'
import { AddExpenseSheet } from '@/components/AddExpenseSheet'
import { formatEur } from '@/lib/utils'
import type { ExpenseCategory } from '@/types'

const ALL_CATEGORIES = Object.keys(CATEGORY_META) as ExpenseCategory[]

const CAT_COLORS: Record<string, string> = {
  food:       '#FF9500',
  transport:  '#007AFF',
  stay:       '#AF52DE',
  activities: '#FF2D55',
  drinks:     '#FF9500',
  other:      '#8E8E93',
}

export default function BudgetPage() {
  const { activeTrip, activeTripExpenses, totalSpent, removeExpense } = useTripStore()
  const [sheetOpen, setSheetOpen] = useState(false)
  const [filterCat, setFilterCat] = useState<ExpenseCategory | 'all'>('all')
  const [tab, setTab] = useState<'today' | 'total'>('today')
  const [rescueTips, setRescueTips] = useState<string[]>([])
  const [rescueLoading, setRescueLoading] = useState(false)
  const [rescueOpen, setRescueOpen] = useState(false)

  const trip = activeTrip()
  const allExpenses = activeTripExpenses()
  const spent = totalSpent()

  if (!trip) {
    return (
      <div style={{ minHeight: 'calc(100dvh - 64px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 24px', textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>💸</div>
        <p style={{ color: 'var(--text2)', fontSize: 14 }}>No active trip. <a href="/home" style={{ color: '#000', fontWeight: 700 }}>Create one</a></p>
      </div>
    )
  }

  const todayStr = new Date().toDateString()
  const todayExpenses = allExpenses.filter(e => new Date(e.date).toDateString() === todayStr)
  const todaySpent = todayExpenses.reduce((s, e) => s + e.amountEur, 0)
  const activeStop = trip.stops.find(s => s.isActive) ?? trip.stops[0]
  const dailyBudget = activeStop?.budgetPerDay ?? 50

  const displayExpenses = tab === 'today' ? todayExpenses : allExpenses
  const displaySpent = tab === 'today' ? todaySpent : spent
  const displayBudget = tab === 'today' ? dailyBudget : trip.totalBudget
  const displayLeft = displayBudget - displaySpent
  const displayPct = displayBudget > 0 ? Math.min(100, (displaySpent / displayBudget) * 100) : 0
  const barColor = displayPct > 90 ? '#FF3B30' : displayPct > 70 ? '#FF9500' : '#34C759'

  const byCategory = ALL_CATEGORIES.map(cat => ({
    cat,
    total: displayExpenses.filter(e => e.category === cat).reduce((s, e) => s + e.amountEur, 0),
    count: displayExpenses.filter(e => e.category === cat).length,
  })).filter(c => c.total > 0).sort((a, b) => b.total - a.total)

  const maxCatTotal = byCategory.length > 0 ? byCategory[0].total : 1
  const filtered = filterCat === 'all' ? displayExpenses : displayExpenses.filter(e => e.category === filterCat)

  async function fetchRescueTips() {
    if (rescueTips.length > 0) { setRescueOpen(p => !p); return }
    setRescueLoading(true); setRescueOpen(true)
    const topCategories = ALL_CATEGORIES
      .map(cat => ({ category: cat, total: allExpenses.filter(e => e.category === cat).reduce((s, e) => s + e.amountEur, 0) }))
      .filter(c => c.total > 0).sort((a, b) => b.total - a.total).slice(0, 3)
    try {
      const res = await fetch('/api/budget-rescue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ totalBudget: trip?.totalBudget ?? 0, spent, daysRemaining: 30, topCategories, currentCity: activeStop?.city ?? 'current city', travelerType: 'backpacker' }),
      })
      const data = await res.json()
      setRescueTips(data.tips ?? [])
    } catch { setRescueTips(['Track every expense to stay on budget.']) }
    setRescueLoading(false)
  }

  return (
    <div style={{ padding: '20px 24px 8px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 32, fontWeight: 700, color: 'var(--text)', letterSpacing: -0.5 }}>Budget</h1>
          <p style={{ fontSize: 14, color: 'var(--text2)', marginTop: 4 }}>
            {activeStop?.city ?? trip.name} stop
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        {([['today', 'Today'], ['total', 'Total trip']] as const).map(([t, label]) => (
          <button key={t} onClick={() => setTab(t)}
            style={{
              padding: '6px 16px', borderRadius: 999, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 700,
              background: tab === t ? '#000' : 'var(--card)', color: tab === t ? '#fff' : 'var(--text2)',
            }}>
            {label}
          </button>
        ))}
      </div>

      {/* Hero card */}
      <div style={{ background: 'var(--card)', borderRadius: 20, padding: 20, marginBottom: 24 }}>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: 'var(--text3)', marginBottom: 6 }}>
          SPENT
        </div>
        <div style={{ fontSize: 48, fontWeight: 800, color: 'var(--text)', letterSpacing: -2.5, lineHeight: 1, marginBottom: 18 }}>
          €{displaySpent.toFixed(2)}
        </div>
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          <div style={{ flex: 1, background: '#fff', borderRadius: 14, padding: '10px 14px', textAlign: 'center' }}>
            <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 0.8, textTransform: 'uppercase', color: 'var(--text3)', marginBottom: 4 }}>BUDGET</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--text)' }}>€{displayBudget}</div>
          </div>
          <div style={{ flex: 1, background: '#fff', borderRadius: 14, padding: '10px 14px', textAlign: 'center' }}>
            <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 0.8, textTransform: 'uppercase', color: 'var(--text3)', marginBottom: 4 }}>LEFT</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: displayLeft >= 0 ? '#34C759' : '#FF3B30' }}>
              {displayLeft >= 0 ? `€${displayLeft.toFixed(0)}` : `-€${Math.abs(displayLeft).toFixed(0)}`}
            </div>
          </div>
        </div>
        <div className="prog-track">
          <motion.div className="prog-fill" initial={{ width: 0 }} animate={{ width: `${displayPct}%` }}
            style={{ background: barColor }} transition={{ duration: 0.6 }} />
        </div>
        <div style={{ fontSize: 13, color: 'var(--text2)' }}>{displayPct.toFixed(0)}% used</div>
      </div>

      {/* Budget rescue */}
      <button onClick={fetchRescueTips} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, background: 'var(--card)', borderRadius: 16, padding: '14px 16px', border: 'none', cursor: 'pointer', marginBottom: 24 }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: '#FFF4E5', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          {rescueLoading ? <Loader2 size={16} color="#FF9500" className="animate-spin" /> : <Lightbulb size={16} color="#FF9500" />}
        </div>
        <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', flex: 1, textAlign: 'left' }}>Budget rescue tips</p>
        <span style={{ fontSize: 12, color: 'var(--text3)' }}>{rescueOpen ? '↑' : '↓'}</span>
      </button>
      <AnimatePresence>
        {rescueOpen && rescueTips.length > 0 && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            style={{ background: 'var(--card)', borderRadius: 16, padding: 16, overflow: 'hidden', marginTop: -20, marginBottom: 24 }}>
            {rescueTips.map((tip, i) => (
              <div key={i} style={{ display: 'flex', gap: 10, marginBottom: i < rescueTips.length - 1 ? 10 : 0 }}>
                <span style={{ flexShrink: 0 }}>💡</span>
                <p style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.6 }}>{tip}</p>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* By category */}
      {byCategory.length > 0 && (
        <>
          <div className="section-label">BY CATEGORY</div>
          {byCategory.map(({ cat, total }) => {
            const meta = CATEGORY_META[cat]
            const pct = (total / maxCatTotal) * 100
            return (
              <div key={cat} style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
                <span style={{ fontSize: 22, width: 30 }}>{meta.emoji}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontSize: 14, color: 'var(--text)' }}>{meta.label}</span>
                    <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>{formatEur(total)}</span>
                  </div>
                  <div style={{ height: 5, background: 'var(--card)', borderRadius: 999, overflow: 'hidden' }}>
                    <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.5 }}
                      style={{ height: '100%', background: CAT_COLORS[cat] ?? '#8E8E93', borderRadius: 999 }} />
                  </div>
                </div>
              </div>
            )
          })}
        </>
      )}

      {/* Expense filter + list */}
      <div style={{ marginTop: 24 }}>
        <div style={{ display: 'flex', gap: 6, overflowX: 'auto', marginBottom: 16 }} className="no-scrollbar">
          <button onClick={() => setFilterCat('all')} style={{
            flexShrink: 0, padding: '6px 14px', borderRadius: 999, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 700,
            background: filterCat === 'all' ? '#000' : 'var(--card)', color: filterCat === 'all' ? '#fff' : 'var(--text2)',
          }}>
            All ({displayExpenses.length})
          </button>
          {byCategory.map(({ cat, count }) => {
            const meta = CATEGORY_META[cat]
            return (
              <button key={cat} onClick={() => setFilterCat(cat)} style={{
                flexShrink: 0, padding: '6px 12px', borderRadius: 999, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 700,
                background: filterCat === cat ? '#000' : 'var(--card)', color: filterCat === cat ? '#fff' : 'var(--text2)',
              }}>
                {meta.emoji} {count}
              </button>
            )
          })}
        </div>

        <div className="section-label">ALL EXPENSES</div>

        {filtered.length === 0 ? (
          <div style={{ background: 'var(--card)', borderRadius: 20, padding: 24, textAlign: 'center' }}>
            <p style={{ fontSize: 14, color: 'var(--text3)' }}>No expenses yet</p>
          </div>
        ) : (
          <AnimatePresence>
            {filtered.map(expense => {
              const meta = CATEGORY_META[expense.category]
              return (
                <motion.div key={expense.id} layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -20 }}
                  style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 0', borderBottom: '1px solid var(--border)' }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--card)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
                    {meta.emoji}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {expense.label || expense.raw}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 1 }}>
                      {expense.currency !== 'EUR' ? `${expense.amount} ${expense.currency} · ` : ''}
                      {new Date(expense.date).toLocaleDateString('en', { month: 'short', day: 'numeric' })}
                    </div>
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', flexShrink: 0 }}>
                    {formatEur(expense.amountEur)}
                  </div>
                  <button onClick={() => removeExpense(expense.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, marginLeft: 4 }}>
                    <Trash2 size={14} color="var(--text3)" />
                  </button>
                </motion.div>
              )
            })}
          </AnimatePresence>
        )}
      </div>

      <div style={{ height: 32 }} />

      {/* FAB */}
      <button onClick={() => setSheetOpen(true)}
        style={{ position: 'fixed', bottom: 80, right: 24, width: 56, height: 56, borderRadius: '50%', background: '#000', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 24px rgba(0,0,0,0.2)', zIndex: 30 }}>
        <Plus size={24} color="#fff" />
      </button>

      <AddExpenseSheet open={sheetOpen} onClose={() => setSheetOpen(false)} />
    </div>
  )
}
