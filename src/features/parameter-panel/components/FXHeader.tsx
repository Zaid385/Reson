import React from 'react'
import { ChevronRight, RotateCcw } from 'lucide-react'

interface FXHeaderProps {
  title: string
  isExpanded: boolean
  onToggleExpand: () => void
  onReset?: () => void
  children?: React.ReactNode // Usually for the FXToggle
}

export const FXHeader: React.FC<FXHeaderProps> = ({ title, isExpanded, onToggleExpand, onReset, children }) => {
  return (
    <div 
      className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-[var(--bg-surface-raised)] transition-all select-none group border-b border-[var(--border-subtle)]/50"
      onClick={onToggleExpand}
    >
      <div className="flex items-center gap-2.5">
        <ChevronRight 
          className={`w-4 h-4 text-[var(--text-muted)] group-hover:text-[var(--text-primary)] transition-all duration-200 ${isExpanded ? 'rotate-90' : ''}`}
        />
        <span className="text-xs font-semibold text-[var(--text-primary)] capitalize tracking-widest opacity-90 group-hover:opacity-100 transition-opacity">
          {title}
        </span>
      </div>
      <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
        {onReset && (
          <button 
            onClick={(e) => { e.stopPropagation(); onReset(); }}
            className="text-[var(--text-muted)] hover:text-white transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
            title="Reset to Default"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        )}
        {children}
      </div>
    </div>
  )
}
