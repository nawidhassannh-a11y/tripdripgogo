'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Map, Wallet, FileText, Settings } from 'lucide-react'
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
    <div className="min-h-dvh flex flex-col max-w-md mx-auto relative bg-white dark:bg-slate-900">
      <main className="flex-1 page-content overflow-y-auto">
        <HydrationGuard>
          {children}
        </HydrationGuard>
      </main>

      {/* Bottom Navigation — Cal AI style */}
      <nav
        className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md z-50 bg-white dark:bg-slate-900"
        style={{ borderTop: '1px solid #E8E8E8', paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      >
        <div className="flex items-center justify-around h-16 px-2">
          {NAV.map(({ href, label, Icon }) => {
            const active = pathname.startsWith(href)
            return (
              <Link
                key={href}
                href={href}
                className="flex flex-col items-center gap-1 px-4 py-2"
              >
                <Icon
                  size={20}
                  color={active ? '#000' : '#ABABAB'}
                  strokeWidth={active ? 2 : 1.5}
                />
                <span style={{
                  fontSize: 9,
                  fontWeight: 700,
                  letterSpacing: '0.8px',
                  textTransform: 'uppercase',
                  color: active ? '#000' : '#ABABAB',
                }}>
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
