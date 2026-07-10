import { BankSelector } from './BankSelector'
import { SaveStatusIndicator } from './SaveStatusIndicator'
import { MasterVolumeControl } from './MasterVolumeControl'
import { ThemeToggle } from '@components/controls'
import { Settings2, FolderOpen } from 'lucide-react'
import { useStore } from '@state/store'

export function TopBar() {
  const openModal = useStore(state => state.openModal)
  const activeProject = useStore(state => state.activeProject)

  return (
    <header className="h-[56px] flex items-center justify-between px-4 bg-[var(--bg-surface)] border-b border-[var(--border-subtle)] shrink-0">
      <div className="flex items-center gap-6">
        <h1 className="text-2xl font-semibold tracking-wide text-[var(--accent-cyan)]">RESON</h1>
        <BankSelector />
        <SaveStatusIndicator />
      </div>
      <div className="flex items-center h-full gap-4">
        <ThemeToggle />
        <div className="h-6 w-px bg-[var(--border-subtle)]" />
        <MasterVolumeControl />
        <div className="h-6 w-px bg-[var(--border-subtle)]" />
        <button 
          className="text-[var(--text-muted)] hover:text-white transition-colors flex items-center gap-2 text-sm font-medium p-2 rounded hover:bg-[var(--bg-surface-raised)]"
          aria-label="Projects"
          onClick={() => openModal('projects')}
        >
          <FolderOpen className="w-4 h-4" />
          <span className="hidden sm:inline max-w-[120px] truncate">{activeProject?.name || 'Projects'}</span>
        </button>
        <button 
          className="text-[var(--text-muted)] hover:text-white transition-colors p-2 rounded hover:bg-[var(--bg-surface-raised)]"
          aria-label="Settings"
          onClick={() => openModal('settings')}
        >
          <Settings2 className="w-5 h-5" />
        </button>
      </div>
    </header>
  )
}
