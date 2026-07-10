import React from 'react'

interface FXSelectProps<T extends string> {
  label: string
  value: T
  options: { label: string, value: T }[]
  onChange: (value: T) => void
}

export function FXSelect<T extends string>({ label, value, options, onChange }: FXSelectProps<T>) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[10px] font-bold text-[var(--text-muted)] tracking-widest uppercase mb-1">
        {label}
      </label>
      <select 
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
        className="w-full bg-black/40 border border-[var(--border-subtle)] rounded text-xs text-white p-1.5 outline-none focus:border-[var(--accent-cyan)] transition-colors appearance-none cursor-pointer"
      >
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  )
}
