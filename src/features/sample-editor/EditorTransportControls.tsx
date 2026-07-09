import React from 'react'
import { Play, Square, Repeat, ArrowLeftRight } from 'lucide-react'

interface Props {
  isPlaying: boolean
  onPlayToggle: () => void
  loop: boolean
  onLoopToggle: () => void
  reverse: boolean
  onReverseToggle: () => void
  playMode: 'oneshot' | 'gate'
  onPlayModeChange: (mode: 'oneshot' | 'gate') => void
}

export const EditorTransportControls: React.FC<Props> = ({
  isPlaying, onPlayToggle,
  loop, onLoopToggle,
  reverse, onReverseToggle,
  playMode, onPlayModeChange
}) => {
  return (
    <div className="flex items-center gap-4 bg-[var(--bg-surface)] p-2 rounded-lg border border-[var(--border-subtle)]">
      <button 
        className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${isPlaying ? 'bg-[var(--accent-cyan)] text-black' : 'bg-[var(--bg-elevated)] text-[var(--text-primary)] hover:bg-[var(--bg-surface-raised)]'}`}
        onClick={onPlayToggle}
      >
        {isPlaying ? <Square className="w-4 h-4" /> : <Play className="w-4 h-4 translate-x-[1px]" />}
      </button>

      <div className="w-px h-6 bg-[var(--border-subtle)] mx-2" />

      <button 
        className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-2 transition-colors ${loop ? 'bg-[var(--accent-cyan)] text-black' : 'text-[var(--text-muted)] hover:bg-[var(--bg-elevated)] hover:text-white'}`}
        onClick={onLoopToggle}
      >
        <Repeat className="w-3 h-3" /> LOOP
      </button>

      <button 
        className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-2 transition-colors ${reverse ? 'bg-[var(--accent-cyan)] text-black' : 'text-[var(--text-muted)] hover:bg-[var(--bg-elevated)] hover:text-white'}`}
        onClick={onReverseToggle}
      >
        <ArrowLeftRight className="w-3 h-3" /> REV
      </button>

      <div className="w-px h-6 bg-[var(--border-subtle)] mx-2" />

      <div className="flex bg-[var(--bg-base)] p-1 rounded-md">
        <button 
          className={`px-3 py-1 text-xs font-medium rounded-sm ${playMode === 'oneshot' ? 'bg-[var(--bg-elevated)] text-white shadow-sm' : 'text-[var(--text-muted)]'}`}
          onClick={() => onPlayModeChange('oneshot')}
        >
          One-Shot
        </button>
        <button 
          className={`px-3 py-1 text-xs font-medium rounded-sm ${playMode === 'gate' ? 'bg-[var(--bg-elevated)] text-white shadow-sm' : 'text-[var(--text-muted)]'}`}
          onClick={() => onPlayModeChange('gate')}
        >
          Gate
        </button>
      </div>
    </div>
  )
}
