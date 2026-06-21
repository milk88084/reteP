import { useMemo } from 'react'
import { motion } from 'framer-motion'

interface ParticleRingProps {
  progress: number
  color?: string
  size?: number
}

interface Dot {
  x: number
  y: number
  r: number
}

export const ParticleRing = ({ progress, color = '#1E1A14', size = 220 }: ParticleRingProps) => {
  const cx = size / 2
  const cy = size / 2

  const dots = useMemo<Dot[]>(() => {
    const minR = size * 0.08
    const maxR = size * 0.46
    const rings = 10
    const gap = (maxR - minR) / (rings - 1)
    const result: Dot[] = []

    for (let i = 0; i < rings; i++) {
      const r = minR + i * gap
      const count = Math.max(6, Math.round((2 * Math.PI * r) / (size * 0.055)))
      const angleOffset = (i % 2) * (Math.PI / count)
      for (let j = 0; j < count; j++) {
        const a = (2 * Math.PI * j) / count + angleOffset - Math.PI / 2
        result.push({ x: cx + r * Math.cos(a), y: cy + r * Math.sin(a), r })
      }
    }
    return result.sort((a, b) => a.r - b.r)
  }, [size, cx, cy])

  const clamped = Math.max(0, Math.min(progress, 1))
  const filledCount = Math.round(dots.length * clamped)
  const dotRadius = size * 0.011

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="mx-auto">
      {dots.map((d, i) => {
        const filled = i < filledCount
        return (
          <motion.circle
            key={i}
            cx={d.x}
            cy={d.y}
            r={dotRadius}
            initial={false}
            animate={{ fill: filled ? color : '#D9D2C6' }}
            transition={{
              duration: 0.5,
              ease: 'easeInOut',
              delay: i * 0.001,
            }}
          />
        )
      })}
    </svg>
  )
}
