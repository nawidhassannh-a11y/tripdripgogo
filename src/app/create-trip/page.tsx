'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'

const FLOWS = [
  {
    href: '/create-trip/manual',
    emoji: '🗺️',
    title: 'I have a plan',
    subtitle: 'Manual builder',
    desc: 'Add stops, set dates, and define your budget per destination.',
    color: 'border-primary-500 bg-primary-50 dark:bg-primary-950',
  },
  {
    href: '/create-trip/ai',
    emoji: '✨',
    title: 'Surprise me',
    subtitle: 'AI route generator',
    desc: 'Tell us your budget and region. Claude builds the perfect route.',
    color: 'border-violet-400 bg-violet-50 dark:bg-violet-950',
    badge: 'AI',
  },
  {
    href: '/create-trip/quick',
    emoji: '⚡',
    title: 'Already traveling',
    subtitle: 'Quick-start',
    desc: 'You\'re on the road. Just set your remaining budget and start tracking.',
    color: 'border-amber-400 bg-amber-50 dark:bg-amber-950',
  },
]

export default function CreateTripPage() {
  const router = useRouter()

  return (
    <div className="min-h-dvh flex flex-col bg-surface dark:bg-surface-dark">
      {/* Header */}
      <header className="max-w-md mx-auto w-full px-5 pt-6 pb-2 flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="w-9 h-9 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <span className="font-semibold text-gray-900 dark:text-white">New trip</span>
      </header>

      <main className="flex-1 max-w-md mx-auto w-full px-5 pt-4 pb-10">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
        >
          <div className="text-4xl mb-3">🌍</div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Plan your trip</h1>
          <p className="text-gray-500 text-sm mb-7">How do you want to start?</p>
        </motion.div>

        <div className="space-y-3">
          {FLOWS.map((flow, i) => (
            <motion.div
              key={flow.href}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: i * 0.08 }}
            >
              <Link
                href={flow.href}
                className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all active:scale-[0.98] hover:shadow-card-hover ${flow.color}`}
              >
                <div className="w-12 h-12 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center text-2xl shadow-sm shrink-0">
                  {flow.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="font-semibold text-gray-900 dark:text-white text-sm">{flow.title}</p>
                    {flow.badge && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-violet-500 text-white">
                        {flow.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">{flow.subtitle}</p>
                  <p className="text-xs text-gray-500 dark:text-slate-400 leading-relaxed">{flow.desc}</p>
                </div>
                <ArrowRight size={18} className="text-gray-400 shrink-0" />
              </Link>
            </motion.div>
          ))}
        </div>
      </main>
    </div>
  )
}
