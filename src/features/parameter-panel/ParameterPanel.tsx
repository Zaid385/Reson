import React from 'react'
import { useStore } from '@state/store'
import { SliderControl, KnobControl } from '@components/controls'
import { Power, Volume2, MicOff, Settings2, Scissors } from 'lucide-react'
import { ResponsiveDrawer } from '@components/layout/ResponsiveDrawer'
import { effectRegistry } from './effects/effectRegistry'

const COLORS = [
  '#00F0FF', '#C3F400', '#FF007A', '#FFB020', 
  '#A0A0A0', '#93000A', '#004D40', '#001F3F'
]

export function ParameterPanel() {
  const selectedPadId = useStore(state => state.selectedPadId)
  const isParamPanelOpen = useStore(state => state.isParamPanelOpen)
  const padData = useStore(state => selectedPadId ? state.pads[selectedPadId] : null)
  const updatePad = useStore(state => state.updatePad)
  const toggleParamPanel = useStore(state => state.toggleParamPanel)
  const openModal = useStore(state => state.openModal)

  if (!isParamPanelOpen) {
    return (
      <aside className="hidden lg:flex w-12 bg-[var(--bg-surface)] border-l border-[var(--border-subtle)] flex-col items-center py-4 shrink-0 cursor-pointer hover:bg-[var(--bg-surface-raised)] transition-colors" onClick={toggleParamPanel}>
        <Settings2 className="w-5 h-5 text-[var(--text-muted)]" />
      </aside>
    )
  }

  return (
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
          <div className="p-4 flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <input 
                type="text"
                value={padData.displayName}
                onChange={(e) => updatePad(padData.id, { displayName: e.target.value })}
                className="bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded-md px-2 py-1 text-sm font-mono w-full focus:border-[var(--accent-cyan)] outline-none text-[var(--text-primary)]"
                placeholder="Pad Name"
                disabled={!padData.assetId}
              />
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {COLORS.map(c => (
                <button 
                  key={c}
                  className={`w-6 h-6 rounded-full border-2 transition-transform ${padData.color === c ? 'scale-110 border-white' : 'border-transparent hover:scale-110'}`}
                  style={{ backgroundColor: c }}
                  onClick={() => updatePad(padData.id, { color: c })}
                />
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="p-4 flex gap-2">
            <button 
              className={`flex-1 py-1.5 rounded text-xs font-bold uppercase flex items-center justify-center gap-1 transition-colors ${padData.mute ? 'bg-[var(--accent-danger)] text-white' : 'bg-[var(--bg-base)] text-[var(--text-muted)] hover:bg-[var(--bg-surface-raised)]'}`}
              onClick={() => updatePad(padData.id, { mute: !padData.mute })}
            >
              <MicOff className="w-3 h-3" /> Mute
            </button>
            <button 
              className={`flex-1 py-1.5 rounded text-xs font-bold uppercase flex items-center justify-center gap-1 transition-colors ${padData.solo ? 'bg-[var(--accent-amber)] text-black' : 'bg-[var(--bg-base)] text-[var(--text-muted)] hover:bg-[var(--bg-surface-raised)]'}`}
              onClick={() => updatePad(padData.id, { solo: !padData.solo })}
            >
              <Volume2 className="w-3 h-3" /> Solo
            </button>
            <button 
              className="flex-1 py-1.5 rounded text-xs font-bold uppercase flex items-center justify-center gap-1 bg-[var(--bg-base)] text-[var(--text-muted)] hover:bg-[var(--bg-surface-raised)] hover:text-white transition-colors disabled:opacity-50"
              disabled={!padData.assetId}
              onClick={() => openModal('sampleEditor', padData.id)}
            >
              <Scissors className="w-3 h-3" /> Edit
            </button>
          </div>

          {/* Play Mode & Pitch */}
          <div className="p-4 flex flex-col gap-6 bg-black/20">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-[var(--text-muted)] tracking-wider uppercase">Play Mode</span>
              <div className="flex bg-[var(--bg-base)] p-1 rounded-md border border-[var(--border-subtle)]">
                <button 
                  className={`px-3 py-1 text-xs font-medium rounded-sm transition-colors ${padData.playMode === 'oneshot' ? 'bg-[var(--bg-surface-raised)] text-white shadow-sm' : 'text-[var(--text-muted)] hover:text-white'}`}
                  onClick={() => updatePad(padData.id, { playMode: 'oneshot' })}
                >
                  One-Shot
                </button>
                <button 
                  className={`px-3 py-1 text-xs font-medium rounded-sm transition-colors ${padData.playMode === 'gate' ? 'bg-[var(--bg-surface-raised)] text-white shadow-sm' : 'text-[var(--text-muted)] hover:text-white'}`}
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
          <div className="p-4 flex flex-col gap-6">
            <SliderControl 
              label="Volume" 
              value={padData.volume} 
              onChange={(v) => updatePad(padData.id, { volume: v })} 
              min={0} max={1} step={0.01} 
              onDoubleClick={() => updatePad(padData.id, { volume: 0.8 })}
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
  )
}
