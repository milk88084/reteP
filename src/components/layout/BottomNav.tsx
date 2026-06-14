import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/utils/cn'
import { useUIStore } from '@/store/uiStore'

/* ── Icons ── */
const HomeIcon = ({ active }: { active: boolean }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
    stroke={active ? '#1E1A14' : '#9A8F82'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
    <polyline points="9 22 9 12 15 12 15 22"/>
  </svg>
)
const CalendarIcon = ({ active }: { active: boolean }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
    stroke={active ? '#1E1A14' : '#9A8F82'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
    <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
    <line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
)
const SettingsIcon = ({ active }: { active: boolean }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
    stroke={active ? '#1E1A14' : '#9A8F82'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3"/>
    <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/>
  </svg>
)
const PlusIcon = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none"
    stroke="white" strokeWidth="2.5" strokeLinecap="round">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
)
const PencilIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
)
const CameraIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/>
    <circle cx="12" cy="13" r="4"/>
  </svg>
)

/* ── Tab item ── */
const TabItem = ({ to, label, Icon, active }: {
  to: string; label: string; active: boolean
  Icon: React.ComponentType<{ active: boolean }>
}) => (
  <Link to={to} className="flex-1 flex flex-col items-center justify-center gap-1 py-2">
    <Icon active={active} />
    <span className={cn('text-[10px] font-medium', active ? 'text-ink' : 'text-ink-muted')}>
      {label}
    </span>
    {active && <span className="absolute top-1.5 w-1 h-1 rounded-full bg-brand" />}
  </Link>
)

/* ── Sub button (手動 / 拍照) ── */
const SubBtn = ({
  label, icon, onClick, x, y,
}: { label: string; icon: React.ReactNode; onClick: () => void; x: number; y: number }) => (
  <motion.div
    initial={{ opacity: 0, x: 0, y: 0, scale: 0.4 }}
    animate={{ opacity: 1, x, y, scale: 1 }}
    exit={{ opacity: 0, x: 0, y: 0, scale: 0.4 }}
    transition={{ type: 'spring', stiffness: 380, damping: 26 }}
    className="absolute left-1/2 bottom-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5"
    style={{ pointerEvents: 'auto' }}
  >
    <button
      onClick={onClick}
      className="w-12 h-12 rounded-full bg-bg border border-border shadow-lg flex items-center justify-center text-ink hover:bg-surface transition-colors"
    >
      {icon}
    </button>
    <span className="text-[10px] font-semibold text-ink bg-bg px-2 py-0.5 rounded-full shadow-sm whitespace-nowrap">
      {label}
    </span>
  </motion.div>
)

/* ── Main BottomNav ── */
export const BottomNav = () => {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const [fabOpen, setFabOpen] = useState(false)
  const { setShowManualEntry, triggerCamera } = useUIStore()

  const handleManual = () => {
    setFabOpen(false)
    if (pathname !== '/') navigate('/')
    setShowManualEntry(true)
  }

  const handleCamera = () => {
    setFabOpen(false)
    if (pathname !== '/') {
      triggerCamera()
      navigate('/')
    } else {
      triggerCamera()
    }
  }

  return (
    <>
      {/* Dimmed overlay when FAB open */}
      <AnimatePresence>
        {fabOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-ink/20 backdrop-blur-[1px]"
            onClick={() => setFabOpen(false)}
          />
        )}
      </AnimatePresence>

      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-bg/95 backdrop-blur-sm border-t border-border safe-area-pb">
        <div className="relative flex h-16 max-w-lg mx-auto">
          {/* Left tabs */}
          <TabItem to="/" label="今日" active={pathname === '/'} Icon={HomeIcon} />
          <TabItem to="/history" label="歷史" active={pathname === '/history'} Icon={CalendarIcon} />

          {/* Center FAB zone — creates visual gap */}
          <div className="w-20 shrink-0 relative">
            {/* Sub-buttons container (anchored to FAB center) */}
            <div className="absolute left-1/2 bottom-[calc(100%-8px)] -translate-x-1/2 pointer-events-none" style={{ width: 0, height: 0 }}>
              <AnimatePresence>
                {fabOpen && (
                  <>
                    <SubBtn label="手動輸入" icon={<PencilIcon />} onClick={handleManual} x={-62} y={-78} />
                    <SubBtn label="拍照記錄" icon={<CameraIcon />} onClick={handleCamera} x={62} y={-78} />
                  </>
                )}
              </AnimatePresence>
            </div>

            {/* Main FAB */}
            <div className="absolute left-1/2 -translate-x-1/2 -top-6">
              <motion.button
                onClick={() => setFabOpen((v) => !v)}
                animate={{ rotate: fabOpen ? 45 : 0 }}
                transition={{ type: 'spring', stiffness: 400, damping: 28 }}
                className="w-14 h-14 rounded-full bg-accent shadow-xl flex items-center justify-center active:scale-95"
                aria-label="新增記錄"
              >
                <PlusIcon />
              </motion.button>
            </div>
          </div>

          {/* Right tab */}
          <TabItem to="/settings" label="設定" active={pathname === '/settings'} Icon={SettingsIcon} />
        </div>
      </nav>
    </>
  )
}
