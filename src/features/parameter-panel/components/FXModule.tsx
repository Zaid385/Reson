import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FXHeader } from './FXHeader'
import { FXToggle } from './FXToggle'

interface FXModuleProps {
  title: string
  defaultExpanded?: boolean
  enabled?: boolean
  onToggle?: (enabled: boolean) => void
  onReset?: () => void
  hasToggle?: boolean
  children: React.ReactNode
}

export const FXModule: React.FC<FXModuleProps> = ({ 
  title, 
  defaultExpanded = false, 
  enabled = false, 
  onToggle,
  onReset,
  hasToggle = true,
  children 
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded)

  return (
    <div className="flex flex-col border-b border-[var(--border-subtle)] bg-[var(--bg-base)]">
      <FXHeader 
        title={title} 
        isExpanded={isExpanded} 
        onToggleExpand={() => setIsExpanded(!isExpanded)}
        onReset={onReset}
      >
        {hasToggle && onToggle && (
          <FXToggle enabled={enabled} onChange={onToggle} />
        )}
      </FXHeader>

      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="p-4 pt-2">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
