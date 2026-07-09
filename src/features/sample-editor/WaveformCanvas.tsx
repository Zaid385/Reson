import React, { useEffect, useRef } from 'react'
import WaveSurfer from 'wavesurfer.js'
import RegionsPlugin from 'wavesurfer.js/dist/plugins/regions.esm.js'

export interface WaveformCanvasProps {
  url?: string
  peaks?: number[]
  duration?: number
  startMarker: number
  endMarker: number
  color?: string
  onRegionChange: (startNormalized: number, endNormalized: number) => void
  playheadPosition?: number // normalized 0-1
}

export const WaveformCanvas: React.FC<WaveformCanvasProps> = ({ 
  url, 
  peaks, 
  duration, 
  startMarker, 
  endMarker, 
  color = '#00F0FF',
  onRegionChange,
  playheadPosition = 0
}) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const wavesurferRef = useRef<WaveSurfer | null>(null)
  const wsRegionsRef = useRef<any>(null)
  const isInternalChange = useRef(false)

  useEffect(() => {
    if (!containerRef.current) return

    const ws = WaveSurfer.create({
      container: containerRef.current,
      waveColor: `${color}80`,
      progressColor: color,
      cursorColor: color,
      barWidth: 2,
      barGap: 1,
      barRadius: 2,
      height: 'auto',
      interact: false // we use our own playhead sync
    })

    const wsRegions = ws.registerPlugin(RegionsPlugin.create())

    if (url) {
      ws.load(url)
    }

    ws.on('ready', () => {
      wsRegions.clearRegions()
      
      const region = wsRegions.addRegion({
        start: startMarker * ws.getDuration(),
        end: endMarker * ws.getDuration(),
        color: `${color}33`,
        drag: false, // only drag handles
        resize: true
      })

      region.on('update-end', () => {
        isInternalChange.current = true
        onRegionChange(region.start / ws.getDuration(), region.end / ws.getDuration())
        setTimeout(() => { isInternalChange.current = false }, 50)
      })
    })

    wavesurferRef.current = ws
    wsRegionsRef.current = wsRegions

    return () => {
      ws.destroy()
    }
  }, [url, peaks, duration, color])

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
    <div className="w-full h-full relative" ref={containerRef} />
  )
}
