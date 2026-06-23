import { useState, useCallback } from 'react'
import { RecognizeApiResult } from '@/types'
import { recognizeFood } from '@/services/foodRecognitionApi'

type Status = 'idle' | 'loading' | 'success' | 'error'

export const useFoodRecognition = () => {
  const [status, setStatus] = useState<Status>('idle')
  const [result, setResult] = useState<RecognizeApiResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const recognize = useCallback(async (file: File, description?: string) => {
    setStatus('loading')
    setError(null)
    setResult(null)
    try {
      const res = await recognizeFood(file, description)
      if (res.success && res.data) {
        setResult(res.data)
        setStatus('success')
      } else {
        throw new Error(res.error ?? '辨識失敗')
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '發生未知錯誤'
      if (msg.includes('network') || msg.includes('Network')) {
        setError('網路連線失敗，請檢查網路後再試')
      } else if (msg.includes('timeout')) {
        setError('連線逾時，請再試一次')
      } else {
        setError('無法辨識此食物，請換張更清晰的照片')
      }
      setStatus('error')
    }
  }, [])

  const reset = useCallback(() => {
    setStatus('idle')
    setResult(null)
    setError(null)
  }, [])

  return {
    recognize,
    isLoading: status === 'loading',
    isSuccess: status === 'success',
    isError: status === 'error',
    result,
    error,
    reset,
  }
}
