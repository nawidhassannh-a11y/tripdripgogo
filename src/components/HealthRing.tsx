'use client'

import { motion } from 'framer-motion'

interface HealthRingProps {
  score: number          // 0–100
  size?: number
  strokeWidth?: number
  showLabel?: boolean
  className?: string
}

export function HealthRing({ score, size = 80, strokeWidth = 7, showLabel = true, className = '' }: HealthRingProps) {
  const r = (size - strokeWidth) / 2
  const circ = 2 * Math.PI * r
  const clamped = Math.min(100, Math.max(0, score))
  const offset = circ * (1 - clamped / 100)

  const color = clamped >= 70 ? '#059467' : clamped >= 40 ? '#d97706' : '#dc2626'
  const label = clamped >= 70 ? 'Great' : clamped >= 40 ? 'OK' : 'Low'

  return (
    <div className={`relative flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        {/* Background track */}
        <circle
          cx={size / 2} cy={size / 2} r={r}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-gray-100 dark:text-slate-700"
        />
        {/* Progress arc */}
        <motion.circle
          cx={size / 2} cy={size / 2} r={r}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
        />
      </svg>
      {showLabel && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-bold leading-none" style={{ fontSize: size * 0.22, color }}>{clamped}</span>
          <span className="text-gray-400 leading-none mt-0.5" style={{ fontSize: size * 0.14 }}>{label}</span>
        </div>
      )}
    </div>
  )
}
