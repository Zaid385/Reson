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
      className="flex items-center justify-between px-3 py-2 cursor-pointer hover:bg-white/[0.02] transition-colors select-none group"
      onClick={onToggleExpand}
    >
      <div className="flex items-center gap-2">
        <ChevronRight 
          className={`w-3.5 h-3.5 text-[var(--text-muted)] transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`}
        />
        <span className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider">
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
