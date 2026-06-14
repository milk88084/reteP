import { useRef } from 'react'

interface CameraCaptureProps {
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onManualEntry: () => void
}

const CameraIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/>
    <circle cx="12" cy="13" r="4"/>
  </svg>
)

const PencilIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
)

export const CameraCapture = ({ onFileChange, onManualEntry }: CameraCaptureProps) => {
  const inputRef = useRef<HTMLInputElement>(null)

  return (
    <div className="flex items-center justify-center gap-8 my-4">
      {/* Manual entry button */}
      <div className="flex flex-col items-center gap-1.5">
        <button
          onClick={onManualEntry}
          className="w-14 h-14 rounded-full bg-surface border-2 border-border text-ink-muted flex items-center justify-center shadow-sm active:scale-95 transition-transform duration-150 hover:border-accent hover:text-accent"
          aria-label="手動輸入"
        >
          <PencilIcon />
        </button>
        <span className="text-xs text-ink-muted font-medium">手動輸入</span>
      </div>

      {/* Camera button */}
      <div className="flex flex-col items-center gap-1.5">
        <button
          onClick={() => inputRef.current?.click()}
          className="w-20 h-20 rounded-full bg-accent flex items-center justify-center shadow-lg active:scale-95 transition-transform duration-150"
          aria-label="拍照記錄"
        >
          <CameraIcon />
        </button>
        <span className="text-xs text-ink-muted font-medium">拍照記錄</span>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={onFileChange}
          className="hidden"
          aria-hidden="true"
        />
      </div>
    </div>
  )
}
