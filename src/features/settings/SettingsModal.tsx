import React from 'react'
import { useStore } from '@state/store'
import { X, Save, Trash2, SlidersHorizontal, Keyboard, Moon, Info } from 'lucide-react'

export const SettingsModal: React.FC = () => {
  const activeModal = useStore(state => state.activeModal)
  const closeModal = useStore(state => state.closeModal)
  const settings = useStore(state => state.settings)
  const updateSettings = useStore(state => state.updateSettings)

  if (activeModal !== 'settings' || !settings) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={closeModal}
      />
      
      <div 
        className="relative bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl shadow-2xl flex flex-col overflow-hidden w-full max-w-2xl max-h-[85vh]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-title"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-subtle)] bg-[var(--bg-elevated)]">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-5 h-5 text-[var(--accent-cyan)]" />
            <h2 id="settings-title" className="text-lg font-semibold tracking-wide">Settings</h2>
          </div>
          <button 
            className="p-2 hover:bg-[var(--bg-surface-raised)] rounded-full text-[var(--text-muted)] hover:text-white transition-colors"
            onClick={closeModal}
            aria-label="Close settings"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          
          <section className="space-y-4">
            <h3 className="label-caps border-b border-[var(--border-subtle)] pb-2 flex items-center gap-2">
              <Keyboard className="w-4 h-4" /> Workflow & Accessibility
            </h3>
            
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Confirm Before Replace</div>
                <div className="text-sm text-[var(--text-muted)]">Ask for confirmation before dropping a new sample onto an occupied pad.</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={settings.confirmBeforeReplace}
                  onChange={(e) => updateSettings({ confirmBeforeReplace: e.target.checked })}
                />
                <div className="w-11 h-6 bg-[var(--bg-surface-raised)] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-[var(--text-secondary)] peer-checked:after:bg-black after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--accent-cyan)] outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--accent-cyan)]"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">List View (Accessibility)</div>
                <div className="text-sm text-[var(--text-muted)]">Render the pad grid as a linear, screen-reader friendly list.</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={settings.useListView ?? false}
                  onChange={(e) => updateSettings({ useListView: e.target.checked })}
                />
                <div className="w-11 h-6 bg-[var(--bg-surface-raised)] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-[var(--text-secondary)] peer-checked:after:bg-black after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--accent-cyan)] outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--accent-cyan)]"></div>
              </label>
            </div>
          </section>

          <section className="space-y-4">
            <h3 className="label-caps border-b border-[var(--border-subtle)] pb-2 flex items-center gap-2">
              <Save className="w-4 h-4" /> Storage & Data
            </h3>
            
            <div className="flex items-center justify-between p-4 bg-[var(--bg-surface-raised)] rounded-lg border border-[var(--border-subtle)]">
              <div>
                <div className="font-medium text-[var(--accent-danger)]">Danger Zone</div>
                <div className="text-sm text-[var(--text-muted)]">Clear all project data, pads, and user uploaded samples. This cannot be undone.</div>
              </div>
              <button 
                className="px-4 py-2 bg-[var(--accent-danger)] text-white rounded font-medium hover:bg-red-700 transition-colors flex items-center gap-2 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--accent-danger)]"
                onClick={() => {
                  if (window.confirm('Are you absolutely sure? This will delete all your samples and project data.')) {
                    // Logic to clear DB and reload
                    indexedDB.deleteDatabase('reson-db')
                    window.location.reload()
                  }
                }}
              >
                <Trash2 className="w-4 h-4" /> Reset App
              </button>
            </div>
          </section>
          
        </div>
      </div>
    </div>
  )
}
