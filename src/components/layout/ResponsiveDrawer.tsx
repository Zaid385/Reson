import React, { useEffect } from 'react'
import { useBreakpoint } from '@hooks/useBreakpoint'
import { X } from 'lucide-react'

interface ResponsiveDrawerProps {
  isOpen: boolean
  onClose: () => void
  side: 'left' | 'right'
  width?: string
  children: React.ReactNode
  title: string
}

import { motion, AnimatePresence } from 'framer-motion'

export const ResponsiveDrawer: React.FC<ResponsiveDrawerProps> = ({
  isOpen, onClose, side, width = 'w-[280px]', children, title
}) => {
  const breakpoint = useBreakpoint()
  const isMobile = breakpoint === 'mobile'
  const isTablet = breakpoint === 'tablet'

  useEffect(() => {
  }, [breakpoint])

  const isInline = !isMobile && !isTablet
  const numericWidth = parseInt(width.replace(/\D/g, '')) || 280

  if (isInline) {
    return (
      <AnimatePresence>
        {isOpen && (
          <motion.aside 
            key="drawer-inline"
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: numericWidth, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className={`bg-[var(--bg-surface)] border-${side === 'left' ? 'r' : 'l'} border-[var(--border-subtle)] flex flex-col shrink-0 overflow-hidden relative`}
          >
            <div style={{ width: numericWidth }} className="h-full flex flex-col shrink-0">
              <div className="p-3 border-b border-[var(--border-subtle)] flex items-center justify-between bg-[var(--bg-base)] shrink-0">
                <h2 className="label-caps">{title}</h2>
                <button 
                  onClick={onClose} 
                  className="text-[var(--text-muted)] hover:text-white transition-colors p-1 -mr-1 rounded hover:bg-[var(--bg-surface-raised)]"
                  title="Collapse panel"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto flex flex-col hide-scrollbar">
                {children}
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    )
  }

  // Mobile / Tablet Slide-over
  const transformClass = side === 'left' ? '-100%' : '100%'
  const positionClass = side === 'left' ? 'left-0' : 'right-0'

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            key="drawer-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            onClick={onClose}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {isOpen && (
          <motion.aside 
            key="drawer-mobile-aside"
            initial={{ x: transformClass }}
            animate={{ x: 0 }}
            exit={{ x: transformClass }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className={`fixed top-0 bottom-0 ${positionClass} z-50 flex flex-col bg-[var(--bg-surface)] border-${side === 'left' ? 'r' : 'l'} border-[var(--border-subtle)] shadow-2xl ${isMobile ? 'w-full max-w-[360px]' : width}`}
          >
            <div className="p-4 border-b border-[var(--border-subtle)] flex items-center justify-between bg-[var(--bg-elevated)] shrink-0">
              <h2 className="label-caps">{title}</h2>
              <button onClick={onClose} className="text-[var(--text-muted)] hover:text-white transition-colors p-2 -mr-2">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto flex flex-col">
              {children}
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  )
}
