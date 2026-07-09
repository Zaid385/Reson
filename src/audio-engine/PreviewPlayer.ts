import * as Tone from 'tone'
import { SampleEditParams } from './types'
import { BufferRegistry } from './BufferRegistry'
import { dbToLinear } from '@utils/math'

export class PreviewPlayer {
  private player?: Tone.Player
  private gainNode: Tone.Gain
  private isPlaying: boolean = false

  constructor(
    private bufferRegistry: BufferRegistry,
    private destination: Tone.InputNode
  ) {
    this.gainNode = new Tone.Gain(1)
    this.gainNode.connect(this.destination)
  }

  play(assetId: string, params: SampleEditParams) {
    this.stop() // ensure only one active

    const toneBuffer = this.bufferRegistry.getBuffer(assetId, params.reverse)
    if (!toneBuffer) return

    this.player = new Tone.Player(toneBuffer)
    this.player.connect(this.gainNode)

    this.player.loop = params.loop
    this.player.playbackRate = Math.pow(2, params.pitchSemitones / 12)

    const editorGain = dbToLinear(params.gainDb)
    const now = Tone.now()
    
    this.gainNode.gain.setValueAtTime(0, now)
    if (params.fadeInMs > 0) {
      this.gainNode.gain.linearRampToValueAtTime(editorGain, now + params.fadeInMs / 1000)
    } else {
      this.gainNode.gain.setValueAtTime(editorGain, now)
    }

    const duration = toneBuffer.duration
    const startTimeOffset = params.startMarker * duration
    const playDuration = (params.endMarker - params.startMarker) * duration

    if (params.loop) {
      this.player.loopStart = startTimeOffset
      this.player.loopEnd = params.endMarker * duration
      this.player.start(now, startTimeOffset)
    } else {
      this.player.start(now, startTimeOffset, playDuration)
      
      if (params.fadeOutMs > 0) {
        const endTime = now + playDuration
        this.gainNode.gain.setValueAtTime(editorGain, Math.max(now, endTime - params.fadeOutMs / 1000))
        this.gainNode.gain.linearRampToValueAtTime(0, endTime)
      }
    }

    this.isPlaying = true
  }

  stop() {
    if (this.player) {
      this.player.stop()
      this.player.dispose()
      this.player = undefined
    }
    this.isPlaying = false
  }

  seek(/* positionNormalized: number */) {
    // Basic stub for seeking
  }

  getPlayheadPosition(): number {
    return 0
  }
}
