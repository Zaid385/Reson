import React from 'react'
import { Play, Square, Trash2 } from 'lucide-react'

interface Props {
  id: string
  name: string
  url?: string // used for fetching if built-in
  isPlaying?: boolean
  onPreviewToggle: () => void
  onDelete?: () => void
}

export const SampleListItem: React.FC<Props> = ({ id, name, url, isPlaying, onPreviewToggle, onDelete }) => {
  const handleDragStart = async (e: React.DragEvent) => {
    // For drag and drop from the browser to the pad
    e.dataTransfer.setData('application/reson-sample-id', id)
    e.dataTransfer.setData('application/reson-sample-name', name)
    if (url) {
      e.dataTransfer.setData('application/reson-sample-url', url)
    }
  }

  return (
    <div 
      className={`flex items-center gap-3 px-3 py-2 mx-2 mb-1 rounded-md cursor-grab group transition-all duration-150 border border-transparent ${isPlaying ? 'bg-[var(--bg-surface-raised)] border-[var(--border-subtle)] shadow-[inset_3px_0_0_var(--accent-cyan)]' : 'hover:bg-[var(--bg-elevated)] hover:border-[var(--border-subtle)]/50'}`}
      draggable
      onDragStart={handleDragStart}
    >
      <button 
        className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all ${isPlaying ? 'bg-[var(--accent-cyan)] text-black shadow-[0_0_8px_rgba(0,240,255,0.4)] scale-105' : 'bg-[var(--bg-base)] text-[var(--text-muted)] group-hover:text-[var(--text-primary)] group-hover:bg-[var(--bg-surface-raised)] border border-[var(--border-subtle)]'}`}
        onClick={onPreviewToggle}
      >
        {isPlaying ? <Square className="w-3 h-3 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current translate-x-[1px]" />}
      </button>
      <div className="flex-1 overflow-hidden flex flex-col justify-center">
        <p className={`text-[13px] font-medium truncate transition-colors ${isPlaying ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)] group-hover:text-[var(--text-primary)]'}`}>{name}</p>
        {/* Layout preparation for future waveform thumbnail */}
        <div className="h-3 w-full mt-1 rounded-[1px] opacity-20 bg-gradient-to-r from-[var(--border-subtle)] to-transparent pointer-events-none hidden" />
      </div>
      {onDelete && (
        <button
          className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-[var(--text-muted)] hover:text-red-400 hover:bg-red-400/10 transition-colors opacity-0 group-hover:opacity-100"
          onClick={(e) => {
            e.stopPropagation()
            onDelete()
          }}
          title="Delete sample"
        >
          <Trash2 size={14} />
        </button>
      )}
    </div>
  )
}
