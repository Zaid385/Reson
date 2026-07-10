import { useToastStore } from '@state/toastStore'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertCircle, CheckCircle, Info, X } from 'lucide-react'

export function ToastContainer() {
  const toasts = useToastStore(state => state.toasts)
  const removeToast = useToastStore(state => state.removeToast)

  return (
    <div className="fixed bottom-16 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
      <AnimatePresence>
        {toasts.map(t => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
            className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-lg shadow-xl border backdrop-blur-md text-sm font-medium ${
              t.type === 'error' ? 'bg-red-500/10 border-red-500/20 text-red-500' :
              t.type === 'success' ? 'bg-[var(--accent-cyan)]/10 border-[var(--accent-cyan)]/20 text-[var(--accent-cyan)]' :
              'bg-[var(--bg-elevated)] border-[var(--border-subtle)] text-white'
            }`}
          >
            {t.type === 'error' && <AlertCircle size={16} />}
            {t.type === 'success' && <CheckCircle size={16} />}
            {t.type === 'info' && <Info size={16} />}
            <span>{t.message}</span>
            <button onClick={() => removeToast(t.id)} className="ml-2 hover:opacity-70 transition-opacity">
              <X size={14} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
