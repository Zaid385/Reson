import { useEffect, useRef } from 'react'
import { useStore } from '@state/store'
import { AudioEngine } from '@audio-engine'
import { Volume2, VolumeX } from 'lucide-react'

export function MasterVolumeControl() {
  const masterVolume = useStore(state => state.settings?.masterVolume ?? 1)
  const masterMute = useStore(state => state.settings?.masterMute ?? false)
  const updateSettings = useStore(state => state.updateSettings)
  
  const meterLeftRef = useRef<HTMLDivElement>(null)
  const meterRightRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let rafId: number
    const updateMeter = () => {
      const { peak } = AudioEngine.getMasterLevel()
      // peak is in dB, from -100 to 0
      const linear = Math.max(0, Math.min(1, (peak + 60) / 60))
      const percentage = linear * 100
      
      if (meterLeftRef.current && meterRightRef.current) {
        meterLeftRef.current.style.height = `${percentage}%`
        meterRightRef.current.style.height = `${percentage}%`
      }
      
      rafId = requestAnimationFrame(updateMeter)
    }
    
    rafId = requestAnimationFrame(updateMeter)
    return () => cancelAnimationFrame(rafId)
  }, [])

  return (
    <div className="flex items-center gap-4 border-l border-[var(--border-subtle)] pl-4 h-full">
      <button 
        className="w-8 h-8 rounded-full flex items-center justify-center text-[var(--text-muted)] hover:text-white hover:bg-[var(--bg-surface-raised)] transition-colors"
        onClick={() => updateSettings({ masterMute: !masterMute })}
      >
        {masterMute ? <VolumeX className="w-4 h-4 text-[var(--accent-danger)]" /> : <Volume2 className="w-4 h-4" />}
      </button>

      <div className="flex items-center gap-2">
        <div className="relative w-24 h-6 flex items-center group">
          <div className="absolute inset-x-0 h-1.5 bg-[var(--bg-base)] rounded-full overflow-hidden border border-[var(--border-subtle)]">
            <div 
              className="absolute inset-y-0 left-0 bg-[var(--accent-cyan)] group-hover:bg-[var(--accent-cyan-hover)] transition-colors"
              style={{ width: `${masterVolume * 100}%` }}
            />
          </div>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={masterVolume}
            onChange={(e) => updateSettings({ masterVolume: parseFloat(e.target.value) })}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
        </div>

        {/* Master Meter */}
        <div className="w-4 h-6 bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded flex gap-px p-px items-end overflow-hidden">
          <div className="flex-1 bg-green-500 origin-bottom" style={{ height: '0%' }} ref={meterLeftRef} />
          <div className="flex-1 bg-green-500 origin-bottom" style={{ height: '0%' }} ref={meterRightRef} />
        </div>
      </div>
    </div>
  )
}
