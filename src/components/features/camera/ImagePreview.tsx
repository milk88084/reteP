import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { RecognizeApiResult } from '@/types'
import { Button } from '@/components/ui/Button'

interface ImagePreviewProps {
  previewUrl: string
  isPending: boolean
  onAnalyze: (description: string) => void
  isLoading: boolean
  isError: boolean
  error: string | null
  result: RecognizeApiResult | null
  onConfirm: (edited: RecognizeApiResult) => void
  onRetake: () => void
}

const EditableNum = ({
  label,
  unit,
  value,
  onChange,
}: {
  label: string
  unit: string
  value: number
  onChange: (v: number) => void
}) => (
  <div className="flex flex-col items-center gap-0.5">
    <p className="text-[10px] text-ink-muted">{label}</p>
    <input
      type="number"
      value={value}
      min={0}
      onChange={(e) => onChange(Number(e.target.value))}
      className="w-full text-center text-sm font-semibold text-ink bg-bg rounded-lg px-1 py-1 outline-none focus:ring-2 focus:ring-brand"
    />
    <p className="text-[10px] text-ink-muted">{unit}</p>
  </div>
)

export const ImagePreview = ({
  previewUrl,
  isPending,
  onAnalyze,
  isLoading,
  isError,
  error,
  result,
  onConfirm,
  onRetake,
}: ImagePreviewProps) => {
  const [draft, setDraft] = useState<RecognizeApiResult | null>(null)
  const [description, setDescription] = useState('')

  useEffect(() => {
    if (result) setDraft(result)
  }, [result])

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  const setField = <K extends keyof RecognizeApiResult>(key: K) =>
    (val: RecognizeApiResult[K]) =>
      setDraft((d) => (d ? { ...d, [key]: val } : d))

  return createPortal(
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-ink/80 flex flex-col items-center justify-center p-6"
      >
        <motion.div
          initial={{ scale: 0.92, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.92, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 28 }}
          className="w-full max-w-sm bg-bg rounded-3xl overflow-hidden"
        >
          {/* Photo */}
          <div className="relative w-full aspect-square">
            <img src={previewUrl} alt="食物照片" className="w-full h-full object-cover" />
            {isLoading && (
              <div className="absolute inset-0 bg-brand/90 flex flex-col items-center justify-center">
                <div className="w-12 h-12 border-4 border-ink/20 border-t-ink rounded-full animate-spin" />
                <p className="mt-4 text-ink font-semibold text-sm">辨識中...</p>
              </div>
            )}
          </div>

          <div className="p-5">
            {/* ── Pending: description input before API call ── */}
            {isPending && (
              <div className="space-y-3">
                <div>
                  <p className="text-[10px] text-ink-muted mb-1.5">補充描述（選填）</p>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="例如：一碗白飯、半份牛排、加了起司..."
                    rows={3}
                    className="w-full text-sm text-ink bg-surface rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-brand resize-none placeholder:text-ink-muted/50"
                  />
                </div>
                <div className="flex gap-2">
                  <Button variant="secondary" onClick={onRetake} className="flex-1" size="md">
                    取消
                  </Button>
                  <Button
                    variant="primary"
                    onClick={() => onAnalyze(description)}
                    className="flex-1"
                    size="md"
                  >
                    開始分析
                  </Button>
                </div>
              </div>
            )}

            {/* ── Post-API: loading / error / result ── */}
            {!isPending && (
              <>
                {isLoading && (
                  <p className="text-center text-ink-muted text-sm mb-4">正在分析食物營養成分</p>
                )}

                {isError && (
                  <div className="mb-4">
                    <p className="text-red-500 text-sm text-center font-medium">{error}</p>
                  </div>
                )}

                {draft && !isLoading && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-4 space-y-3"
                  >
                    <div>
                      <p className="text-[10px] text-ink-muted mb-1">食物名稱</p>
                      <input
                        value={draft.food_name}
                        onChange={(e) => setField('food_name')(e.target.value)}
                        className="w-full text-base font-bold text-ink bg-surface rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-brand"
                      />
                    </div>

                    <div>
                      <p className="text-[10px] text-ink-muted mb-1">份量</p>
                      <input
                        value={draft.serving_size}
                        onChange={(e) => setField('serving_size')(e.target.value)}
                        className="w-full text-sm text-ink bg-surface rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-brand"
                      />
                    </div>

                    <div className="flex items-baseline gap-2">
                      <input
                        type="number"
                        value={draft.calories}
                        min={0}
                        onChange={(e) => setField('calories')(Number(e.target.value))}
                        className="w-28 text-3xl font-bold text-accent bg-transparent outline-none focus:bg-surface focus:rounded-xl focus:px-2"
                      />
                      <span className="text-sm text-ink-muted">kcal</span>
                      <span className="text-[10px] text-ink-muted ml-auto">點擊數字可編輯</span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 bg-surface rounded-xl p-3">
                      <EditableNum label="蛋白質" unit="g" value={draft.protein} onChange={setField('protein')} />
                      <EditableNum label="碳水" unit="g" value={draft.carbs} onChange={setField('carbs')} />
                      <EditableNum label="脂肪" unit="g" value={draft.fat} onChange={setField('fat')} />
                    </div>
                  </motion.div>
                )}

                <div className="flex gap-2">
                  <Button variant="secondary" onClick={onRetake} className="flex-1" size="md">
                    {isError ? '重新拍照' : '取消'}
                  </Button>
                  {(draft || isError) && (
                    <Button
                      variant="primary"
                      onClick={() => draft && onConfirm(draft)}
                      disabled={!draft}
                      className="flex-1"
                      size="md"
                    >
                      {isError ? '換張照片' : '加入記錄'}
                    </Button>
                  )}
                </div>
              </>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body,
  )
}
