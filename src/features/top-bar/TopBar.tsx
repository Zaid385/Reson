import { BankSelector } from './BankSelector'
import { SaveStatusIndicator } from './SaveStatusIndicator'
import { MasterVolumeControl } from './MasterVolumeControl'
import { Settings2, FilePlus } from 'lucide-react'
import { useStore } from '@state/store'
import { projectRepository } from '@persistence/repositories/ProjectRepository'
import { projectBootstrapService } from '@persistence/ProjectBootstrapService'

import { showConfirmDialog } from '@utils/dialog'

export function TopBar() {
  const openModal = useStore(state => state.openModal)

  const handleNewProject = async () => {
    const confirmed = await showConfirmDialog({
      title: 'Create New Kit',
      message: 'Create a new blank project? Make sure your current project is saved/exported if you want to keep it.',
      confirmText: 'Create New Kit',
      isDanger: true
    })
    
    if (confirmed) {
      const newProject = await projectBootstrapService.createAndSaveDefaultProject()
      await projectRepository.setActiveProject(newProject.id)
      window.location.reload()
    }
  }

  return (
    <header className="h-[56px] flex items-center justify-between px-4 bg-[var(--bg-surface)] border-b border-[var(--border-subtle)] shrink-0">
      <div className="flex items-center gap-6">
        <h1 className="text-2xl font-semibold tracking-wide text-[var(--accent-cyan)]">RESON</h1>
        <BankSelector />
        <SaveStatusIndicator />
      </div>
      <div className="flex items-center h-full gap-4">
        <MasterVolumeControl />
        <div className="h-6 w-px bg-[var(--border-subtle)]" />
        <button 
          className="text-[var(--text-muted)] hover:text-white transition-colors flex items-center gap-2 text-sm font-medium p-2 rounded hover:bg-[var(--bg-surface-raised)]"
          aria-label="New Project"
          onClick={handleNewProject}
        >
          <FilePlus className="w-4 h-4" />
          <span className="hidden sm:inline">New Kit</span>
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
