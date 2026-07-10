import { GeneratedSample } from '@domain/procedural/BuiltInSampleGenerator'

export interface BuiltInSample {
  id: string
  name: string
  url: string // Still technically used by some types, but we'll use `builtin://`
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
  private generatedSamples: Map<string, GeneratedSample> = new Map()

  public setGeneratedSamples(samples: GeneratedSample[]) {
    this.generatedSamples.clear()
    samples.forEach(s => this.generatedSamples.set(s.id, s))
  }

  public getGeneratedSample(id: string): GeneratedSample | undefined {
    return this.generatedSamples.get(id)
  }

  async loadManifest(): Promise<Manifest> {
    // Generate manifest from our generated samples
    const samples = Array.from(this.generatedSamples.values())
    const pack: BuiltInPack = {
      id: 'factory-kit',
      name: 'Factory Kit',
      samples: samples.map(s => ({
        id: s.id,
        name: s.name,
        url: `builtin://${s.id}`
      }))
    }

    return { packs: [pack] }
  }

  async getSampleUrl(sampleId: string): Promise<string | null> {
    const s = this.generatedSamples.get(sampleId)
    if (s) return `builtin://${s.id}`
    return null
  }
}

export const builtInSampleManifest = new BuiltInSampleManifest()
