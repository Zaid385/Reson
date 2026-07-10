import React, { useRef, useState, useEffect, useCallback } from 'react'

export interface KnobControlProps {
  label: string
  value: number
  min: number
  max: number
  step?: number
  unit?: string
  onChange: (val: number) => void
  onDoubleClick?: () => void
}

export const KnobControl: React.FC<KnobControlProps> = ({
  label, value: rawValue, min, max, step = 1, unit = '', onChange, onDoubleClick
}) => {
  const value = rawValue ?? min
  const containerRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [startY, setStartY] = useState(0)
  const [startValue, setStartValue] = useState(0)

  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true)
    setStartY(e.clientY)
    setStartValue(value)
  }

  const handlePointerMove = useCallback((e: PointerEvent) => {
    if (!isDragging) return
    
    const deltaY = startY - e.clientY
    const range = max - min
    const deltaVal = (deltaY / 150) * range
    
    let newVal = startValue + deltaVal
    if (step) {
      newVal = Math.round(newVal / step) * step
    }
    
    newVal = Math.max(min, Math.min(max, newVal))
    onChange(newVal)
  }, [isDragging, startY, startValue, min, max, step, onChange])

  const handlePointerUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('pointermove', handlePointerMove)
      window.addEventListener('pointerup', handlePointerUp)
    }
    return () => {
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerup', handlePointerUp)
    }
  }, [isDragging, handlePointerMove, handlePointerUp])

  const isBipolar = min < 0 && max > 0
  
  let startP = 0
  let endP = (value - min) / (max - min)
  
  if (isBipolar) {
    const zeroP = (0 - min) / (max - min)
    if (value >= 0) {
      startP = zeroP
      endP = (value - min) / (max - min)
    } else {
      startP = (value - min) / (max - min)
      endP = zeroP
    }
  }

  // SVG Arc Calculations
  const radius = 20
  const circumference = 2 * Math.PI * radius
  const arcLength = circumference * 0.75 // 270 degree sweep
  
  // To render the stroke exactly where we want:
  const visibleLength = Math.max(0, (endP - startP) * arcLength)
  const offset = startP * arcLength
  
  const isZero = visibleLength === 0
  const strokeColor = isZero ? "transparent" : "var(--accent-cyan)"
  const hoverStrokeColor = isZero ? "transparent" : "var(--accent-cyan-hover)"

  return (
    <div className="flex flex-col items-center justify-center gap-1.5 select-none" onDoubleClick={onDoubleClick}>
      <label className="text-[10px] font-bold text-[var(--text-muted)] tracking-widest uppercase mb-1">
        {label}
      </label>
      
      <div 
        ref={containerRef}
        className="relative w-14 h-14 cursor-ns-resize group"
        onPointerDown={handlePointerDown}
      >
        <svg 
          className="w-full h-full transform rotate-[135deg]" 
          viewBox="0 0 48 48"
        >
          {/* Background track */}
          <circle
            cx="24"
            cy="24"
            r={radius}
            fill="none"
            stroke="var(--border-subtle)"
            strokeWidth="3.5"
            strokeDasharray={`${arcLength} ${circumference}`}
            strokeDashoffset="0"
            strokeLinecap="round"
          />
          {/* Foreground track */}
          <circle
            cx="24"
            cy="24"
            r={radius}
            fill="none"
            stroke={strokeColor}
            strokeWidth="3.5"
            strokeDasharray={`${visibleLength} ${circumference}`}
            strokeDashoffset={-offset}
            strokeLinecap="round"
            style={{ transition: 'stroke 0.1s ease-out' }}
            className={`transition-all duration-75 ${!isZero && 'group-hover:stroke-[var(--accent-cyan-hover)]'}`}
          />
        </svg>
        
        {/* Center Text */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="font-mono text-[10px] font-medium text-white tracking-tighter">
            {value > 0 && max > 0 && min < 0 ? '+' : ''}{value.toFixed(step < 1 ? 2 : 0)}
          </span>
        </div>
      </div>
      
      {unit && (
        <span className="text-[9px] font-bold text-[var(--accent-cyan)] uppercase tracking-wider mt-0.5">
          {unit}
        </span>
      )}
    </div>
  )
}
