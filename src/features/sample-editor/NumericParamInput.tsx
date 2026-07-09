import React from 'react'

interface Props {
  label: string
  value: number
  onChange: (v: number) => void
  min?: number
  max?: number
  step?: number
  unit?: string
}

export const NumericParamInput: React.FC<Props> = ({ label, value, onChange, min = -100, max = 100, step = 1, unit = '' }) => {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[10px] uppercase font-bold text-[var(--text-muted)] tracking-wider">
        {label}
      </label>
      <div className="flex items-center bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded-md overflow-hidden focus-within:border-[var(--accent-cyan)] transition-colors">
        <input 
          type="number"
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
          min={min}
          max={max}
          step={step}
          className="w-16 bg-transparent text-[var(--text-primary)] text-sm px-2 py-1 outline-none text-right font-mono"
        />
        {unit && <span className="text-xs text-[var(--text-muted)] pr-2 select-none">{unit}</span>}
      </div>
    </div>
  )
}
