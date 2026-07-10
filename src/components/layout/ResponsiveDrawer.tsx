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

export const ResponsiveDrawer: React.FC<ResponsiveDrawerProps> = ({
  isOpen, onClose, side, width = 'w-[280px]', children, title
}) => {
  const breakpoint = useBreakpoint()
  const isMobile = breakpoint === 'mobile'
  const isTablet = breakpoint === 'tablet'

  useEffect(() => {
    // If we transition to desktop, we might want to let the parent handle the layout
    // But this component handles the DOM wrapper.
  }, [breakpoint])

  const isInline = !isMobile && !isTablet

  if (!isOpen) return null

  if (isInline) {
    return (
      <aside className={`${width} bg-[var(--bg-surface)] border-${side === 'left' ? 'r' : 'l'} border-[var(--border-subtle)] flex flex-col shrink-0 overflow-hidden relative transition-all duration-200`}>
        {children}
      </aside>
    )
  }

  // Mobile / Tablet Slide-over
  const transformClass = side === 'left' ? '-translate-x-full' : 'translate-x-full'
  const slideInClass = 'translate-x-0'
  const positionClass = side === 'left' ? 'left-0' : 'right-0'

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity"
        onClick={onClose}
      />
      <aside 
        className={`fixed top-0 bottom-0 ${positionClass} z-50 flex flex-col bg-[var(--bg-surface)] border-${side === 'left' ? 'r' : 'l'} border-[var(--border-subtle)] shadow-2xl transition-transform duration-200 ease-out ${isMobile ? 'w-full max-w-[360px]' : width} ${isOpen ? slideInClass : transformClass}`}
      >
        <div className="p-4 border-b border-[var(--border-subtle)] flex items-center justify-between bg-[var(--bg-elevated)]">
          <h2 className="label-caps">{title}</h2>
          <button onClick={onClose} className="text-[var(--text-muted)] hover:text-white transition-colors p-2 -mr-2">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto flex flex-col">
          {children}
        </div>
      </aside>
    </>
  )
}
