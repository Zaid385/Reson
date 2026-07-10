import React from 'react'

export interface SliderControlProps {
  label: string
  value: number
  min: number
  max: number
  step?: number
  unit?: string
  onChange: (val: number) => void
  onDoubleClick?: () => void
}

export const SliderControl: React.FC<SliderControlProps> = ({
  label, value, min, max, step = 1, unit = '', onChange, onDoubleClick
}) => {
  const percentage = ((value - min) / (max - min)) * 100

  return (
    <div className="flex flex-col gap-1 w-full" onDoubleClick={onDoubleClick}>
      <div className="flex justify-between items-end">
        <label className="text-[10px] font-bold text-[var(--text-muted)] tracking-wider uppercase">
          {label}
        </label>
        <span className="font-mono text-xs text-[var(--text-secondary)]">
          {value.toFixed(step < 1 ? 2 : 0)}{unit}
        </span>
      </div>
      <div className="relative h-6 flex items-center group">
        <div className="absolute inset-x-0 h-1.5 bg-[var(--bg-base)] rounded-full border border-[var(--border-subtle)] pointer-events-none">
          <div 
            className="absolute inset-y-0 left-0 bg-[var(--accent-cyan)] group-hover:bg-[var(--accent-cyan-hover)] transition-colors rounded-l-full"
            style={{ width: `${percentage}%` }}
          />
        </div>
        
        {/* Slider Thumb */}
        <div 
          className="absolute w-3 h-3 rounded-full bg-white shadow-[0_0_5px_rgba(0,0,0,0.5)] border border-[var(--border-subtle)] group-hover:scale-125 transition-transform pointer-events-none"
          style={{ left: `calc(${percentage}% - 6px)` }}
        />

        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
      </div>
    </div>
  )
}
