import React from 'react'

export interface PadBadgeProps {
  state: 'mute' | 'solo' | 'error' | 'none'
}

export const PadBadge: React.FC<PadBadgeProps> = ({ state }) => {
  if (state === 'none') return null

  let bgColor = ''
  let content = ''
  if (state === 'mute') {
    bgColor = 'bg-gray-600'
    content = 'M'
  } else if (state === 'solo') {
    bgColor = 'bg-[var(--accent-amber)] text-black'
    content = 'S'
  } else if (state === 'error') {
    bgColor = 'bg-[var(--accent-pink)]'
    content = '!'
  }

  return (
    <div className={`w-4 h-4 rounded text-[10px] font-bold flex items-center justify-center ${bgColor}`}>
      {content}
    </div>
  )
}
