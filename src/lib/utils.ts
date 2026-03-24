import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// ── Currency ───────────────────────────────────────────────────────────────────
export function formatEur(amount: number): string {
  return new Intl.NumberFormat('nl-NL', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

// ── Date ───────────────────────────────────────────────────────────────────────
export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat('nl-NL', { day: 'numeric', month: 'short' }).format(new Date(iso))
}

// ── Budget % ──────────────────────────────────────────────────────────────────
export function budgetPercentage(spent: number, total: number): number {
  if (total === 0) return 0
  return Math.min(Math.round((spent / total) * 100), 100)
}

export function budgetStatus(pct: number): 'safe' | 'warning' | 'danger' {
  if (pct < 70) return 'safe'
  if (pct < 90) return 'warning'
  return 'danger'
}

// ── Health Score ──────────────────────────────────────────────────────────────
import type { Trip, Expense, TripDocument, HealthScore } from '@/types'

export function calcHealthScore(
  trip: Trip,
  expenses: Expense[],
  docs: TripDocument[]
): HealthScore {
  // Budget adherence (40%): how much budget remains relative to days remaining
  const totalSpent = expenses.reduce((s, e) => s + e.amountEur, 0)
  const budgetRemaining = trip.totalBudget - totalSpent
  const budgetAdherence = Math.max(0, Math.min(100, Math.round((budgetRemaining / trip.totalBudget) * 100 * 1.4)))

  // Stops planned (30%): at least 1 stop = 40pts, 3+ stops = 100pts
  const stopsPlanned = Math.min(100, trip.stops.length * 33)

  // Docs complete (20%): at least flight + accommodation booked
  const docsComplete = Math.min(100, docs.length * 25)

  // Days remaining (10%): trip started and days left > 0
  const now = new Date()
  const start = trip.startDate ? new Date(trip.startDate) : null
  const end = trip.endDate ? new Date(trip.endDate) : null
  let daysRemaining = 50 // neutral if dates not set
  if (start && end) {
    const totalDays = (end.getTime() - start.getTime()) / 86400000
    const elapsed = (now.getTime() - start.getTime()) / 86400000
    daysRemaining = Math.max(0, Math.min(100, Math.round(((totalDays - elapsed) / totalDays) * 100)))
  }

  const total = Math.round(
    budgetAdherence * 0.4 +
    stopsPlanned    * 0.3 +
    docsComplete    * 0.2 +
    daysRemaining   * 0.1
  )

  return { total, budgetAdherence, stopsPlanned, docsComplete, daysRemaining }
}
