import React, { useState, useEffect } from 'react'
import { SampleBrowserSearch } from './SampleBrowserSearch'
import { SampleBrowserTabs, TabType } from './SampleBrowserTabs'
import { SampleListItem } from './SampleListItem'
import { builtInSampleManifest, Manifest } from '@persistence/builtInSampleManifest'
import { assetRepository } from '@persistence/repositories/AssetRepository'
import { AssetData } from '@types/models'
import { AudioEngine } from '@audio-engine'
import { useStore } from '@state/store'
import { ResponsiveDrawer } from '@components/layout/ResponsiveDrawer'
import { liveQuery } from 'dexie'
import { db } from '@persistence/db'

export const SampleBrowserPanel: React.FC = () => {
  const isSampleBrowserOpen = useStore(state => state.isSampleBrowserOpen)
  const toggleSampleBrowser = useStore(state => state.toggleSampleBrowser)
  const [activeTab, setActiveTab] = useState<TabType>('built-in')
  const [query, setQuery] = useState('')
  const [manifest, setManifest] = useState<Manifest | null>(null)
  const [userAssets, setUserAssets] = useState<AssetData[]>([])
  const [previewingId, setPreviewingId] = useState<string | null>(null)

  useEffect(() => {
    builtInSampleManifest.loadManifest().then(setManifest)
  }, [])

  // Observe user assets using Dexie liveQuery so it auto-updates when samples are added
  useEffect(() => {
    let subscription: { unsubscribe: () => void } | null = null

    if (activeTab === 'user') {
      subscription = liveQuery(() => 
        db.assets.where('sourceType').equals('user-upload').toArray()
      ).subscribe({
        next: (assets) => setUserAssets(assets),
        error: (err) => console.error('Failed to observe user assets:', err)
      })
    }

    return () => {
      if (subscription) {
        subscription.unsubscribe()
      }
    }
  }, [activeTab, isSampleBrowserOpen])

  if (!isSampleBrowserOpen) return null

  const handlePreviewToggle = async (sampleId: string, url?: string) => {
    if (previewingId === sampleId) {
      AudioEngine.previewStop()
      setPreviewingId(null)
      return
    }

    if (activeTab === 'built-in' && url) {
      try {
        const response = await fetch(`${url}?v=1`)
        const arrayBuffer = await response.arrayBuffer()
        const ctx = new AudioContext()
        const audioBuffer = await ctx.decodeAudioData(arrayBuffer)
        AudioEngine.registerBuffer(sampleId, audioBuffer)
        AudioEngine.previewPlay(sampleId, { startMarker: 0, endMarker: 1, reverse: false, loop: false, pitchSemitones: 0, gainDb: 0, fadeInMs: 0, fadeOutMs: 0 })
        setPreviewingId(sampleId)
      } catch (e) {
        console.error('Preview failed', e)
      }
    } else if (activeTab === 'user') {
      try {
        // If it's not registered in the engine, hydrate it on-demand
        // We'll peek if it's there. Actually we can't easily peek, 
        // but let's just attempt to load it from DB and register if we know we need to.
        // It's safer to just fetch and decode it if we need to.
        const asset = await assetRepository.getAsset(sampleId)
        if (asset && asset.audioData) {
          const arrayBuffer = await asset.audioData.arrayBuffer()
          const ctx = new AudioContext()
          const audioBuffer = await ctx.decodeAudioData(arrayBuffer)
          AudioEngine.registerBuffer(sampleId, audioBuffer)
        }
        
        AudioEngine.previewPlay(sampleId, { startMarker: 0, endMarker: 1, reverse: false, loop: false, pitchSemitones: 0, gainDb: 0, fadeInMs: 0, fadeOutMs: 0 })
        setPreviewingId(sampleId)
      } catch (e) {
        console.error('User sample preview failed', e)
      }
    }
  }

  // Filter built-in
  const builtInItems = manifest?.packs.flatMap(pack => 
    pack.samples.filter(s => s.name.toLowerCase().includes(query.toLowerCase()))
  ) || []

  // Filter user
  const userItems = userAssets.filter(a => a.name.toLowerCase().includes(query.toLowerCase()))

  return (
    <ResponsiveDrawer 
      isOpen={isSampleBrowserOpen} 
      onClose={toggleSampleBrowser} 
      side="left" 
      width="w-[280px]" 
      title="Sample Browser"
    >
      <SampleBrowserTabs activeTab={activeTab} setTab={setActiveTab} />
      <SampleBrowserSearch query={query} setQuery={setQuery} />
      
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'built-in' && (
          <div className="py-2">
            {builtInItems.map(sample => (
              <SampleListItem 
                key={sample.id}
                id={sample.id}
                name={sample.name}
                url={sample.url}
                isPlaying={previewingId === sample.id}
                onPreviewToggle={() => handlePreviewToggle(sample.id, sample.url)}
              />
            ))}
            {builtInItems.length === 0 && (
              <p className="text-center text-[var(--text-muted)] mt-8 text-sm">No sounds found</p>
            )}
          </div>
        )}

        {activeTab === 'user' && (
          <div className="py-2">
            {userItems.map(asset => (
              <SampleListItem 
                key={asset.id}
                id={asset.id}
                name={asset.name}
                isPlaying={previewingId === asset.id}
                onPreviewToggle={() => handlePreviewToggle(asset.id)}
              />
            ))}
            {userItems.length === 0 && (
              <p className="text-center text-[var(--text-muted)] mt-8 text-sm">
                No user samples.<br/>Drag & drop onto pads to upload.
              </p>
            )}
          </div>
        )}
      </div>
    </ResponsiveDrawer>
  )
}
