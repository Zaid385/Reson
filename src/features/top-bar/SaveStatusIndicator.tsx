import React from 'react'
import { useStore } from '@state/store'

export const SaveStatusIndicator: React.FC = () => {
  const saveStatus = useStore(state => state.saveStatus)

  return (
    <div className="ml-auto flex items-center text-xs">
      {saveStatus === 'saved' && <span className="text-text-muted">Saved</span>}
      {saveStatus === 'saving' && <span className="text-text-muted">Saving...</span>}
      {saveStatus === 'error' && <span className="text-[var(--accent-red)]">Save Error</span>}
    </div>
  )
}
