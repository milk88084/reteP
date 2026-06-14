import { useEffect, useRef, useState } from 'react'
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

  useEffect(() => {
    if (pendingCamera) { clearCamera(); cameraInputRef.current?.click() }
  }, [pendingCamera])

  useEffect(() => {
    if (selectedFile && previewUrl) recognize(selectedFile)
  }, [selectedFile, previewUrl])

  const shiftDay = (dir: 1 | -1) => {
    setActiveIdx((prev) => {
      const next = prev + dir
      return next < 0 || next >= DAYS.length ? prev : next
    })
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

      {/* Big bold black title — VOICE MEMOS style heading */}
      <div className="flex flex-col items-center pointer-events-none select-none" style={{ paddingTop: 'clamp(8px, 3vw, 20px)' }}>
        <span className="font-black text-ink tracking-tight leading-[0.84]" style={{ fontSize: 'clamp(46px, 18vw, 74px)' }}>
          CALORIE
        </span>
        <span className="font-black text-ink tracking-tight leading-[0.84]" style={{ fontSize: 'clamp(46px, 18vw, 74px)' }}>
          RECORD
        </span>
      </div>

      {/* Active day dial — overlaps title bottom like the reference */}
      <div
        className="relative w-full flex justify-center"
        style={{ marginTop: -18 }}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        {(() => {
          const day = DAYS[activeIdx]
          const summary = getDailySummary(day.dateStr)
          return (
            <DayRing
              key={day.dateStr}
              label={day.label}
              calories={summary.total_calories}
              calorieGoal={settings.calorie_goal}
              protein={summary.total_protein}
              carbs={summary.total_carbs}
              onPrev={() => shiftDay(-1)}
              onNext={() => shiftDay(1)}
              canPrev={activeIdx > 0}
              canNext={activeIdx < DAYS.length - 1}
            />
          )
        })()}
      </div>

      {/* Faded text list of the other days (like the memo list) */}
      <div className="mt-2 flex flex-col items-center gap-3">
        {DAYS.map((day, i) => {
          if (i === activeIdx) return null
          const dist = Math.abs(i - activeIdx)
          const opacity = Math.max(0.12, 1 - dist * 0.26)
          const summary = getDailySummary(day.dateStr)
          return (
            <button
              key={day.dateStr}
              onClick={() => setActiveIdx(i)}
              className="flex flex-col items-center leading-tight"
              style={{ opacity }}
            >
              <span className="text-[17px] font-bold tracking-tight text-ink">{day.label}</span>
              <span className="text-[11px] text-ink/45">{Math.round(summary.total_calories)} kcal</span>
            </button>
          )
        })}
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
