import React from 'react'
import { useStore } from '@state/store'
import { motion, AnimatePresence } from 'framer-motion'
import { Loader2 } from 'lucide-react'

export const GlobalLoader: React.FC = () => {
  const isProcessing = useStore(state => state.isProcessing)
  const processingMessage = useStore(state => state.processingMessage)

  return (
    <AnimatePresence>
      {isProcessing && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.9, y: 10 }}
            animate={{ scale: 1, y: 0 }}
            className="flex flex-col items-center gap-4 p-8 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] shadow-2xl"
          >
            <Loader2 className="w-10 h-10 text-[var(--accent-cyan)] animate-spin" />
            <p className="text-sm font-medium text-white tracking-wide">
              {processingMessage || 'Loading...'}
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
