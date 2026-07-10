import React from 'react'
import { useContextualHelp } from '@hooks/useContextualHelp'

export interface SliderControlProps {
  label: string
  value: number
  min: number
  max: number
  step?: number
  unit?: string
  onChange: (val: number) => void
  onDoubleClick?: () => void
  helpText?: string
}

export const SliderControl: React.FC<SliderControlProps> = ({
  label, value, min, max, step = 1, unit = '', onChange, onDoubleClick, helpText
}) => {
  const percentage = ((value - min) / (max - min)) * 100
  const helpProps = useContextualHelp(helpText || '')

  return (
    <div className="flex flex-col gap-1 w-full" onDoubleClick={onDoubleClick} {...(helpText ? helpProps : {})}>
      <div className="flex justify-between items-end mb-1">
        <label className="text-[10px] font-semibold text-[var(--text-secondary)] tracking-wider capitalize">
          {label}
        </label>
        <span className="font-mono text-[11px] font-medium text-[var(--text-primary)]">
          {value.toFixed(step < 1 ? 2 : 0)}{unit}
        </span>
      </div>
      <div className="relative h-6 flex items-center group cursor-pointer">
        <div className="absolute inset-x-0 h-1.5 bg-[var(--bg-base)] rounded-full shadow-[inset_0_1px_3px_rgba(0,0,0,0.6)] pointer-events-none overflow-hidden">
          <div 
            className="absolute inset-y-0 left-0 bg-[var(--accent-cyan)] opacity-90 group-hover:opacity-100 group-hover:shadow-[0_0_8px_rgba(0,240,255,0.4)] transition-all rounded-r-full"
            style={{ width: `${percentage}%` }}
          />
        </div>
        
        {/* Slider Thumb */}
        <div 
          className="absolute w-3.5 h-3.5 rounded-full bg-white shadow-[0_1px_4px_rgba(0,0,0,0.5),inset_0_-1px_1px_rgba(0,0,0,0.1)] group-hover:scale-110 transition-transform pointer-events-none z-10"
          style={{ left: `calc(${percentage}% - 7px)` }}
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
