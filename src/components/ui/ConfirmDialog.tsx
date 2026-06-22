import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'

interface ConfirmDialogProps {
  message: string
  confirmLabel?: string
  cancelLabel?: string
  danger?: boolean
  onConfirm: () => void
  onCancel: () => void
}

export const ConfirmDialog = ({
  message,
  confirmLabel = '確定',
  cancelLabel = '取消',
  danger = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) => createPortal(
  <AnimatePresence>
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-ink/60 flex items-end justify-center px-4 pb-8"
      onClick={(e) => { if (e.target === e.currentTarget) onCancel() }}
    >
      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 40, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 340, damping: 30 }}
        className="w-full max-w-sm bg-bg rounded-3xl overflow-hidden shadow-xl"
      >
        <div className="px-6 pt-6 pb-5">
          <p className="text-sm text-ink leading-relaxed text-center">{message}</p>
        </div>

        <div className="border-t border-border grid grid-cols-2">
          <button
            onClick={onCancel}
            className="py-4 text-sm font-semibold text-ink-muted hover:bg-surface transition-colors border-r border-border"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className={`py-4 text-sm font-semibold transition-colors hover:bg-surface ${
              danger ? 'text-red-500' : 'text-accent'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </motion.div>
    </motion.div>
  </AnimatePresence>,
  document.body,
)
