import React from 'react'

export type TabType = 'built-in' | 'user'

interface Props {
  activeTab: TabType
  setTab: (tab: TabType) => void
}

export const SampleBrowserTabs: React.FC<Props> = ({ activeTab, setTab }) => {
  return (
    <div className="flex bg-[var(--bg-base)] p-1.5 mx-2 mt-2 rounded-lg border border-[var(--border-subtle)]/30 shadow-[inset_0_1px_4px_rgba(0,0,0,0.3)] gap-1">
      <button 
        className={`flex-1 py-2 text-xs font-semibold capitalize tracking-wider transition-all duration-200 rounded-md ${activeTab === 'built-in' ? 'text-[var(--accent-cyan)] bg-[var(--bg-surface-raised)] shadow-[0_1px_3px_rgba(0,0,0,0.4),0_1px_0_rgba(255,255,255,0.05)] border border-[var(--border-subtle)]/50' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)] border border-transparent'}`}
        onClick={() => setTab('built-in')}
      >
        Built-In
      </button>
      <button 
        className={`flex-1 py-2 text-xs font-semibold capitalize tracking-wider transition-all duration-200 rounded-md ${activeTab === 'user' ? 'text-[var(--accent-cyan)] bg-[var(--bg-surface-raised)] shadow-[0_1px_3px_rgba(0,0,0,0.4),0_1px_0_rgba(255,255,255,0.05)] border border-[var(--border-subtle)]/50' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)] border border-transparent'}`}
        onClick={() => setTab('user')}
      >
        User
      </button>
    </div>
  )
}
