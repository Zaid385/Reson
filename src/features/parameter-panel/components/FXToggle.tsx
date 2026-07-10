import React from 'react'

interface FXToggleProps {
  enabled: boolean
  onChange: (enabled: boolean) => void
}

export const FXToggle: React.FC<FXToggleProps> = ({ enabled, onChange }) => {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation()
        onChange(!enabled)
      }}
      className={`relative w-4 h-4 rounded-full border-2 transition-colors flex items-center justify-center ${
        enabled ? 'border-[var(--accent-cyan)] bg-[var(--accent-cyan)]' : 'border-[var(--text-muted)] bg-transparent hover:border-white'
      }`}
      title={enabled ? 'Turn Off' : 'Turn On'}
    >
      <div className={`w-1.5 h-1.5 rounded-full transition-colors ${enabled ? 'bg-black' : 'bg-transparent'}`} />
    </button>
  )
}
