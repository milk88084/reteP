import { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ParticleRing } from '@/components/features/dashboard/ParticleRing'
import { ImagePreview } from '@/components/features/camera/ImagePreview'
import { ManualEntryModal } from '@/components/features/food/ManualEntryModal'
import { useCamera } from '@/hooks/useCamera'
import { useFoodRecognition } from '@/hooks/useFoodRecognition'
import { useFoodLogStore } from '@/store/foodLogStore'
import { useSettingsStore } from '@/store/settingsStore'
import { useUIStore } from '@/store/uiStore'
import { getTodayStr } from '@/utils/dateUtils'
import { formatNum } from '@/utils/nutritionCalc'
import { FoodEntry, RecognizeApiResult } from '@/types'
import { saveEntry } from '@/services/foodRecognitionApi'
import { useAuth } from '@/hooks/useAuth'

const todayStr = getTodayStr()

interface HomePageProps {
  navIdx: number
}

export const HomePage = ({ navIdx }: HomePageProps) => {
  const { user } = useAuth()
  const { previewUrl, selectedFile, onFileChange, clearImage } = useCamera()
  const { recognize, isLoading, isError, error, result, reset } = useFoodRecognition()
  const { addEntry, getDailySummary } = useFoodLogStore()
  const { settings } = useSettingsStore()
  const { showManualEntry, setShowManualEntry, pendingCamera, clearCamera } = useUIStore()

  const cameraInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (pendingCamera) { clearCamera(); cameraInputRef.current?.click() }
  }, [pendingCamera])

  useEffect(() => {
    if (selectedFile && previewUrl) recognize(selectedFile)
  }, [selectedFile, previewUrl])

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
    await saveEntry(entry, todayStr, user?.id ?? '').catch((e) => console.error('[saveEntry]', e))
    clearImage()
    reset()
  }

  const handleManualConfirm = async (entry: FoodEntry) => {
    addEntry(todayStr, entry)
    await saveEntry(entry, todayStr, user?.id ?? '').catch((e) => console.error('[saveEntry]', e))
    setShowManualEntry(false)
  }

  const summary = getDailySummary(todayStr)

  const METRICS = {
    1: { current: summary.total_protein,  goal: settings.protein_goal, color: '#6B9EFF', label: '蛋白質',    unit: 'g' },
    2: { current: summary.total_calories, goal: settings.calorie_goal, color: '#FF6041', label: '熱量',      unit: 'kcal' },
    3: { current: summary.total_carbs,    goal: settings.carbs_goal,   color: '#FFC93C', label: '碳水化合物', unit: 'g' },
  } as const
  const metric  = METRICS[navIdx as 1 | 2 | 3]
  const progress = Math.min(metric.current / metric.goal, 1)
  const percent  = Math.round((metric.current / metric.goal) * 100)

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

      {/* Full-height stage: title on top, particle ring below */}
      <div className="relative" style={{ height: 'calc(100dvh - 9rem)' }}>

        {/* Big bold black title */}
        <div
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

        {/* Particle ring — larger and positioned toward the top of the remaining space */}
        <div className="absolute inset-x-0 bottom-0 top-[180px] flex flex-col items-center justify-start pt-6">
          <ParticleRing progress={progress} color={metric.color} size={300} />
          <AnimatePresence mode="wait">
            <motion.div
              key={navIdx}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22 }}
              className="mt-4 text-center"
            >
              <div className="text-4xl font-bold tracking-tight text-ink">{percent}%</div>
              <div className="mt-1 text-sm text-ink-muted">
                {metric.label}　·　{formatNum(metric.current)} / {metric.goal}{metric.unit}
              </div>
            </motion.div>
          </AnimatePresence>
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
