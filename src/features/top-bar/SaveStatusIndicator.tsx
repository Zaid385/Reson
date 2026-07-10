import React from 'react'
import { useStore } from '@state/store'

export const SaveStatusIndicator: React.FC = () => {
  const saveStatus = useStore(state => state.saveStatus)

  return (
    <div className="ml-auto flex items-center text-[11px] font-medium tracking-wide gap-1.5 h-full px-2 text-[var(--text-muted)] transition-opacity duration-300">
      {saveStatus === 'saved' && (
        <>
          <span className="w-1 h-1 rounded-full bg-[var(--text-disabled)] transition-colors" />
          Saved
        </>
      )}
      {saveStatus === 'saving' && (
        <>
          <span className="w-1 h-1 rounded-full bg-[var(--accent-cyan)] shadow-[0_0_5px_rgba(0,240,255,0.5)] animate-pulse transition-colors" />
          Saving
        </>
      )}
      {saveStatus === 'error' && (
        <>
          <span className="w-1 h-1 rounded-full bg-[var(--accent-danger)] shadow-[0_0_5px_rgba(211,47,47,0.5)] transition-colors" />
          <span className="text-[var(--accent-danger)]">Save Error</span>
        </>
      )}
    </div>
  )
}
