'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Map, Wallet, FileText, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'
import { HydrationGuard } from '@/components/HydrationGuard'

const NAV = [
  { href: '/home',     label: 'Home',    Icon: Home     },
  { href: '/trip',     label: 'Trip',    Icon: Map      },
  { href: '/budget',   label: 'Budget',  Icon: Wallet   },
  { href: '/docs',     label: 'Docs',    Icon: FileText },
  { href: '/settings', label: 'More',    Icon: Settings },
]

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="min-h-dvh flex flex-col max-w-md mx-auto relative">
      {/* Page content */}
      <main className="flex-1 page-content overflow-y-auto">
        <HydrationGuard>
          {children}
        </HydrationGuard>
      </main>

      {/* Bottom Navigation — Stitch glassmorphic style */}
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md z-50 glass border-t border-gray-200 dark:border-slate-700"
           style={{ height: 64, paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
        <div className="flex items-center justify-around h-16 px-2">
          {NAV.map(({ href, label, Icon }) => {
            const active = pathname.startsWith(href)
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex flex-col items-center gap-0.5 px-4 py-2 rounded-xl transition-colors',
                  active
                    ? 'text-primary-600 dark:text-primary-400'
                    : 'text-gray-400 dark:text-slate-500 hover:text-gray-600'
                )}
              >
                <Icon
                  size={22}
                  className={active ? 'fill-primary-600 dark:fill-primary-400' : ''}
                  strokeWidth={active ? 0 : 1.5}
                />
                <span className={cn(
                  'text-[10px] font-semibold tracking-wide uppercase',
                  active ? 'text-primary-600 dark:text-primary-400' : 'text-gray-400'
                )}>
                  {label}
                </span>
              </Link>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
