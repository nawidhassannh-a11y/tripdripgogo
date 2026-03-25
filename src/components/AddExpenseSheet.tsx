'use client'

import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Sparkles, Loader2, Check } from 'lucide-react'
import { useTripStore } from '@/store/tripStore'
import { CATEGORY_META } from '@/components/CategoryBadge'
import { toEur, parseCurrencyHint } from '@/lib/currency'
import { cn } from '@/lib/utils'
import type { ExpenseCategory } from '@/types'

const CATEGORIES = Object.keys(CATEGORY_META) as ExpenseCategory[]

interface AddExpenseSheetProps {
  open: boolean
  onClose: () => void
  defaultStopId?: string
}

export function AddExpenseSheet({ open, onClose, defaultStopId }: AddExpenseSheetProps) {
  const { addExpense, activeTrip, trackEvent } = useTripStore()

  const [raw, setRaw]           = useState('')
  const [amount, setAmount]     = useState('')
  const [currency, setCurrency] = useState('EUR')
  const [category, setCategory] = useState<ExpenseCategory>('food')
  const [label, setLabel]       = useState('')
  const [tab, setTab]           = useState<'quick' | 'form'>('quick')
  const [aiStatus, setAiStatus] = useState<'idle' | 'loading' | 'done'>('idle')
  const [selectedStopId, setSelectedStopId] = useState<string>('')

  const inputRef = useRef<HTMLInputElement>(null)
  const trip = activeTrip()
  const activeStop = trip?.stops.find(s => s.isActive) ?? trip?.stops[0]
  const resolvedStopId = defaultStopId !== undefined ? defaultStopId : (selectedStopId || activeStop?.id || '')

  function reset() {
    setRaw(''); setAmount(''); setCurrency('EUR')
    setCategory('food'); setLabel('')
    setTab('quick'); setAiStatus('idle'); setSelectedStopId('')
  }

  function handleClose() { reset(); onClose() }

  async function aiCategorize(text: string) {
    if (!text.trim()) return
    setAiStatus('loading')
    try {
      const res = await fetch('/api/categorize-expense', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      })
      const data = await res.json()
      if (data.category) setCategory(data.category)
      if (data.label) setLabel(data.label)
      if (data.amount) setAmount(String(data.amount))
      if (data.currency) setCurrency(data.currency)
      setAiStatus('done')
    } catch {
      setAiStatus('idle')
    }
  }

  function handleQuickSubmit() {
    // Parse "80 baht pad thai"
    const hint = parseCurrencyHint(raw)
    const amt = hint?.amount ?? parseFloat(raw.match(/[\d.]+/)?.[0] ?? '0')
    const cur = hint?.currency ?? currency
    const eur = toEur(amt, cur)

    if (!amt || amt <= 0) return

    addExpense({
      id: Math.random().toString(36).slice(2, 10),
      raw,
      amount: amt,
      currency: cur,
      amountEur: eur,
      category,
      label: label || raw.slice(0, 30),
      date: new Date().toISOString(),
      stopId: resolvedStopId,
    })
    trackEvent('expense_added', { category, amountEur: eur })
    handleClose()
  }

  function handleFormSubmit() {
    const amt = parseFloat(amount)
    if (!amt || amt <= 0) return
    const eur = toEur(amt, currency)

    addExpense({
      id: Math.random().toString(36).slice(2, 10),
      raw: label,
      amount: amt,
      currency,
      amountEur: eur,
      category,
      label: label || CATEGORY_META[category].label,
      date: new Date().toISOString(),
      stopId: resolvedStopId,
    })
    trackEvent('expense_added', { category, amountEur: eur })
    handleClose()
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 z-40"
            onClick={handleClose}
          />
          {/* Sheet */}
          <motion.div
            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md z-50 bg-white dark:bg-slate-900 rounded-t-2xl shadow-2xl"
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-gray-200 dark:bg-slate-700" />
            </div>

            <div className="px-5 pb-8 pt-2">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-900 dark:text-white">Add expense</h3>
                <button onClick={handleClose} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-500">
                  <X size={18} />
                </button>
              </div>

              {/* Stop selector (if trip has multiple stops) */}
              {trip && trip.stops.length > 1 && (
                <div className="flex gap-1.5 overflow-x-auto no-scrollbar mb-3 pb-0.5">
                  {trip.stops.map(stop => (
                    <button key={stop.id}
                      onClick={() => setSelectedStopId(stop.id)}
                      className={cn(
                        'shrink-0 flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-semibold transition-all border',
                        resolvedStopId === stop.id
                          ? 'bg-primary-500 text-white border-primary-500'
                          : 'bg-gray-50 dark:bg-slate-800 text-gray-500 border-gray-200 dark:border-slate-700'
                      )}>
                      {stop.isActive && <span className="w-1.5 h-1.5 rounded-full bg-current inline-block" />}
                      {stop.city}
                    </button>
                  ))}
                </div>
              )}

              {/* Tab switch */}
              <div className="flex gap-1 bg-gray-100 dark:bg-slate-800 rounded-xl p-1 mb-4">
                {(['quick', 'form'] as const).map(t => (
                  <button
                    key={t}
                    onClick={() => setTab(t)}
                    className={cn(
                      'flex-1 py-2 rounded-lg text-sm font-semibold transition-all',
                      tab === t
                        ? 'bg-white dark:bg-slate-700 text-gray-900 dark:text-white shadow-sm'
                        : 'text-gray-500'
                    )}
                  >
                    {t === 'quick' ? '⚡ Quick' : '📝 Form'}
                  </button>
                ))}
              </div>

              {tab === 'quick' ? (
                <div className="space-y-3">
                  {/* Quick text input */}
                  <div className="relative">
                    <input
                      ref={inputRef}
                      type="text"
                      placeholder='e.g. "pad thai 80 baht" or "hostel 15 eur"'
                      value={raw}
                      onChange={e => setRaw(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleQuickSubmit()}
                      className="input pr-12 text-sm"
                      autoFocus
                    />
                    <button
                      onClick={() => aiCategorize(raw)}
                      disabled={!raw || aiStatus === 'loading'}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-violet-500 hover:text-violet-600 disabled:opacity-30"
                      title="AI categorize"
                    >
                      {aiStatus === 'loading'
                        ? <Loader2 size={16} className="animate-spin" />
                        : aiStatus === 'done'
                          ? <Check size={16} />
                          : <Sparkles size={16} />
                      }
                    </button>
                  </div>

                  {/* Category pills */}
                  <div className="flex gap-1.5 flex-wrap">
                    {CATEGORIES.map(c => {
                      const meta = CATEGORY_META[c]
                      return (
                        <button
                          key={c}
                          onClick={() => setCategory(c)}
                          className={cn(
                            'flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all',
                            category === c
                              ? `${meta.bg} ${meta.color} ring-2 ring-current ring-opacity-30`
                              : 'bg-gray-100 dark:bg-slate-800 text-gray-500'
                          )}
                        >
                          {meta.emoji} {meta.label}
                        </button>
                      )
                    })}
                  </div>

                  <button
                    onClick={handleQuickSubmit}
                    disabled={!raw.trim()}
                    className={cn('btn-primary w-full justify-center py-3.5', !raw.trim() && 'opacity-40 cursor-not-allowed')}
                  >
                    Add expense
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {/* Amount + currency */}
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <label className="text-[10px] text-gray-400 uppercase font-semibold tracking-wider mb-1 block">Amount</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        value={amount}
                        onChange={e => setAmount(e.target.value)}
                        className="input text-sm font-bold"
                        autoFocus
                      />
                    </div>
                    <div className="w-24">
                      <label className="text-[10px] text-gray-400 uppercase font-semibold tracking-wider mb-1 block">Currency</label>
                      <select
                        value={currency}
                        onChange={e => setCurrency(e.target.value)}
                        className="input text-sm"
                      >
                        {['EUR','USD','THB','VND','IDR','MYR','SGD','PHP','JPY','KRW','GBP','AUD'].map(c => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Label */}
                  <div>
                    <label className="text-[10px] text-gray-400 uppercase font-semibold tracking-wider mb-1 block">What for?</label>
                    <input
                      type="text"
                      placeholder="Pad Thai, Taxi, Hostel..."
                      value={label}
                      onChange={e => setLabel(e.target.value)}
                      className="input text-sm"
                    />
                  </div>

                  {/* Category */}
                  <div>
                    <label className="text-[10px] text-gray-400 uppercase font-semibold tracking-wider mb-1.5 block">Category</label>
                    <div className="flex gap-1.5 flex-wrap">
                      {CATEGORIES.map(c => {
                        const meta = CATEGORY_META[c]
                        return (
                          <button
                            key={c}
                            onClick={() => setCategory(c)}
                            className={cn(
                              'flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all',
                              category === c
                                ? `${meta.bg} ${meta.color} ring-2 ring-current ring-opacity-30`
                                : 'bg-gray-100 dark:bg-slate-800 text-gray-500'
                            )}
                          >
                            {meta.emoji} {meta.label}
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {/* EUR preview */}
                  {amount && (
                    <p className="text-xs text-primary-600 text-center">
                      ≈ €{toEur(parseFloat(amount) || 0, currency).toFixed(2)}
                    </p>
                  )}

                  <button
                    onClick={handleFormSubmit}
                    disabled={!amount}
                    className={cn('btn-primary w-full justify-center py-3.5', !amount && 'opacity-40 cursor-not-allowed')}
                  >
                    Add expense
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
