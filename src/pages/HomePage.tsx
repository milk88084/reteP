import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { DayRing } from '@/components/features/dashboard/DayRing'
import { ImagePreview } from '@/components/features/camera/ImagePreview'
import { ManualEntryModal } from '@/components/features/food/ManualEntryModal'
import { useCamera } from '@/hooks/useCamera'
import { useFoodRecognition } from '@/hooks/useFoodRecognition'
import { useFoodLogStore } from '@/store/foodLogStore'
import { useSettingsStore } from '@/store/settingsStore'
import { useUIStore } from '@/store/uiStore'
import { getLast7Days, getTodayStr } from '@/utils/dateUtils'
import { FoodEntry, RecognizeApiResult } from '@/types'
import { saveEntry } from '@/services/foodRecognitionApi'

const todayStr = getTodayStr()
const DAYS = getLast7Days() // index 0 = today, 6 = 6 days ago

export const HomePage = () => {
  const { previewUrl, selectedFile, onFileChange, clearImage } = useCamera()
  const { recognize, isLoading, isError, error, result, reset } = useFoodRecognition()
  const { addEntry, getDailySummary } = useFoodLogStore()
  const { settings } = useSettingsStore()
  const { showManualEntry, setShowManualEntry, pendingCamera, clearCamera } = useUIStore()

  const cameraInputRef = useRef<HTMLInputElement>(null)
  const [activeIdx, setActiveIdx] = useState(0) // 0 = today
  const touchY = useRef<number | null>(null)
  const mouseY = useRef<number | null>(null)
  const wheelLock = useRef(0)
  const deckAreaRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLDivElement>(null)
  const [deckArea, setDeckArea] = useState({ w: 0, h: 0 })
  const [titleH, setTitleH] = useState(0)

  // Track the deck space + title height so the ring can size to 60% width,
  // fit without scrolling, and overlap up onto the RECORD line.
  useEffect(() => {
    const deck = deckAreaRef.current
    const title = titleRef.current
    if (!deck || !title) return
    const update = () => {
      setDeckArea({ w: deck.clientWidth, h: deck.clientHeight })
      setTitleH(title.clientHeight)
    }
    update()
    const ro = new ResizeObserver(update)
    ro.observe(deck)
    ro.observe(title)
    return () => ro.disconnect()
  }, [])

  useEffect(() => {
    if (pendingCamera) { clearCamera(); cameraInputRef.current?.click() }
  }, [pendingCamera])

  useEffect(() => {
    if (selectedFile && previewUrl) recognize(selectedFile)
  }, [selectedFile, previewUrl])

  const shiftDay = (dir: 1 | -1) => {
    // Wrap around so the deck is a closed loop: past the oldest day it returns
    // to today, and before today it jumps to the oldest day.
    setActiveIdx((prev) => (prev + dir + DAYS.length) % DAYS.length)
  }

  const onTouchStart = (e: React.TouchEvent) => {
    touchY.current = e.touches[0].clientY
  }
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchY.current === null) return
    const dy = e.changedTouches[0].clientY - touchY.current
    touchY.current = null
    if (Math.abs(dy) < 44) return
    shiftDay(dy < 0 ? 1 : -1)
  }

  // Mouse drag — lets the deck switch days on desktop (no touch screen)
  const onMouseDown = (e: React.MouseEvent) => {
    mouseY.current = e.clientY
  }
  const onMouseUp = (e: React.MouseEvent) => {
    if (mouseY.current === null) return
    const dy = e.clientY - mouseY.current
    mouseY.current = null
    if (Math.abs(dy) < 44) return
    shiftDay(dy < 0 ? 1 : -1)
  }

  // Wheel / trackpad — one step per gesture, throttled
  const onWheel = (e: React.WheelEvent) => {
    if (Math.abs(e.deltaY) < 8) return
    const now = Date.now()
    if (now - wheelLock.current < 320) return
    wheelLock.current = now
    shiftDay(e.deltaY > 0 ? 1 : -1)
  }

  const handleConfirm = async (edited: RecognizeApiResult) => {
    const entry: FoodEntry = {
      id: edited.id,
      food_name: edited.food_name,
      food_name_en: edited.food_name_en,
      calories: edited.calories,
      protein: edited.protein,
      carbs: edited.carbs,
      fat: edited.fat,
      fiber: edited.fiber,
      serving_size: edited.serving_size,
      confidence: edited.confidence,
      image_data_url: previewUrl ?? undefined,
      logged_at: new Date().toISOString(),
    }
    addEntry(todayStr, entry)
    await saveEntry(entry, todayStr).catch(() => {})
    clearImage()
    reset()
  }

  const handleManualConfirm = async (entry: FoodEntry) => {
    addEntry(todayStr, entry)
    await saveEntry(entry, todayStr).catch(() => {})
    setShowManualEntry(false)
  }

  // Ring card diameter as a ratio of the (full-bleed) deck width. >1 lets the
  // visible ring — which is only ~83% of the card box — fill nearly the whole width.
  const RING_RATIO = 1.02
  const ringD = deckArea.w > 0 ? Math.round(deckArea.w * RING_RATIO) : 300
  // Keep the ring's top edge fixed at titleH-24 regardless of size: the
  // 0.0833·Ø term cancels the ring's built-in top padding inside its card.
  const deckTop = titleH ? Math.max(0, Math.round(titleH - ringD * 0.0833 - 24)) : 0

  return (
    <>
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={onFileChange}
        className="hidden"
        aria-hidden="true"
      />

      {/* Full-height stage: title sits behind, ring deck floats on top and overlaps it */}
      <div className="relative" style={{ height: 'calc(100dvh - 9rem)' }}>

        {/* Big bold black title — each word stretched to fill the full column width.
            -left-4/-right-4 cancels the parent px-4 so it bleeds edge to edge. */}
        <div
          ref={titleRef}
          className="absolute -left-4 -right-4 top-0 z-0 pointer-events-none select-none"
          style={{ paddingTop: 'clamp(6px, 2vw, 14px)' }}
        >
          {['CALORIE', 'RECORD'].map((word) => (
            <svg key={word} viewBox="0 0 1000 180" width="100%" className="block">
              <text
                x="500" y="148" textAnchor="middle"
                textLength="980" lengthAdjust="spacingAndGlyphs"
                fontFamily="inherit" fontWeight={900} fontSize={176} fill="#1E1A14"
              >
                {word}
              </text>
            </svg>
          ))}
        </div>

        {/* Stacked DayRing deck — floats above the title; its top only nicks the
            bottom of RECORD's middle letters (small overlap below the title). */}
        <div
          ref={deckAreaRef}
          className="absolute -left-4 -right-4 bottom-0 z-10 overflow-hidden"
          // top is fixed so the ring only nicks the bottom of RECORD's middle letters
          style={{ top: deckTop }}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
          onMouseDown={onMouseDown}
          onMouseUp={onMouseUp}
          onWheel={onWheel}
        >
        {(() => {
          const RING = ringD
          const n = DAYS.length

          // Rank every non-active day by distance from the active one so each
          // card has a stable slot to animate toward when the selection changes.
          const rankOf = new Map<number, number>()
          DAYS
            .map((_, i) => i)
            .filter((i) => i !== activeIdx)
            .sort((a, b) => Math.abs(a - activeIdx) - Math.abs(b - activeIdx))
            .forEach((i, rank) => rankOf.set(i, rank))

          // Only a few cards peek; the rest pile up hidden behind the bottom one
          // (kept short so the deck never gets too long).
          const PEEK_CARDS = Math.min(n - 1, 3)

          // Pick the peek gap so the visible stack fits the available height.
          let PEEK = PEEK_CARDS > 0 ? (deckArea.h - RING) / PEEK_CARDS : 0
          PEEK = Math.max(26, Math.min(Math.round(RING * 0.34), PEEK))

          const stackHeight = RING + PEEK_CARDS * PEEK
          // Last-resort proportional shrink if even the tight stack is too tall.
          const scale = deckArea.h > 0 && stackHeight > deckArea.h
            ? deckArea.h / stackHeight
            : 1
          // DayRing's ring (outer Ø 250 in its 300 box) leaves ~28px padding all
          // round. Sizing the opaque disc to that ring kills the cream halo that
          // otherwise shows as a "white edge" between stacked cards.
          const DISC = Math.round(RING * 250 / 300)
          const ringBottomGap = Math.round(RING * (1 - 275 / 300))
          const labelBottom = ringBottomGap + Math.max(10, Math.round(PEEK * 0.28))

          return (
            // Center via left:50% + negative margin — reliable even when the
            // stack box is wider than the deck (flex justify-center is not).
            <div
              className="absolute top-0"
              style={{
                left: '50%', marginLeft: -RING / 2,
                width: RING, height: stackHeight,
                transform: `scale(${scale})`, transformOrigin: 'top center',
              }}
            >
              {DAYS.map((day, i) => {
                const isActive = i === activeIdx
                const rank = rankOf.get(i) ?? 0
                // Cards past the visible count clamp to the last slot → they stack
                // behind the bottom card (lower z-index hides them).
                const slot = isActive ? 0 : Math.min(rank + 1, PEEK_CARDS)
                const top = slot * PEEK
                const zIndex = isActive ? 50 : 10 - rank
                const summary = getDailySummary(day.dateStr)
                return (
                  // Stable key (dateStr) → framer-motion tweens each card to its
                  // new top/z slot, giving a smooth slide when the day changes.
                  <motion.div
                    key={day.dateStr}
                    className="absolute left-0 right-0 flex justify-center"
                    initial={false}
                    animate={{ top, zIndex }}
                    transition={{ type: 'spring', stiffness: 300, damping: 32 }}
                  >
                    <div className="relative" style={{ width: RING, height: RING }}>
                      {/* Opaque disc sized to the ring — occludes the card behind without a cream halo */}
                      <div
                        className="absolute rounded-full bg-bg"
                        style={{ width: DISC, height: DISC, left: (RING - DISC) / 2, top: (RING - DISC) / 2 }}
                      />
                      {/* DayRing is drawn at its intrinsic 300px, scaled up to fill RING */}
                      <div style={{ width: 300, height: 300, transform: `scale(${RING / 300})`, transformOrigin: 'top left' }}>
                        <DayRing
                          label={day.label}
                          calories={summary.total_calories}
                          calorieGoal={settings.calorie_goal}
                          protein={summary.total_protein}
                          carbs={summary.total_carbs}
                          detailed={isActive}
                        />
                      </div>
                      {/* Date label on the exposed lip while not selected */}
                      <motion.span
                        className="absolute left-0 right-0 text-center text-[15px] font-bold tracking-tight text-ink pointer-events-none"
                        style={{ bottom: labelBottom }}
                        animate={{ opacity: isActive ? 0 : 1 }}
                        transition={{ duration: 0.3 }}
                      >
                        {day.label}
                      </motion.span>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          )
        })()}
        </div>
      </div>

      {previewUrl && (
        <ImagePreview
          previewUrl={previewUrl}
          isLoading={isLoading}
          isError={isError}
          error={error}
          result={result}
          onConfirm={handleConfirm}
          onRetake={() => { clearImage(); reset() }}
        />
      )}

      {showManualEntry && (
        <ManualEntryModal
          onConfirm={handleManualConfirm}
          onClose={() => setShowManualEntry(false)}
        />
      )}
    </>
  )
}
