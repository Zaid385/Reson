import React, { useState, useEffect } from 'react'
import { useStore } from '@state/store'
import { X } from 'lucide-react'
import { WaveformCanvas } from './WaveformCanvas'
import { EditorTransportControls } from './EditorTransportControls'
import { NumericParamInput } from './NumericParamInput'
import { useAsset } from '@hooks/useAsset'
import { AudioEngine } from '@audio-engine'
import { showConfirmDialog } from '@utils/dialog'

export const SampleEditorModal: React.FC = () => {
  const activeModal = useStore(state => state.activeModal)
  const selectedPadId = useStore(state => state.selectedPadId)
  const closeModal = useStore(state => state.closeModal)
  
  const isOpen = activeModal === 'sampleEditor' && selectedPadId
  const padData = useStore(state => isOpen && selectedPadId ? state.pads[selectedPadId] : null)
  const asset = useAsset(padData?.assetId || null)

  // Staged state
  const [startMarker, setStartMarker] = useState(0)
  const [endMarker, setEndMarker] = useState(1)
  const [loop, setLoop] = useState(false)
  const [reverse, setReverse] = useState(false)
  const [playMode, setPlayMode] = useState<'oneshot'|'gate'>('oneshot')
  const [pitch, setPitch] = useState(0)
  const [gain, setGain] = useState(0)
  const [fadeIn, setFadeIn] = useState(0)
  const [fadeOut, setFadeOut] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)

  // Sync initial state when modal opens
  useEffect(() => {
    if (isOpen && padData) {
      setStartMarker(padData.startMarker)
      setEndMarker(padData.endMarker)
      setLoop(padData.loop)
      setReverse(padData.reverse)
      setPlayMode(padData.playMode)
      setPitch(padData.pitchSemitones)
      setGain(padData.gainDb)
      setFadeIn(padData.fadeInMs)
      setFadeOut(padData.fadeOutMs)
    } else {
      AudioEngine.previewStop()
      setIsPlaying(false)
    }
  }, [isOpen, padData])

  const audioUrl = React.useMemo(() => {
    if (!asset) return undefined
    if (asset.sourceType === 'built-in') {
      return `/samples/${asset.id}.wav`
    } else if (asset.audioData) {
      return URL.createObjectURL(asset.audioData)
    }
    return undefined
  }, [asset])

  if (!isOpen) return null

  if (!padData || !asset) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
        <div className="w-full max-w-sm bg-[var(--bg-surface)] rounded-xl border border-[var(--border-subtle)] p-6 text-center">
          <h2 className="text-lg font-semibold text-white mb-4">Loading Asset...</h2>
          <button onClick={closeModal} className="px-4 py-2 bg-[var(--bg-elevated)] rounded-md hover:bg-[var(--bg-surface-raised)] transition-colors">
            Cancel
          </button>
        </div>
      </div>
    )
  }

  const handlePreviewToggle = () => {
    if (isPlaying) {
      AudioEngine.previewStop()
      setIsPlaying(false)
    } else {
      AudioEngine.previewPlay(asset.id, {
        startMarker,
        endMarker,
        reverse,
        loop,
        pitchSemitones: pitch,
        gainDb: gain,
        fadeInMs: fadeIn,
        fadeOutMs: fadeOut
      })
      setIsPlaying(true)
    }
  }

  const handleNormalize = () => {
    if (!asset.waveformPeaksHigh) return
    const maxPeak = Math.max(...asset.waveformPeaksHigh)
    if (maxPeak > 0) {
      // linear to db offset
      const targetGain = 20 * Math.log10(1 / maxPeak)
      setGain(parseFloat(targetGain.toFixed(1)))
    }
  }

  const handleSave = () => {
    useStore.getState().updatePad(selectedPadId!, {
      startMarker,
      endMarker,
      loop,
      reverse,
      playMode,
      pitchSemitones: pitch,
      gainDb: gain,
      fadeInMs: fadeIn,
      fadeOutMs: fadeOut
    })
    AudioEngine.previewStop()
    setIsPlaying(false)
    closeModal()
  }

  const handleCancel = async () => {
    const hasChanged = 
      startMarker !== padData.startMarker ||
      endMarker !== padData.endMarker ||
      loop !== padData.loop ||
      reverse !== padData.reverse ||
      playMode !== padData.playMode ||
      pitch !== padData.pitchSemitones ||
      gain !== padData.gainDb ||
      fadeIn !== padData.fadeInMs ||
      fadeOut !== padData.fadeOutMs

    if (hasChanged) {
      const confirmBeforeReplace = useStore.getState().settings?.confirmBeforeReplace ?? true
      if (confirmBeforeReplace) {
        const confirmed = await showConfirmDialog({
          title: 'Discard Changes',
          message: 'Are you sure you want to discard your changes to this sample?',
          confirmText: 'Discard',
          isDanger: true
        })
        if (!confirmed) return
      }
    }
    
    AudioEngine.previewStop()
    setIsPlaying(false)
    closeModal()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
      <div className="w-full max-w-5xl bg-[var(--bg-surface)] rounded-xl border border-[var(--border-subtle)] shadow-2xl flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[var(--border-subtle)] bg-[var(--bg-elevated)]">
          <div>
            <h2 className="text-lg font-semibold text-white">Sample Editor</h2>
            <p className="text-xs text-[var(--text-muted)] font-mono">{asset.name}</p>
          </div>
          <button onClick={handleCancel} className="p-2 hover:bg-[var(--bg-surface-raised)] rounded-full transition-colors text-[var(--text-muted)] hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Waveform Area */}
        <div className="h-64 bg-[var(--bg-base)] p-4 relative border-b border-[var(--border-subtle)]">
          <WaveformCanvas 
            url={audioUrl} 
            peaks={asset.waveformPeaksHigh} 
            duration={asset.durationSeconds}
            startMarker={startMarker}
            endMarker={endMarker}
            color={padData.color || '#00F0FF'}
            onRegionChange={(s, e) => {
              setStartMarker(s)
              setEndMarker(e)
            }}
          />
        </div>

        {/* Controls Area */}
        <div className="p-6 flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <EditorTransportControls 
              isPlaying={isPlaying}
              onPlayToggle={handlePreviewToggle}
              loop={loop}
              onLoopToggle={() => setLoop(!loop)}
              reverse={reverse}
              onReverseToggle={() => setReverse(!reverse)}
              playMode={playMode}
              onPlayModeChange={setPlayMode}
            />

            <div className="flex items-center gap-4">
              <button onClick={handleNormalize} className="px-4 py-2 text-xs font-semibold uppercase tracking-wider bg-[var(--bg-elevated)] hover:bg-[var(--bg-surface-raised)] rounded-md border border-[var(--border-subtle)] transition-colors">
                Normalize
              </button>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-4">
            <NumericParamInput label="Pitch" value={pitch} onChange={setPitch} min={-24} max={24} step={1} unit="st" />
            <NumericParamInput label="Gain" value={gain} onChange={setGain} min={-24} max={24} step={0.1} unit="dB" />
            <NumericParamInput label="Fade In" value={fadeIn} onChange={setFadeIn} min={0} max={2000} step={10} unit="ms" />
            <NumericParamInput label="Fade Out" value={fadeOut} onChange={setFadeOut} min={0} max={2000} step={10} unit="ms" />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end p-4 border-t border-[var(--border-subtle)] bg-[var(--bg-elevated)] gap-3">
          <button onClick={handleCancel} className="px-6 py-2 rounded-md font-semibold text-sm hover:bg-[var(--bg-surface-raised)] transition-colors">
            Cancel
          </button>
          <button onClick={handleSave} className="px-6 py-2 rounded-md font-semibold text-sm bg-[var(--accent-cyan)] text-black hover:opacity-90 transition-opacity">
            Save Changes
          </button>
        </div>

      </div>
    </div>
  )
}
