import { cn } from '@/lib/utils'
import type { ExpenseCategory } from '@/types'

export const CATEGORY_META: Record<ExpenseCategory, { label: string; emoji: string; color: string; bg: string }> = {
  food:       { label: 'Food',       emoji: '🍜', color: 'text-orange-600', bg: 'bg-orange-50 dark:bg-orange-950' },
  transport:  { label: 'Transport',  emoji: '🚌', color: 'text-blue-600',   bg: 'bg-blue-50 dark:bg-blue-950'   },
  stay:       { label: 'Stay',       emoji: '🏠', color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-950'},
  activities: { label: 'Activities', emoji: '🎭', color: 'text-pink-600',   bg: 'bg-pink-50 dark:bg-pink-950'   },
  drinks:     { label: 'Drinks',     emoji: '🍺', color: 'text-amber-600',  bg: 'bg-amber-50 dark:bg-amber-950' },
  shopping:   { label: 'Shopping',   emoji: '🛍️', color: 'text-rose-600',   bg: 'bg-rose-50 dark:bg-rose-950'   },
  health:     { label: 'Health',     emoji: '💊', color: 'text-red-600',    bg: 'bg-red-50 dark:bg-red-950'     },
  loan:       { label: 'Loan',       emoji: '💸', color: 'text-slate-600',  bg: 'bg-slate-100 dark:bg-slate-800'},
  other:      { label: 'Other',      emoji: '📦', color: 'text-gray-600',   bg: 'bg-gray-100 dark:bg-gray-800'  },
}

interface CategoryBadgeProps {
  category: ExpenseCategory
  size?: 'sm' | 'md'
  showLabel?: boolean
}

export function CategoryBadge({ category, size = 'sm', showLabel = false }: CategoryBadgeProps) {
  const meta = CATEGORY_META[category]
  return (
    <span className={cn(
      'inline-flex items-center gap-1 rounded-lg font-medium',
      size === 'sm' ? 'text-[11px] px-1.5 py-0.5' : 'text-xs px-2 py-1',
      meta.bg, meta.color
    )}>
      {meta.emoji}
      {showLabel && meta.label}
    </span>
  )
}
