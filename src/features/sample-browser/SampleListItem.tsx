import React from 'react'
import { Play, Square } from 'lucide-react'

interface Props {
  id: string
  name: string
  url?: string // used for fetching if built-in
  isPlaying?: boolean
  onPreviewToggle: () => void
}

export const SampleListItem: React.FC<Props> = ({ id, name, url, isPlaying, onPreviewToggle }) => {
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
      className="flex items-center px-4 py-2 hover:bg-[var(--bg-elevated)] cursor-grab group border-b border-[var(--border-subtle)]"
      draggable
      onDragStart={handleDragStart}
    >
      <button 
        className="w-8 h-8 rounded-full flex items-center justify-center bg-[var(--bg-base)] hover:bg-[var(--accent-cyan)] hover:text-black text-[var(--text-muted)] transition-colors"
        onClick={onPreviewToggle}
      >
        {isPlaying ? <Square className="w-3 h-3" /> : <Play className="w-3 h-3 translate-x-[1px]" />}
      </button>
      <div className="ml-3 flex-1 overflow-hidden">
        <p className="text-sm font-medium text-[var(--text-primary)] truncate">{name}</p>
      </div>
    </div>
  )
}
