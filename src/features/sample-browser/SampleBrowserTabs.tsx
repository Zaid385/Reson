import React from 'react'

export type TabType = 'built-in' | 'user'

interface Props {
  activeTab: TabType
  setTab: (tab: TabType) => void
}

export const SampleBrowserTabs: React.FC<Props> = ({ activeTab, setTab }) => {
  return (
    <div className="flex border-b border-border-subtle">
      <button 
        className={`flex-1 py-3 text-xs font-semibold uppercase tracking-wider transition-colors ${activeTab === 'built-in' ? 'text-[var(--accent-cyan)] border-b-2 border-[var(--accent-cyan)]' : 'text-text-muted hover:text-white'}`}
        onClick={() => setTab('built-in')}
      >
        Built-In
      </button>
      <button 
        className={`flex-1 py-3 text-xs font-semibold uppercase tracking-wider transition-colors ${activeTab === 'user' ? 'text-[var(--accent-cyan)] border-b-2 border-[var(--accent-cyan)]' : 'text-text-muted hover:text-white'}`}
        onClick={() => setTab('user')}
      >
        User
      </button>
    </div>
  )
}
