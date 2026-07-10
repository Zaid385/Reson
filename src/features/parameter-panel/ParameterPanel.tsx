 

import { useStore } from '@state/store'
import { SliderControl, KnobControl } from '@components/controls'
import { Volume2, MicOff, Settings2, Scissors } from 'lucide-react'
import { ResponsiveDrawer } from '@components/layout/ResponsiveDrawer'
import { effectRegistry } from './effects/effectRegistry'
import { useContextualHelp } from '@hooks/useContextualHelp'

const COLORS = [
  '#00F0FF', '#C3F400', '#FF007A', '#FFB020', 
  '#A0A0A0', '#93000A', '#004D40', '#001F3F'
]

import { motion, AnimatePresence } from 'framer-motion'

export function ParameterPanel() {
  const selectedPadId = useStore(state => state.selectedPadId)
  const isParamPanelOpen = useStore(state => state.isParamPanelOpen)
  const padData = useStore(state => selectedPadId ? state.pads[selectedPadId] : null)
  const updatePad = useStore(state => state.updatePad)
  const toggleParamPanel = useStore(state => state.toggleParamPanel)
  const openModal = useStore(state => state.openModal)
  
  const colorHelp = useContextualHelp("Changes the pad color.")

  return (
    <>
      <AnimatePresence>
        {!isParamPanelOpen && (
          <motion.aside 
            key="param-panel-collapsed"
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 48, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="hidden lg:flex bg-[var(--bg-surface)] border-l border-[var(--border-subtle)] flex-col items-center py-4 shrink-0 cursor-pointer hover:bg-[var(--bg-surface-raised)] transition-colors overflow-hidden" 
            onClick={toggleParamPanel}
          >
            <div className="w-12 flex justify-center shrink-0">
              <Settings2 className="w-5 h-5 text-[var(--text-muted)]" />
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
      <ResponsiveDrawer 
      isOpen={isParamPanelOpen} 
      onClose={toggleParamPanel} 
      side="right" 
      width="w-[320px]" 
      title="Parameters"
    >
      {!padData ? (
        <div className="p-8 text-center text-sm text-[var(--text-muted)] flex-1 flex items-center justify-center">
          Select a pad to edit parameters
        </div>
      ) : (
        <div className="flex flex-col flex-1 divide-y divide-[var(--border-subtle)]">
          
          {/* Header & Colors */}
          <div className="p-5 flex flex-col gap-5">
            <div className="flex items-center gap-2">
              <input 
                type="text"
                value={padData.displayName}
                onChange={(e) => updatePad(padData.id, { displayName: e.target.value })}
                className="bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded-md px-3 py-1.5 text-sm font-semibold tracking-wide w-full focus:border-[var(--accent-cyan)] outline-none text-[var(--text-primary)] shadow-[inset_0_1px_3px_rgba(0,0,0,0.2)] transition-colors"
                placeholder="Pad Name"
                disabled={!padData.assetId}
              />
            </div>
            <div className="flex items-center gap-2.5 flex-wrap" {...colorHelp}>
              {COLORS.map(c => (
                <button 
                  key={c}
                  className={`w-6 h-6 rounded-full border-2 transition-all duration-200 shadow-sm ${padData.color === c ? 'scale-110 border-white shadow-[0_0_8px_rgba(255,255,255,0.3)]' : 'border-transparent hover:scale-110 hover:shadow-[0_0_8px_rgba(255,255,255,0.1)] opacity-70 hover:opacity-100'}`}
                  style={{ backgroundColor: c }}
                  onClick={() => updatePad(padData.id, { color: c })}
                />
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="p-5 flex gap-2.5">
            <button 
              className={`flex-1 py-1.5 rounded-md text-[11px] font-bold capitalize flex items-center justify-center gap-1.5 transition-all shadow-sm ${padData.mute ? 'bg-[var(--accent-danger)] text-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)]' : 'bg-[var(--bg-base)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-raised)] border border-[var(--border-subtle)]/30'}`}
              onClick={() => updatePad(padData.id, { mute: !padData.mute })}
            >
              <MicOff className="w-3.5 h-3.5" /> Mute
            </button>
            <button 
              className={`flex-1 py-1.5 rounded-md text-[11px] font-bold capitalize flex items-center justify-center gap-1.5 transition-all shadow-sm ${padData.solo ? 'bg-[var(--accent-amber)] text-black shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)]' : 'bg-[var(--bg-base)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-raised)] border border-[var(--border-subtle)]/30'}`}
              onClick={() => updatePad(padData.id, { solo: !padData.solo })}
            >
              <Volume2 className="w-3.5 h-3.5" /> Solo
            </button>
            <button 
              className="flex-1 py-1.5 rounded-md text-[11px] font-bold capitalize flex items-center justify-center gap-1.5 bg-[var(--bg-base)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-raised)] border border-[var(--border-subtle)]/30 transition-all shadow-sm disabled:opacity-50"
              disabled={!padData.assetId}
              onClick={() => openModal('sampleEditor', padData.id)}
            >
              <Scissors className="w-3.5 h-3.5" /> Edit
            </button>
          </div>

          {/* Play Mode & Pitch */}
          <div className="p-5 flex flex-col gap-6 bg-[var(--bg-base)]/30 border-y border-[var(--border-subtle)]/50">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold text-[var(--text-secondary)] tracking-widest capitalize">Play Mode</span>
              <div className="flex bg-[var(--bg-base)] p-1 rounded-md border border-[var(--border-subtle)]/30 shadow-[inset_0_1px_3px_rgba(0,0,0,0.3)] gap-1">
                <button 
                  className={`px-3 py-1.5 text-[11px] font-semibold rounded-[4px] transition-all duration-200 ${padData.playMode === 'oneshot' ? 'bg-[var(--bg-surface-raised)] text-[var(--accent-cyan)] shadow-[0_1px_2px_rgba(0,0,0,0.4),0_1px_0_rgba(255,255,255,0.05)] border border-[var(--border-subtle)]/50' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)] border border-transparent'}`}
                  onClick={() => updatePad(padData.id, { playMode: 'oneshot' })}
                >
                  One-Shot
                </button>
                <button 
                  className={`px-3 py-1.5 text-[11px] font-semibold rounded-[4px] transition-all duration-200 ${padData.playMode === 'gate' ? 'bg-[var(--bg-surface-raised)] text-[var(--accent-cyan)] shadow-[0_1px_2px_rgba(0,0,0,0.4),0_1px_0_rgba(255,255,255,0.05)] border border-[var(--border-subtle)]/50' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)] border border-transparent'}`}
                  onClick={() => updatePad(padData.id, { playMode: 'gate' })}
                >
                  Gate
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <KnobControl 
                label="Pitch" 
                value={padData.pitchSemitones} 
                onChange={(v) => updatePad(padData.id, { pitchSemitones: v })} 
                min={-24} max={24} step={1} unit="st" 
                onDoubleClick={() => updatePad(padData.id, { pitchSemitones: 0 })}
                helpText="Adjusts playback pitch without changing the sample."
              />
              <KnobControl 
                label="Gain" 
                value={padData.gainDb} 
                onChange={(v) => updatePad(padData.id, { gainDb: v })} 
                min={-24} max={12} step={0.1} unit="dB" 
                onDoubleClick={() => updatePad(padData.id, { gainDb: 0 })}
              />
            </div>
          </div>

          {/* Volume & Pan */}
          <div className="p-5 flex flex-col gap-8 border-b border-[var(--border-subtle)]/50 pb-6">
            <SliderControl 
              label="Volume" 
              value={padData.volume} 
              onChange={(v) => updatePad(padData.id, { volume: v })} 
              min={0} max={1} step={0.01} 
              onDoubleClick={() => updatePad(padData.id, { volume: 0.8 })}
              helpText="Controls pad output level."
            />
            <SliderControl 
              label="Pan" 
              value={padData.pan} 
              onChange={(v) => updatePad(padData.id, { pan: v })} 
              min={-1} max={1} step={0.01} 
              onDoubleClick={() => updatePad(padData.id, { pan: 0 })}
            />
          </div>

          {/* FX Rack */}
          <div className="flex flex-col bg-[var(--bg-elevated)]">
            {effectRegistry.map((effect) => {
              const EffectComponent = effect.component
              return (
                <EffectComponent 
                  key={effect.id}
                  padData={padData} 
                  onChange={(updates) => updatePad(padData.id, updates)} 
                />
              )
            })}
          </div>

        </div>
      )}
    </ResponsiveDrawer>
    </>
  )
}
