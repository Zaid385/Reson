import React, { useRef, useState } from 'react'
import { useStore } from '@state/store'
import { X, Save, Trash2, SlidersHorizontal, Keyboard, Download, Upload } from 'lucide-react'
import { projectIoService } from '@domain/project/ProjectIoService'
import { showConfirmDialog, showAlertDialog } from '@utils/dialog'
import { db } from '@persistence/db'

export const SettingsModal: React.FC = () => {
  const isOpen = useStore(state => state.activeModal === 'settings')
  const closeModal = useStore(state => state.closeModal)
  const settings = useStore(state => state.settings)
  const updateSettings = useStore(state => state.updateSettings)
  const project = useStore(state => state.activeProject)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [exportPromptOpen, setExportPromptOpen] = useState(false)
  const [exportName, setExportName] = useState('')

  if (!isOpen || !settings) return null

  const handleExportClick = () => {
    const defaultName = project ? `${project.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_reson_kit` : 'reson_kit'
    setExportName(defaultName)
    setExportPromptOpen(true)
  }

  const handleConfirmExport = async () => {
    if (!exportName.trim()) return
    try {
      await projectIoService.exportProject(exportName.trim())
      setExportPromptOpen(false)
    } catch (e) {
      console.error('Export failed', e)
      showAlertDialog({ title: 'Export Failed', message: 'Failed to export project' })
    }
  }

  const handleImportClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      const success = await projectIoService.importProject(file)
      if (!success) {
        showAlertDialog({ title: 'Import Failed', message: 'Failed to import project file. Invalid format.' })
      }
    } catch (error) {
      console.error('Import failed', error)
      showAlertDialog({ title: 'Import Failed', message: 'Failed to import project' })
    }
    
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      {exportPromptOpen ? (
        <div className="w-full max-w-sm bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-xl shadow-2xl flex flex-col p-6 space-y-4">
          <h3 className="text-lg font-bold text-white">Export Project</h3>
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Project Name</label>
            <input 
              type="text" 
              className="w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded px-3 py-2 text-white focus:outline-none focus:border-[var(--accent-cyan)] transition-colors"
              value={exportName}
              onChange={e => setExportName(e.target.value)}
              autoFocus
              onKeyDown={e => {
                if (e.key === 'Enter') handleConfirmExport()
                if (e.key === 'Escape') setExportPromptOpen(false)
              }}
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button 
              className="px-4 py-2 rounded font-medium text-[var(--text-muted)] hover:text-white hover:bg-[var(--bg-surface-raised)] transition-colors"
              onClick={() => setExportPromptOpen(false)}
            >
              Cancel
            </button>
            <button 
              className="px-4 py-2 rounded font-medium bg-[var(--accent-cyan)] text-black hover:opacity-90 transition-opacity"
              onClick={handleConfirmExport}
            >
              Export
            </button>
          </div>
        </div>
      ) : (
        <div 
          className="w-full max-w-2xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-xl shadow-2xl flex flex-col max-h-[90vh]"
          role="dialog"
          aria-modal="true"
          aria-labelledby="settings-title"
        >
          <div className="flex items-center justify-between p-6 border-b border-[var(--border-subtle)]">
            <h2 id="settings-title" className="text-xl font-bold text-white flex items-center gap-2">
              <SlidersHorizontal className="w-5 h-5 text-[var(--accent-cyan)]" />
              Project Settings
            </h2>
            <button 
              className="p-2 hover:bg-[var(--bg-surface-raised)] rounded-lg text-[var(--text-muted)] hover:text-white transition-colors"
              onClick={closeModal}
              aria-label="Close settings"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-8">
            
            <section className="space-y-4">
              <h3 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Project Management</h3>
              <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-white font-medium">Export Project</div>
                    <div className="text-sm text-[var(--text-muted)]">Download this project and all its samples as a single file.</div>
                  </div>
                  <button 
                    onClick={handleExportClick}
                    className="flex items-center gap-2 px-4 py-2 bg-[var(--bg-surface-raised)] hover:bg-[var(--border-subtle)] text-white rounded-lg transition-colors"
                  >
                    <Upload className="w-4 h-4" /> Export
                  </button>
                </div>

                <div className="h-px bg-[var(--border-subtle)] w-full" />

                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-white font-medium">Import Project</div>
                    <div className="text-sm text-[var(--text-muted)]">Load a previously exported .json project file.</div>
                  </div>
                  <button 
                    onClick={handleImportClick}
                    className="flex items-center gap-2 px-4 py-2 bg-[var(--bg-surface-raised)] hover:bg-[var(--border-subtle)] text-white rounded-lg transition-colors"
                  >
                    <Download className="w-4 h-4" /> Import
                  </button>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept=".json"
                    onChange={handleFileChange} 
                  />
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <h3 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wider flex items-center gap-2">
                <Save className="w-4 h-4" /> Workflow
              </h3>
              
              <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg p-4 space-y-4">
                <label className="flex items-center justify-between cursor-pointer">
                  <div>
                    <div className="text-white font-medium">Confirm sample replacement</div>
                    <div className="text-sm text-[var(--text-muted)]">Show a confirmation prompt when dropping a sample onto an occupied pad.</div>
                  </div>
                  <div className={`w-11 h-6 rounded-full transition-colors relative ${settings.confirmBeforeReplace ? 'bg-[var(--accent-cyan)]' : 'bg-[var(--bg-surface-raised)]'}`}>
                    <div className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${settings.confirmBeforeReplace ? 'translate-x-5' : 'translate-x-0'}`} />
                  </div>
                  <input 
                    type="checkbox" 
                    className="sr-only" 
                    checked={settings.confirmBeforeReplace}
                    onChange={(e) => updateSettings({ confirmBeforeReplace: e.target.checked })}
                  />
                </label>
              </div>
            </section>

          <section className="space-y-4">
            <h3 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wider flex items-center gap-2">
              <Keyboard className="w-4 h-4" /> Accessibility
            </h3>
            
            <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg p-4 space-y-4">
              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <div className="text-white font-medium">Use List View (Screen Reader Friendly)</div>
                  <div className="text-sm text-[var(--text-muted)]">Replaces the 2D pad grid with a linear list structure optimized for screen readers and keyboard navigation.</div>
                </div>
                <div className={`w-11 h-6 rounded-full transition-colors relative ${settings.useListView ? 'bg-[var(--accent-cyan)]' : 'bg-[var(--bg-surface-raised)]'}`}>
                  <div className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${settings.useListView ? 'translate-x-5' : 'translate-x-0'}`} />
                </div>
                <input 
                  type="checkbox" 
                  className="sr-only" 
                  checked={settings.useListView ?? false}
                  onChange={(e) => updateSettings({ useListView: e.target.checked })}
                />
              </label>
            </div>
          </section>

          <section className="space-y-4">
            <h3 className="text-sm font-semibold text-[var(--accent-danger)] uppercase tracking-wider flex items-center gap-2">
              <Trash2 className="w-4 h-4" /> Danger Zone
            </h3>
            
            <div className="bg-[var(--bg-surface)] border border-[var(--accent-danger)]/20 rounded-lg p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-white font-medium">Reset App</div>
                  <div className="text-sm text-[var(--text-muted)]">Clear all projects, pads, and custom samples. This cannot be undone.</div>
                </div>
                <button 
                  className="px-4 py-2 bg-[var(--accent-danger)]/10 text-[var(--accent-danger)] hover:bg-[var(--accent-danger)] hover:text-white rounded-lg transition-colors font-medium"
                  onClick={async () => {
                    const confirmed = await showConfirmDialog({
                      title: 'Reset App',
                      message: 'Are you absolutely sure? This will delete ALL your projects, samples, and data across the entire app.',
                      confirmText: 'Reset App',
                      isDanger: true
                    })
                    if (confirmed) {
                      await db.delete()
                      window.location.reload()
                    }
                  }}
                >
                  Reset App
                </button>
              </div>
            </div>
          </section>
          
        </div>
        </div>
      )}
    </div>
  )
}
