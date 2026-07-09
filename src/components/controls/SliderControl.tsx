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
        <div className="absolute inset-x-0 h-1.5 bg-[var(--bg-base)] rounded-full overflow-hidden border border-[var(--border-subtle)]">
          <div 
            className="absolute inset-y-0 left-0 bg-[var(--accent-cyan)] group-hover:bg-[var(--accent-cyan-hover)] transition-colors"
            style={{ width: `${percentage}%` }}
          />
        </div>
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
