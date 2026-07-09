export interface BuiltInSample {
  id: string
  name: string
  url: string
}

export interface BuiltInPack {
  id: string
  name: string
  samples: BuiltInSample[]
}

export interface Manifest {
  packs: BuiltInPack[]
}

export class BuiltInSampleManifest {
  private manifest: Manifest | null = null

  async loadManifest(): Promise<Manifest> {
    if (this.manifest) return this.manifest
    
    try {
      const response = await fetch('/samples/manifest.json')
      this.manifest = await response.json()
      return this.manifest!
    } catch (e) {
      console.error('Failed to load built-in sample manifest', e)
      return { packs: [] }
    }
  }

  async getSampleUrl(sampleId: string): Promise<string | null> {
    const manifest = await this.loadManifest()
    for (const pack of manifest.packs) {
      const sample = pack.samples.find(s => s.id === sampleId)
      if (sample) return sample.url
    }
    return null
  }
}

export const builtInSampleManifest = new BuiltInSampleManifest()
