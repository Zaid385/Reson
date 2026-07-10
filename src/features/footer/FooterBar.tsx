 
import { useEffect, useState } from 'react'
import { useStore } from '@state/store'
import { useStatusStore } from '@state/statusStore'
import { motion, AnimatePresence } from 'framer-motion'
import { KeyboardLabels } from '@state/keyMap'


export function FooterBar() {
  const appStatus = useStatusStore(state => state.appStatus)
  const contextMessage = useStatusStore(state => state.contextMessage)
  
  const project = useStore(state => state.activeProject)
  const activeBankId = useStore(state => state.activeBankId)
  const banks = useStore(state => state.banks)
  const selectedPadId = useStore(state => state.selectedPadId)
  const pads = useStore(state => state.pads)
  const keyboardLayout = useStore(state => state.settings?.keyboardLayout || 'qwerty')
  const activeVoices = useStore(state => state.activeVoices)
  const saveStatus = useStore(state => state.saveStatus)
  
  const activeBank = activeBankId ? banks.find(b => b.id === activeBankId) : null
  const activePad = selectedPadId ? pads[selectedPadId] : null
  
  const [dbSize, setDbSize] = useState<string | null>(null)

  // We can calculate storage usage (approximation)
  useEffect(() => {
    const fetchDbSize = async () => {
      try {
        if (navigator.storage && navigator.storage.estimate) {
          const estimate = await navigator.storage.estimate()
          if (estimate.usage) {
            setDbSize((estimate.usage / (1024 * 1024)).toFixed(1))
          }
        }
      } catch (e) {
        console.error('Storage estimate failed', e)
      }
    }
    fetchDbSize()
    
    // Poll every 30 seconds
    const interval = setInterval(fetchDbSize, 30000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (saveStatus === 'saving') {
      useStatusStore.getState().setAppStatus('Saving...')
    } else if (saveStatus === 'saved') {
      useStatusStore.getState().setAppStatus('Autosaved ✓')
      const timer = setTimeout(() => {
        if (useStatusStore.getState().appStatus === 'Autosaved ✓') {
          useStatusStore.getState().setAppStatus('Ready')
        }
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [saveStatus])

  // Calculate pad shortcut label
  const keyMapLabels = KeyboardLabels[keyboardLayout] || KeyboardLabels.qwerty
  const padLabel = activePad ? keyMapLabels[activePad.slotIndex] : ''
  
  const messageToShow = contextMessage || appStatus

  return (
    <footer className="h-[40px] flex items-center justify-between px-4 bg-[var(--bg-surface)] border-t border-[var(--border-subtle)] shrink-0 text-[11px] font-mono text-[var(--text-secondary)] select-none">
      
      {/* LEFT SECTION - Project Info */}
      <div className="flex items-center gap-3 w-1/3 truncate">
        <span className="text-[var(--text-primary)] font-semibold truncate">
          {project?.name || 'Untitled'}
        </span>
        <span className="text-[var(--border-subtle)]">•</span>
        <span className="truncate">{activeBank?.name || 'Bank A'}</span>
        <span className="text-[var(--border-subtle)]">•</span>
        <span className="truncate">
          {activePad ? `Pad ${padLabel} (${activePad.displayName})` : 'No Pad Selected'}
        </span>
      </div>

      {/* CENTER SECTION - Status */}
      <div className="flex items-center justify-center w-1/3 relative h-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={messageToShow}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className={`absolute flex items-center gap-2 truncate ${contextMessage ? 'text-[var(--text-primary)]' : ''}`}
          >
            {appStatus.toLowerCase().includes('saving') && !contextMessage && (
              <svg className="animate-spin w-3 h-3 text-[var(--text-muted)]" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
            )}
            <span className="truncate">{messageToShow}</span>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* RIGHT SECTION - Performance */}
      <div className="flex items-center justify-end gap-5 w-1/3 text-[10px] text-[var(--text-muted)] tracking-wider">
        <div className="flex items-center gap-1.5" title="Active Voices / Max Voices">
          <span className="uppercase opacity-70">Voices</span>
          <span className="text-[var(--text-secondary)]">{activeVoices ?? 0} / 32</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="uppercase opacity-70">SR</span>
          <span className="text-[var(--text-secondary)]">48kHz</span>
        </div>
        {dbSize && (
          <div className="flex items-center gap-1.5" title="IndexedDB Usage">
            <span className="uppercase opacity-70">DB</span>
            <span className="text-[var(--text-secondary)]">{dbSize} MB</span>
          </div>
        )}
      </div>
    </footer>
  )
}
