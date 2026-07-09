import * as Tone from 'tone'
import { PadPlaybackParams } from './types'

export class Voice {
  public player: Tone.Player
  public envelopeGain: Tone.Gain
  public isPlaying: boolean = false
  public isReleasing: boolean = false
  public releaseMs: number = 0
  public onEnded?: (voice: Voice) => void

  constructor(
    public readonly voiceId: string,
    public readonly padId: string,
    buffer: Tone.ToneAudioBuffer,
    destination: Tone.InputNode
  ) {
    this.envelopeGain = new Tone.Gain(0)
    this.player = new Tone.Player(buffer)
    this.player.connect(this.envelopeGain)
    this.envelopeGain.connect(destination)

    this.player.onstop = () => {
      this.isPlaying = false
      if (this.onEnded) this.onEnded(this)
    }
  }

  start(params: PadPlaybackParams, velocityScale: number = 1) {
    this.releaseMs = params.releaseMs
    this.isPlaying = true
    this.player.loop = params.loop
    this.player.playbackRate = Math.pow(2, params.pitchSemitones / 12)
    
    const editorGain = Math.pow(10, params.gainDb / 20)
    const targetGain = editorGain * velocityScale

    const now = Tone.now()
    this.envelopeGain.gain.setValueAtTime(0, now)
    
    if (params.attackMs > 0) {
      this.envelopeGain.gain.linearRampToValueAtTime(targetGain, now + params.attackMs / 1000)
    } else {
      this.envelopeGain.gain.setValueAtTime(targetGain, now)
    }

    const duration = this.player.buffer.duration
    const startTimeOffset = params.startMarker * duration
    const playDuration = (params.endMarker - params.startMarker) * duration

    if (params.loop) {
      this.player.loopStart = startTimeOffset
      this.player.loopEnd = params.endMarker * duration
      this.player.start(now, startTimeOffset)
    } else {
      this.player.start(now, startTimeOffset, playDuration)
    }
  }

  release(releaseMs: number) {
    if (!this.isPlaying || this.isReleasing) return
    this.isReleasing = true
    
    const now = Tone.now()
    const releaseSecs = releaseMs / 1000
    
    const currentGain = this.envelopeGain.gain.value
    this.envelopeGain.gain.cancelScheduledValues(now)
    this.envelopeGain.gain.setValueAtTime(currentGain, now)
    
    if (releaseSecs > 0) {
      this.envelopeGain.gain.linearRampToValueAtTime(0, now + releaseSecs)
    } else {
      this.envelopeGain.gain.setValueAtTime(0, now)
    }
    
    this.player.stop(now + releaseSecs)
  }

  stop(fadeMs: number = 5) {
    this.release(fadeMs)
  }

  dispose() {
    this.player.dispose()
    this.envelopeGain.dispose()
  }
}
