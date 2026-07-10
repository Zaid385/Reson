import React from 'react'

export interface PadWaveformThumbnailProps {
  color: string
  peaks: number[]
}

export const PadWaveformThumbnail: React.FC<PadWaveformThumbnailProps> = ({ color, peaks }) => {
  if (!peaks || peaks.length === 0) return null

  const pathD = peaks.map((p, i) => {
    const x = (i / (peaks.length - 1)) * 100
    // p is [0, 1], we draw symmetric around 50
    const height = p * 100
    return `M ${x.toFixed(2)} ${(50 - height / 2).toFixed(2)} L ${x.toFixed(2)} ${(50 + height / 2).toFixed(2)}`
  }).join(' ')

  return (
    <div className="absolute inset-0 pointer-events-none opacity-40 p-2 overflow-hidden">
      <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
        <path className="waveform-path transition-all duration-300" d={pathD} stroke={color} strokeWidth="1" strokeLinecap="round" opacity="0.8" vectorEffect="non-scaling-stroke" />
      </svg>
    </div>
  )
}
