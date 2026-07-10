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
  label, value, min, max, step = 1, unit = '', onChange, onDoubleClick
}) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [startY, setStartY] = useState(0)
  const [startValue, setStartValue] = useState(0)

  const handlePointerDown = (e: React.PointerEvent) => {
    // e.preventDefault()
    setIsDragging(true)
    setStartY(e.clientY)
    setStartValue(value)
  }

  const handlePointerMove = useCallback((e: PointerEvent) => {
    if (!isDragging) return
    
    // Calculate total vertical distance dragged
    const deltaY = startY - e.clientY
    
    // 150px drag = full range
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

  const percentage = (value - min) / (max - min)
  const angle = -135 + (percentage * 270) // -135deg to +135deg

  return (
    <div className="flex flex-col items-center gap-2 select-none" onDoubleClick={onDoubleClick}>
      <div 
        ref={containerRef}
        className="relative w-12 h-12 rounded-full bg-[var(--bg-base)] border border-[var(--border-subtle)] cursor-ns-resize shadow-inner group"
        onPointerDown={handlePointerDown}
      >
        {/* Knob Indicator */}
        <div 
          className="absolute inset-0 transition-transform"
          style={{ transform: `rotate(${angle}deg)` }}
        >
          <div className="absolute top-1 left-1/2 -translate-x-1/2 w-1 h-3 rounded-full bg-[var(--accent-cyan)] group-hover:bg-[var(--accent-cyan-hover)] shadow-[0_0_5px_rgba(0,240,255,0.5)]" />
        </div>
      </div>
      <div className="flex flex-col items-center">
        <label className="text-[10px] font-bold text-[var(--text-muted)] tracking-wider uppercase">
          {label}
        </label>
        <span className="font-mono text-xs text-[var(--text-secondary)]">
          {value.toFixed(step < 1 ? 2 : 0)}{unit}
        </span>
      </div>
    </div>
  )
}
