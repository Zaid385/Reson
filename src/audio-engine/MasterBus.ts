import * as Tone from 'tone'
import { linearToDb } from '@utils/math'

export class MasterBus {
  public readonly volumeNode: Tone.Volume
  public readonly muteNode: Tone.Volume
  public readonly limiterNode: Tone.Limiter
  public readonly analyser: Tone.Meter

  constructor() {
    this.volumeNode = new Tone.Volume(0)
    // Using a separate volume node for mute allows a fast fade without losing the original volume setting
    this.muteNode = new Tone.Volume(0)
    
    // Add a Master Output Limiter to prevent clipping (limit at -0.1 dB)
    this.limiterNode = new Tone.Limiter(-0.1)
    
    this.analyser = new Tone.Meter({ channels: 2 })

    // Build the master chain: Volume -> Mute -> Limiter -> Analyser -> Destination
    this.volumeNode.connect(this.muteNode)
    this.muteNode.connect(this.limiterNode)
    this.limiterNode.connect(this.analyser)
    this.analyser.toDestination()
  }

  setVolume(volumeLinear: number) {
    this.volumeNode.volume.value = linearToDb(volumeLinear)
  }

  setMute(muted: boolean) {
    // Fast fade to avoid clicks
    this.muteNode.volume.rampTo(muted ? -Infinity : 0, 0.01)
  }

  getLevel(): { peak: number; rms: number } {
    const val = this.analyser.getValue()
    let peakDb = -Infinity
    if (Array.isArray(val)) {
      peakDb = Math.max(...val.map(v => typeof v === 'number' ? v : -Infinity))
    } else if (typeof val === 'number') {
      peakDb = val
    }
    
    return { peak: peakDb, rms: peakDb }
  }

  dispose() {
    this.volumeNode.dispose()
    this.muteNode.dispose()
    this.limiterNode.dispose()
    this.analyser.dispose()
  }
}
