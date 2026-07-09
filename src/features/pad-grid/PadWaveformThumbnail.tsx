import React from 'react'

export interface PadWaveformThumbnailProps {
  color: string
  peaks: number[]
}

export const PadWaveformThumbnail: React.FC<PadWaveformThumbnailProps> = ({ color, peaks }) => {
  if (!peaks || peaks.length === 0) return null

  const pathD = peaks.map((p, i) => {
    const x = (i / (peaks.length - 1)) * 100
    // p is [0, 1], we draw symmetric around 50%
    const height = p * 100
    return `M ${x}% ${50 - height / 2}% L ${x}% ${50 + height / 2}%`
  }).join(' ')

  return (
    <div className="absolute inset-0 pointer-events-none opacity-40 p-2 overflow-hidden">
      <svg width="100%" height="100%" preserveAspectRatio="none">
        <path d={pathD} stroke={color} strokeWidth="2" strokeLinecap="round" opacity="0.8" />
      </svg>
    </div>
  )
}
