import React, { useRef } from 'react'
import { ChevronUp, ChevronDown } from 'lucide-react'

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
  const handleIncrement = () => {
    let next = value + step
    if (next > max) next = max
    const precision = step.toString().split('.')[1]?.length || 0
    onChange(parseFloat(next.toFixed(precision)))
  }

  const handleDecrement = () => {
    let next = value - step
    if (next < min) next = min
    const precision = step.toString().split('.')[1]?.length || 0
    onChange(parseFloat(next.toFixed(precision)))
  }

  return (
    <div className="flex flex-col gap-1">
      <label className="text-[10px] uppercase font-bold text-[var(--text-muted)] tracking-wider">
        {label}
      </label>
      <div className="flex items-center w-[120px] bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded-md overflow-hidden focus-within:border-[var(--accent-cyan)] transition-colors">
        <input 
          type="number"
          value={value}
          onChange={(e) => {
            const v = parseFloat(e.target.value)
            if (!isNaN(v)) onChange(v)
          }}
          min={min}
          max={max}
          step={step}
          className="flex-1 w-full min-w-0 bg-transparent text-[var(--text-primary)] text-sm px-2 py-1 outline-none text-right font-mono [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        />
        {unit && <span className="text-xs text-[var(--text-muted)] pr-2 select-none">{unit}</span>}
        <div className="flex flex-col border-l border-[var(--border-subtle)] bg-[var(--bg-surface)]">
          <button 
            onClick={handleIncrement}
            className="p-0.5 text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-raised)] transition-colors flex items-center justify-center"
            tabIndex={-1}
          >
            <ChevronUp className="w-3 h-3" />
          </button>
          <div className="h-px bg-[var(--border-subtle)]" />
          <button 
            onClick={handleDecrement}
            className="p-0.5 text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-raised)] transition-colors flex items-center justify-center"
            tabIndex={-1}
          >
            <ChevronDown className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  )
}
