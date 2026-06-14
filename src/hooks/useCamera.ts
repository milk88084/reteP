import { useRef, useState, useCallback } from 'react'

const compressImage = (file: File, maxWidth = 800, quality = 0.8): Promise<{ file: File; dataUrl: string }> =>
  new Promise((resolve, reject) => {
    const img = new Image()
    const reader = new FileReader()
    reader.onload = (e) => {
      img.src = e.target?.result as string
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const scale = Math.min(1, maxWidth / img.width)
        canvas.width = img.width * scale
        canvas.height = img.height * scale
        const ctx = canvas.getContext('2d')!
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        const dataUrl = canvas.toDataURL('image/jpeg', quality)
        canvas.toBlob(
          (blob) => {
            if (!blob) return reject(new Error('Compression failed'))
            const compressedFile = new File([blob], file.name, { type: 'image/jpeg' })
            resolve({ file: compressedFile, dataUrl })
          },
          'image/jpeg',
          quality
        )
      }
      img.onerror = reject
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })

export const useCamera = () => {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const openCamera = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  const onFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const { file: compressed, dataUrl } = await compressImage(file)
      setSelectedFile(compressed)
      setPreviewUrl(dataUrl)
    } catch {
      setSelectedFile(file)
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
    }
    e.target.value = ''
  }, [])

  const clearImage = useCallback(() => {
    setPreviewUrl(null)
    setSelectedFile(null)
  }, [])

  return { fileInputRef, previewUrl, selectedFile, openCamera, onFileChange, clearImage }
}
