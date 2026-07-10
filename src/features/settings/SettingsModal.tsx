import React, { useRef, useState } from 'react'
import { useStore } from '@state/store'
import { X, Save, Trash2, SlidersHorizontal, Keyboard, Download, Upload, ChevronDown } from 'lucide-react'
import { projectIoService } from '@domain/project/ProjectIoService'
import { showConfirmDialog, showAlertDialog } from '@utils/dialog'
import { db } from '@persistence/db'

import { motion, AnimatePresence } from 'framer-motion'

const GithubIcon = ({ className }: { className?: string }) => (
  <svg 
    className={className} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.02c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A4.8 4.8 0 0 0 8 18v4"></path>
  </svg>
)

export const SettingsModal: React.FC = () => {
  const isOpen = useStore(state => state.activeModal === 'settings')
  const closeModal = useStore(state => state.closeModal)
  const settings = useStore(state => state.settings)
  const updateSettings = useStore(state => state.updateSettings)
  const project = useStore(state => state.activeProject)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [exportPromptOpen, setExportPromptOpen] = useState(false)
  const [exportName, setExportName] = useState('')

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
    <AnimatePresence>
      {isOpen && settings && (
        <motion.div 
          key="settings-modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
        >
          {exportPromptOpen ? (
            <motion.div 
              key="export-prompt"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-sm bg-[var(--settings-modal-bg)] border border-[var(--border-subtle)] rounded-xl shadow-2xl flex flex-col p-6 space-y-4"
            >
          <h3 className="text-lg font-bold text-[var(--text-primary)]">Export Project</h3>
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Project Name</label>
            <input 
              type="text" 
              className="w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded px-3 py-2 text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-cyan)] transition-colors"
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
              className="px-4 py-2 rounded font-medium text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-raised)] transition-colors"
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
        </motion.div>
      ) : (
        <motion.div 
          key="settings-content"
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          className="w-full max-w-2xl bg-[var(--settings-modal-bg)] border border-[var(--border-subtle)] rounded-xl shadow-2xl flex flex-col max-h-[90vh]"
          role="dialog"
          aria-modal="true"
          aria-labelledby="settings-title"
        >
          <div className="flex items-center justify-between p-6 border-b border-[var(--border-subtle)]">
            <h2 id="settings-title" className="text-xl font-bold text-[var(--text-primary)] flex items-center gap-2">
              <SlidersHorizontal className="w-5 h-5 text-[var(--accent-cyan)]" />
              Project Settings
            </h2>
            <button 
              className="p-2 hover:bg-[var(--bg-surface-raised)] rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
              onClick={closeModal}
              aria-label="Close settings"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-8 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            
            <section className="space-y-4">
              <h3 className="text-sm font-semibold text-[var(--text-secondary)] capitalize tracking-wider">Project Management</h3>
              <div className="bg-[var(--settings-card-bg)] border border-[var(--border-subtle)] rounded-lg p-4 space-y-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="text-[var(--text-primary)] font-medium">Export Project</div>
                    <div className="text-sm text-[var(--text-muted)]">Download this project and all its samples as a single file.</div>
                  </div>
                  <button 
                    onClick={handleExportClick}
                    className="flex items-center gap-2 px-4 py-2 bg-[var(--bg-surface-raised)] hover:bg-[var(--border-subtle)] text-[var(--text-primary)] rounded-lg transition-colors shrink-0"
                  >
                    <Upload className="w-4 h-4" /> Export
                  </button>
                </div>

                <div className="h-px bg-[var(--border-subtle)] w-full" />

                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="text-[var(--text-primary)] font-medium">Import Project</div>
                    <div className="text-sm text-[var(--text-muted)]">Load a previously exported .json project file.</div>
                  </div>
                  <button 
                    onClick={handleImportClick}
                    className="flex items-center gap-2 px-4 py-2 bg-[var(--bg-surface-raised)] hover:bg-[var(--border-subtle)] text-[var(--text-primary)] rounded-lg transition-colors shrink-0"
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
              <h3 className="text-sm font-semibold text-[var(--text-secondary)] capitalize tracking-wider flex items-center gap-2">
                <Save className="w-4 h-4" /> Workflow
              </h3>
              
              <div className="bg-[var(--settings-card-bg)] border border-[var(--border-subtle)] rounded-lg p-4 space-y-4">
                <label className="flex items-center justify-between gap-4 cursor-pointer">
                  <div>
                    <div className="text-[var(--text-primary)] font-medium">Confirm sample replacement</div>
                    <div className="text-sm text-[var(--text-muted)]">Show a confirmation prompt when dropping a sample onto an occupied pad.</div>
                  </div>
                  <div className={`w-11 h-6 rounded-full transition-colors relative shrink-0 ${settings.confirmBeforeReplace ? 'bg-[var(--accent-cyan)]' : 'bg-[var(--bg-surface-raised)]'}`}>
                    <div className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${settings.confirmBeforeReplace ? 'translate-x-5' : 'translate-x-0'}`} />
                  </div>
                  <input 
                    type="checkbox" 
                    className="sr-only" 
                    checked={settings.confirmBeforeReplace}
                    onChange={(e) => updateSettings({ confirmBeforeReplace: e.target.checked })}
                  />
                </label>

                <div className="h-px bg-[var(--border-subtle)] w-full" />

                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="text-[var(--text-primary)] font-medium">Keyboard Layout</div>
                    <div className="text-sm text-[var(--text-muted)]">Choose the layout that matches your physical keyboard to update pad labels.</div>
                  </div>
                  <div className="relative shrink-0">
                    <select 
                      className="appearance-none bg-[var(--bg-base)] border border-[var(--border-subtle)] text-[var(--text-primary)] rounded-lg pl-4 pr-10 py-2 text-sm focus:outline-none focus:border-[var(--accent-cyan)] transition-colors cursor-pointer w-full"
                      value={settings.keyboardLayout || 'qwerty'}
                      onChange={(e) => updateSettings({ keyboardLayout: e.target.value as 'qwerty' | 'azerty' | 'qwertz' })}
                    >
                      <option value="qwerty">QWERTY</option>
                      <option value="azerty">AZERTY</option>
                      <option value="qwertz">QWERTZ</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)] pointer-events-none" />
                  </div>
                </div>
              </div>
            </section>

          <section className="space-y-4">
            <h3 className="text-sm font-semibold text-[var(--text-secondary)] capitalize tracking-wider flex items-center gap-2">
              <Keyboard className="w-4 h-4" /> Accessibility
            </h3>
            
            <div className="bg-[var(--settings-card-bg)] border border-[var(--border-subtle)] rounded-lg p-4 space-y-4">
              <label className="flex items-center justify-between gap-4 cursor-pointer">
                <div>
                  <div className="text-[var(--text-primary)] font-medium">Use List View (Screen Reader Friendly)</div>
                  <div className="text-sm text-[var(--text-muted)]">Replaces the 2D pad grid with a linear list structure optimized for screen readers and keyboard navigation.</div>
                </div>
                <div className={`w-11 h-6 rounded-full transition-colors relative shrink-0 ${settings.useListView ? 'bg-[var(--accent-cyan)]' : 'bg-[var(--bg-surface-raised)]'}`}>
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
            <h3 className="text-sm font-semibold text-[var(--text-secondary)] capitalize tracking-wider flex items-center gap-2">
              <GithubIcon className="w-4 h-4" /> About Developer
            </h3>
            
            <div className="bg-[var(--settings-card-bg)] border border-[var(--border-subtle)] rounded-lg p-4 space-y-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="text-[var(--text-primary)] font-medium text-lg">Developed by Zaid</div>
                  <div className="text-sm text-[var(--text-muted)]">Creator and owner of this application.</div>
                </div>
                <a 
                  href="https://github.com/Zaid385" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-[var(--bg-surface-raised)] hover:bg-[var(--border-subtle)] text-[var(--text-primary)] rounded-lg transition-colors shrink-0 font-medium"
                >
                  <GithubIcon className="w-4 h-4" /> GitHub Profile
                </a>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h3 className="text-sm font-semibold text-[var(--accent-danger)] capitalize tracking-wider flex items-center gap-2">
              <Trash2 className="w-4 h-4" /> Danger Zone
            </h3>
            
            <div className="bg-[var(--settings-card-bg)] border border-[var(--accent-danger)]/20 rounded-lg p-4 space-y-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="text-[var(--text-primary)] font-medium">Reset App</div>
                  <div className="text-sm text-[var(--text-muted)]">Clear all projects, pads, and custom samples. This cannot be undone.</div>
                </div>
                <button 
                  className="px-4 py-2 bg-[var(--accent-danger)]/10 text-[var(--accent-danger)] hover:bg-[var(--accent-danger)] hover:text-[var(--text-primary)] rounded-lg transition-colors font-medium shrink-0"
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
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
