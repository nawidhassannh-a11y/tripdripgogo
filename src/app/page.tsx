'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, Check, Wallet, Zap, Shield, WifiOff, MapPin } from 'lucide-react'

const FEATURES = [
  { Icon: Wallet,  label: 'Budget Engine',   desc: 'Track every cent in any currency. Live health score.' },
  { Icon: Zap,     label: 'AI Route Gen',    desc: 'Route from budget + region in seconds.' },
  { Icon: Shield,  label: 'Docs Vault',      desc: 'Flights, hotels, insurance — all in one place.' },
  { Icon: WifiOff, label: '100% Offline',    desc: 'Works in the jungle. No signal needed.' },
  { Icon: MapPin,  label: 'Trip Builder',    desc: 'Visual route + stop planner.' },
  { Icon: Check,   label: 'Multi-currency',  desc: 'THB, IDR, VND, EUR — all converted live.' },
]

const PAIN_POINTS = [
  { emoji: '😵', title: 'Decision fatigue', desc: 'Everything to decide alone — where to go, what to spend, what to book.' },
  { emoji: '💸', title: '47% more expensive', desc: 'Solo travelers overpay. We help you find a budget that actually works.' },
  { emoji: '📂', title: 'Document chaos', desc: '12 tabs open — visas, flights, insurance, boarding passes. All over the place.' },
]

const STATS = [
  { value: '4.2k', label: 'Trips planned' },
  { value: '€2.1M', label: 'Budgets tracked' },
  { value: '38', label: 'Countries' },
]

const TRIP_CARDS = [
  { name: 'Lena K.', flag: '🇩🇪', route: 'Bangkok → Chiang Mai → Hanoi', budget: '€2,400', days: 42, status: 'On budget' },
  { name: 'Marco B.', flag: '🇳🇱', route: 'Bali → Lombok → Flores',       budget: '€1,800', days: 28, status: '€180 left' },
]

export default function LandingPage() {
  return (
    <div style={{ minHeight: '100dvh', background: '#fff', fontFamily: "-apple-system, 'SF Pro Display', Inter, system-ui, sans-serif" }}>

      {/* Header */}
      <header style={{ position: 'sticky', top: 0, zIndex: 50, background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(12px)', borderBottom: '1px solid #E8E8E8' }}>
        <div style={{ maxWidth: 480, margin: '0 auto', padding: '0 24px', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontWeight: 800, fontSize: 16, letterSpacing: -0.5 }}>
            TripDrip<span style={{ color: '#34C759' }}>GoGo</span>
          </span>
          <Link href="/onboarding"
            style={{ background: '#000', color: '#fff', fontWeight: 700, fontSize: 13, padding: '8px 20px', borderRadius: 999, textDecoration: 'none' }}>
            Try free
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section style={{ maxWidth: 480, margin: '0 auto', padding: '60px 24px 60px', textAlign: 'center' }}>
        <motion.div initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
          style={{ fontSize: 60, marginBottom: 16 }}>
          🌏
        </motion.div>
        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          style={{ fontSize: 44, fontWeight: 900, color: '#000', letterSpacing: -2, lineHeight: 1.05, marginBottom: 16 }}>
          Your Solo Travel OS
        </motion.h1>
        <motion.p initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          style={{ fontSize: 18, color: '#6B6B6B', marginBottom: 32, lineHeight: 1.5, maxWidth: 320, margin: '0 auto 32px' }}>
          Budget-first planning, AI expense tracking, and document management.
        </motion.p>
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          style={{ display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 360, margin: '0 auto' }}>
          <Link href="/onboarding"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: '#000', color: '#fff', fontWeight: 700, fontSize: 16, padding: '18px', borderRadius: 16, textDecoration: 'none' }}>
            Start planning for free <ArrowRight size={18} />
          </Link>
          <Link href="/home"
            style={{ fontSize: 14, color: '#ABABAB', textDecoration: 'none', padding: '8px' }}>
            Already have a trip →
          </Link>
        </motion.div>
      </section>

      {/* Stats strip */}
      <section style={{ background: '#F5F5F5', padding: '20px 24px' }}>
        <div style={{ maxWidth: 480, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, textAlign: 'center' }}>
          {STATS.map(s => (
            <div key={s.label}>
              <div style={{ fontSize: 24, fontWeight: 900, color: '#000', letterSpacing: -1 }}>{s.value}</div>
              <div style={{ fontSize: 11, color: '#ABABAB', fontWeight: 600, marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Pain points */}
      <section style={{ maxWidth: 480, margin: '0 auto', padding: '48px 24px' }}>
        <h2 style={{ fontSize: 28, fontWeight: 800, color: '#000', letterSpacing: -0.5, marginBottom: 24 }}>
          Solo travel is hard enough
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {PAIN_POINTS.map(p => (
            <div key={p.title} style={{ display: 'flex', gap: 16, background: '#F5F5F5', borderRadius: 20, padding: 18 }}>
              <span style={{ fontSize: 24, flexShrink: 0 }}>{p.emoji}</span>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#000', marginBottom: 4 }}>{p.title}</div>
                <div style={{ fontSize: 14, color: '#6B6B6B', lineHeight: 1.5 }}>{p.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Features grid */}
      <section style={{ background: '#F5F5F5', padding: '48px 24px' }}>
        <div style={{ maxWidth: 480, margin: '0 auto' }}>
          <h2 style={{ fontSize: 28, fontWeight: 800, color: '#000', letterSpacing: -0.5, marginBottom: 24 }}>
            One app. Everything.
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {FEATURES.map(({ Icon, label, desc }) => (
              <div key={label} style={{ background: '#fff', borderRadius: 20, padding: 18 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: '#F5F5F5', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
                  <Icon size={17} color="#000" />
                </div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#000', marginBottom: 4 }}>{label}</div>
                <div style={{ fontSize: 12, color: '#6B6B6B', lineHeight: 1.5 }}>{desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social proof */}
      <section style={{ maxWidth: 480, margin: '0 auto', padding: '48px 24px' }}>
        <h2 style={{ fontSize: 28, fontWeight: 800, color: '#000', letterSpacing: -0.5, marginBottom: 24 }}>
          Real trips. Real budgets.
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {TRIP_CARDS.map(card => (
            <div key={card.name} style={{ background: '#F5F5F5', borderRadius: 20, padding: '16px 18px', display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span style={{ fontSize: 18 }}>{card.flag}</span>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#000' }}>{card.name}</div>
                <div style={{ fontSize: 12, color: '#6B6B6B', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{card.route}</div>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ fontSize: 15, fontWeight: 800, color: '#000' }}>{card.budget}</div>
                <div style={{ fontSize: 11, color: '#ABABAB' }}>{card.days}d · {card.status}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonial */}
      <section style={{ background: '#F5F5F5', padding: '48px 24px' }}>
        <div style={{ maxWidth: 480, margin: '0 auto', background: '#fff', borderRadius: 24, padding: 28 }}>
          <p style={{ fontSize: 17, color: '#000', lineHeight: 1.6, marginBottom: 20, fontStyle: 'italic' }}>
            &ldquo;Finally stopped overspending in Southeast Asia. Tracked every meal, every bus, every night. Came home €340 under budget.&rdquo;
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ color: '#fff', fontSize: 13, fontWeight: 700 }}>JB</span>
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#000' }}>Julia B.</div>
              <div style={{ fontSize: 12, color: '#ABABAB' }}>56 days, SEA loop 🇹🇭🇻🇳🇮🇩</div>
            </div>
          </div>
        </div>
      </section>

      {/* What&apos;s free */}
      <section style={{ maxWidth: 480, margin: '0 auto', padding: '48px 24px' }}>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: '#ABABAB', marginBottom: 20 }}>
          WHAT&apos;S INCLUDED — FREE
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {['Unlimited trips', 'AI route gen', 'Expense tracking', 'Budget alerts', 'Docs vault', 'Offline mode', 'Multi-currency', 'Health score'].map(f => (
            <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: '#000' }}>
              <div style={{ width: 20, height: 20, borderRadius: '50%', background: '#E8F9ED', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Check size={11} color="#34C759" />
              </div>
              {f}
            </div>
          ))}
        </div>
      </section>

      {/* CTA bottom */}
      <section style={{ background: '#000', padding: '60px 24px' }}>
        <div style={{ maxWidth: 480, margin: '0 auto', textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>✈️</div>
          <h2 style={{ fontSize: 32, fontWeight: 900, color: '#fff', letterSpacing: -1, marginBottom: 10 }}>
            Ready to travel smarter?
          </h2>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.6)', marginBottom: 28, lineHeight: 1.5 }}>
            Join 4,200+ solo travelers. Free forever. No account needed.
          </p>
          <Link href="/onboarding"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#fff', color: '#000', fontWeight: 700, fontSize: 16, padding: '18px 32px', borderRadius: 16, textDecoration: 'none' }}>
            Plan my trip — it&apos;s free <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ background: '#000', borderTop: '1px solid #222', padding: '20px 24px' }}>
        <div style={{ maxWidth: 480, margin: '0 auto', textAlign: 'center' }}>
          <p style={{ fontWeight: 800, color: '#fff', marginBottom: 4 }}>
            TripDrip<span style={{ color: '#34C759' }}>GoGo</span>
          </p>
          <p style={{ fontSize: 11, color: '#555' }}>Solo Travel OS · Made for backpackers · © 2025</p>
        </div>
      </footer>

    </div>
  )
}
