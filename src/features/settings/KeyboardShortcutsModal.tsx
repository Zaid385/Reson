import React, { useEffect } from 'react'
import { useStore } from '@state/store'
import { X, Keyboard } from 'lucide-react'

export const KeyboardShortcutsModal: React.FC = () => {
  const activeModal = useStore(state => state.activeModal)
  const closeModal = useStore(state => state.closeModal)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Toggle shortcuts modal on `?` or `Shift + ?`
      if (e.key === '?' && (e.target as HTMLElement).tagName !== 'INPUT') {
        if (useStore.getState().activeModal === 'shortcuts') {
          useStore.getState().closeModal()
        } else {
          useStore.getState().openModal('shortcuts')
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  if (activeModal !== 'shortcuts') return null

  const shortcuts = [
    { key: '1-8, Q-I, A-K, Z-,', desc: 'Trigger mapped pad' },
    { key: 'Cmd/Ctrl + 1-4', desc: 'Switch Bank A-D' },
    { key: 'M', desc: 'Toggle Mute on selected pad' },
    { key: 'S', desc: 'Toggle Solo on selected pad' },
    { key: 'Backspace/Del', desc: 'Clear selected pad' },
    { key: 'Space', desc: 'Play/pause preview in Editor' },
    { key: 'Escape', desc: 'Close modals/panels' },
    { key: '?', desc: 'Show this help overlay' }
  ]

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={closeModal}
      />
      
      <div 
        className="relative bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl shadow-2xl flex flex-col overflow-hidden w-full max-w-lg"
        role="dialog"
        aria-modal="true"
        aria-labelledby="shortcuts-title"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-subtle)] bg-[var(--bg-elevated)]">
          <div className="flex items-center gap-2">
            <Keyboard className="w-5 h-5 text-[var(--accent-cyan)]" />
            <h2 id="shortcuts-title" className="text-lg font-semibold tracking-wide">Keyboard Shortcuts</h2>
          </div>
          <button 
            className="p-2 hover:bg-[var(--bg-surface-raised)] rounded-full text-[var(--text-muted)] hover:text-white transition-colors"
            onClick={closeModal}
            aria-label="Close shortcuts"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <table className="w-full">
            <tbody>
              {shortcuts.map((sc, i) => (
                <tr key={i} className="border-b border-[var(--border-subtle)] last:border-0">
                  <td className="py-3 pr-4">
                    <kbd className="px-2 py-1 bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded text-xs font-mono text-[var(--text-primary)]">
                      {sc.key}
                    </kbd>
                  </td>
                  <td className="py-3 text-sm text-[var(--text-muted)]">
                    {sc.desc}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
