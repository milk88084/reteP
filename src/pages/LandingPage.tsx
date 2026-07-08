import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ParticleRing } from '@/components/features/dashboard/ParticleRing'

const EASE = [0.22, 1, 0.36, 1] as const

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
}

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
}

const inView = { once: true, amount: 0.3 } as const

interface Highlight {
  emoji: string
  title: string
  desc: string
}

const HIGHLIGHTS: Highlight[] = [
  { emoji: '🍱', title: '食物庫搜尋', desc: '衛福部食藥署 2,000 多筆食物資料，一搜就到' },
  { emoji: '🍚', title: '精準份量', desc: '顆、碗、杯、匙——量詞貼近真實吃法，不用自己換算克數' },
  { emoji: '🎯', title: '營養推薦', desc: '看今天還缺什麼營養素，直接建議該吃的食物' },
  { emoji: '🔒', title: 'Google 安全登入', desc: '一鍵登入，資料加密傳輸，只有你能看見' },
]

export const LandingPage = () => {
  // Same slow-breathing ring animation as the login screen.
  const [progress, setProgress] = useState(0.62)
  const timeRef = useRef(0)

  useEffect(() => {
    let animId: number
    const loop = () => {
      timeRef.current += 16
      setProgress(0.62 + Math.sin(timeRef.current * 0.0008) * 0.22)
      animId = requestAnimationFrame(loop)
    }
    animId = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(animId)
  }, [])

  return (
    <div className="min-h-screen bg-bg text-ink">
      <NavBar />
      <Hero progress={progress} />
      <Highlights />
      <CtaBand />
      <Footer />
    </div>
  )
}

const NavBar = () => (
  <header className="sticky top-0 z-50 border-b border-border bg-bg/80 backdrop-blur-xl">
    <nav className="mx-auto flex h-16 max-w-4xl items-center justify-between px-5">
      <span
        className="text-lg text-ink"
        style={{ fontFamily: "'Bitcount Prop Single', cursive", fontWeight: 300 }}
      >
        reteP
      </span>
      <div className="flex items-center gap-4 text-sm">
        <Link to="/support" className="text-ink-muted hover:text-ink transition-colors">
          支援
        </Link>
        <Link to="/privacy" className="text-ink-muted hover:text-ink transition-colors">
          隱私政策
        </Link>
        <Link
          to="/login"
          className="rounded-full bg-ink px-4 py-2 font-semibold text-bg transition-transform hover:scale-105 active:scale-95"
        >
          登入
        </Link>
      </div>
    </nav>
  </header>
)

const Hero = ({ progress }: { progress: number }) => (
  <section
    className="relative overflow-hidden"
    style={{
      background: 'radial-gradient(circle at 50% 20%, #1a0d08 0%, #0D0B09 65%)',
    }}
  >
    <motion.div
      initial="hidden"
      animate="show"
      variants={stagger}
      className="mx-auto flex max-w-2xl flex-col items-center px-6 pt-16 pb-10 text-center"
    >
      <motion.div variants={fadeUp}>
        <ParticleRing progress={progress} color="#B6B9FE" inactiveColor="#3a3732" size={220} />
      </motion.div>

      <motion.h1
        variants={fadeUp}
        className="mt-6 text-4xl sm:text-5xl"
        style={{ fontFamily: "'Bitcount Prop Single', cursive", fontWeight: 300 }}
      >
        reteP
      </motion.h1>

      <motion.p variants={fadeUp} className="mt-3 text-lg text-ink-muted">
        紀錄你的飲食習慣，看清每一口的營養
      </motion.p>

      <motion.div variants={fadeUp} className="mt-8">
        <Link
          to="/login"
          className="inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 text-base font-semibold text-gray-800 shadow-sm transition-transform hover:scale-[1.03] active:scale-95"
        >
          開始使用
        </Link>
      </motion.div>
    </motion.div>
  </section>
)

const Highlights = () => (
  <section className="mx-auto max-w-4xl px-6 py-20">
    <motion.h2
      variants={fadeUp}
      initial="hidden"
      whileInView="show"
      viewport={inView}
      className="text-center text-2xl font-bold sm:text-3xl"
    >
      為飲食記錄而生
    </motion.h2>

    <motion.div
      variants={stagger}
      initial="hidden"
      whileInView="show"
      viewport={inView}
      className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2"
    >
      {HIGHLIGHTS.map((h) => (
        <motion.div
          key={h.title}
          variants={fadeUp}
          className="flex items-start gap-4 rounded-2xl border border-border bg-surface p-5"
        >
          <span className="text-3xl">{h.emoji}</span>
          <span>
            <span className="block font-semibold text-ink">{h.title}</span>
            <span className="mt-1 block text-sm text-ink-muted">{h.desc}</span>
          </span>
        </motion.div>
      ))}
    </motion.div>
  </section>
)

const CtaBand = () => (
  <section className="px-6 py-20">
    <motion.div
      variants={fadeUp}
      initial="hidden"
      whileInView="show"
      viewport={inView}
      className="mx-auto max-w-3xl rounded-[32px] border border-border bg-surface px-8 py-16 text-center"
    >
      <h2 className="text-2xl font-bold sm:text-3xl">今天吃了什麼？</h2>
      <p className="mx-auto mt-3 max-w-md text-ink-muted">
        免費使用 reteP，馬上開始記錄你的第一餐。
      </p>
      <Link
        to="/login"
        className="mt-7 inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 text-base font-semibold text-gray-800 transition-transform hover:scale-[1.03] active:scale-95"
      >
        立即開始
      </Link>
    </motion.div>
  </section>
)

const Footer = () => (
  <footer className="border-t border-border">
    <div className="mx-auto flex max-w-4xl flex-col items-center justify-between gap-4 px-6 py-8 text-sm text-ink-muted sm:flex-row">
      <span>reteP · 紀錄你的飲食習慣</span>
      <div className="flex items-center gap-5">
        <Link to="/support" className="hover:text-ink transition-colors">
          支援
        </Link>
        <Link to="/privacy" className="hover:text-ink transition-colors">
          隱私政策
        </Link>
        <span>© {new Date().getFullYear()} reteP</span>
      </div>
    </div>
  </footer>
)
