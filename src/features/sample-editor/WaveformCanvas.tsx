/* eslint-disable react-hooks/set-state-in-effect */
import React, { useEffect, useRef, useState } from 'react'
import WaveSurfer from 'wavesurfer.js'
import RegionsPlugin from 'wavesurfer.js/dist/plugins/regions.esm.js'

export interface WaveformCanvasProps {
  url?: string
  peaks?: number[]
  duration?: number
  startMarker: number
  endMarker: number
  color?: string
  reverse?: boolean
  onRegionChange: (startNormalized: number, endNormalized: number) => void
  playheadPosition?: number // normalized 0-1
}

const darkenHex = (hex: string, factor: number) => {
  let c = hex.replace('#', '')
  if (c.length === 3) c = c.split('').map(char => char + char).join('')
  const num = parseInt(c, 16)
  const r = Math.floor((num >> 16) * factor)
  const g = Math.floor(((num >> 8) & 0x00FF) * factor)
  const b = Math.floor((num & 0x0000FF) * factor)
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`
}

export const WaveformCanvas: React.FC<WaveformCanvasProps> = ({ 
  url, 
  peaks, 
  duration, 
  startMarker, 
  endMarker, 
  color = '#00F0FF',
  reverse = false,
  onRegionChange,
  playheadPosition = 0
}) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const wavesurferRef = useRef<WaveSurfer | null>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const wsRegionsRef = useRef<any>(null)
  const isInternalChange = useRef(false)
  const internalChangeTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [isLight, setIsLight] = useState(false)
  const [wsReady, setWsReady] = useState(false)

  // Flip canvas when reverse is true
  useEffect(() => {
    if (!wsReady) return
    const ws = wavesurferRef.current
    if (!ws) return
    
    // In wavesurfer v7, getWrapper returns the main wrapper
    // The canvas is inside a shadowRoot if it's attached
    const wrapper = ws.getWrapper()
    const canvas = wrapper.shadowRoot ? wrapper.shadowRoot.querySelector('canvas') : wrapper.querySelector('canvas')
    
    if (canvas) {
      canvas.style.transform = reverse ? 'scaleX(-1)' : 'none'
    }
  }, [reverse, wsReady])

  useEffect(() => {
    setIsLight(document.documentElement.classList.contains('light'))
    const observer = new MutationObserver(() => {
      setIsLight(document.documentElement.classList.contains('light'))
    })
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!containerRef.current) return

    const actualColor = isLight ? darkenHex(color, 0.5) : color

    const ws = WaveSurfer.create({
      container: containerRef.current,
      waveColor: `${actualColor}80`,
      progressColor: actualColor,
      cursorColor: actualColor,
      barWidth: 2,
      barGap: 1,
      barRadius: 2,
      height: 'auto',
      interact: false
    })

    const wsRegions = ws.registerPlugin(RegionsPlugin.create())

    if (url) {
      ws.load(url, peaks ? [peaks] : undefined, duration)
    } else if (peaks && peaks.length > 0 && duration) {
      // Create a minimal silent WAV data URI so WaveSurfer has a valid source to attach the peaks to
      const dummyWav = 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA='
      ws.load(dummyWav, [peaks], duration)
    }

    ws.on('ready', () => {
      setWsReady(true)
      wsRegions.clearRegions()
      
      const region = wsRegions.addRegion({
        start: startMarker * ws.getDuration(),
        end: endMarker * ws.getDuration(),
        color: `${actualColor}33`,
        drag: false, 
        resize: true
      })

      const handleUpdate = () => {
        isInternalChange.current = true
        if (internalChangeTimeout.current) clearTimeout(internalChangeTimeout.current)
        onRegionChange(region.start / ws.getDuration(), region.end / ws.getDuration())
        internalChangeTimeout.current = setTimeout(() => { isInternalChange.current = false }, 100)
      }

      region.on('update', handleUpdate)
      region.on('update-end', handleUpdate)
    })

    wavesurferRef.current = ws
    wsRegionsRef.current = wsRegions

    return () => {
      setWsReady(false)
      ws.destroy()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url, peaks, duration, color, isLight])

  // Sync external marker changes (if changed via text input or cancel)
  useEffect(() => {
    if (isInternalChange.current) return
    const ws = wavesurferRef.current
    const wsRegions = wsRegionsRef.current
    if (!ws || !wsRegions) return
    
    const d = ws.getDuration()
    if (d > 0 && wsRegions.getRegions().length > 0) {
      const region = wsRegions.getRegions()[0]
      region.setOptions({
        start: startMarker * d,
        end: endMarker * d
      })
    }
  }, [startMarker, endMarker])

  // Sync playhead
  useEffect(() => {
    const ws = wavesurferRef.current
    if (ws && playheadPosition >= 0 && playheadPosition <= 1) {
      // For visual playhead sync without audio routing via wavesurfer
      ws.seekTo(playheadPosition)
    }
  }, [playheadPosition])

  return (
    <div className="w-full h-full relative" ref={containerRef}>
      {/* Flags Overlay */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Start Flag */}
        <div 
          className="absolute top-0 bottom-0 w-px z-10"
          style={{ 
            left: `${startMarker * 100}%`,
            backgroundColor: isLight ? darkenHex(color, 0.4) : color 
          }}
        >
          <div 
            className="absolute top-0 left-0 w-3 h-4"
            style={{ 
              backgroundColor: isLight ? darkenHex(color, 0.4) : color,
              clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 50%)'
            }}
          />
        </div>

        {/* End Flag */}
        <div 
          className="absolute top-0 bottom-0 w-px z-10"
          style={{ 
            left: `${endMarker * 100}%`,
            backgroundColor: isLight ? darkenHex(color, 0.4) : color 
          }}
        >
          <div 
            className="absolute top-0 right-0 w-3 h-4"
            style={{ 
              backgroundColor: isLight ? darkenHex(color, 0.4) : color,
              clipPath: 'polygon(100% 0, 0 0, 0 100%, 100% 50%)'
            }}
          />
        </div>
      </div>
    </div>
  )
}
