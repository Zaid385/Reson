import * as Tone from 'tone'
import { linearToDb } from '@utils/math'

export class PadBus {
  public readonly volumeNode: Tone.Volume
  public readonly compressorNode: Tone.Compressor
  public readonly distortionNode: Tone.Distortion
  public readonly bitcrusherNode: Tone.BitCrusher
  public readonly filterNode: Tone.Filter
  public readonly delayNode: Tone.FeedbackDelay
  public readonly reverbNode: Tone.Freeverb
  public readonly pannerNode: Tone.Panner
  public readonly output: Tone.Gain

  constructor() {
    this.volumeNode = new Tone.Volume(0)
    
    this.compressorNode = new Tone.Compressor(0, 1) // default to bypassed state (ratio 1)
    this.distortionNode = new Tone.Distortion(0)
    this.bitcrusherNode = new Tone.BitCrusher(8)
    this.filterNode = new Tone.Filter({ type: 'lowpass', frequency: 20000 })
    this.delayNode = new Tone.FeedbackDelay(0.25, 0.4)
    this.reverbNode = new Tone.Freeverb({ roomSize: 0.7, dampening: 3000 })
    
    this.pannerNode = new Tone.Panner(0)
    this.output = new Tone.Gain(1)

    // Bypass everything by default
    this.distortionNode.wet.value = 0
    this.bitcrusherNode.wet.value = 0
    // Filter does not have wet/dry, so we bypass it by setting it to a state that doesn't affect sound
    // or we can route around it if disabled, but for now we'll handle it via frequency.
    this.delayNode.wet.value = 0
    this.reverbNode.wet.value = 0

    // Chain: Volume -> Compressor -> Distortion -> BitCrusher -> Filter -> Delay -> Reverb -> Panner -> Output
    this.volumeNode.chain(
      this.compressorNode,
      this.distortionNode,
      this.bitcrusherNode,
      this.filterNode,
      this.delayNode,
      this.reverbNode,
      this.pannerNode,
      this.output
    )
  }

  setVolume(volumeLinear: number) {
    this.volumeNode.volume.value = linearToDb(volumeLinear)
  }

  setPan(pan: number) {
    this.pannerNode.pan.value = pan
  }

  setFx(params: Partial<PadFxParams>) {
    if (params.compressorEnabled !== undefined) {
      if (params.compressorEnabled) {
        if (params.compressorThreshold !== undefined) this.compressorNode.threshold.value = params.compressorThreshold
        if (params.compressorRatio !== undefined) this.compressorNode.ratio.value = params.compressorRatio
      } else {
        this.compressorNode.ratio.value = 1
        this.compressorNode.threshold.value = 0
      }
    }

    if (params.driveEnabled !== undefined) {
      this.distortionNode.wet.value = params.driveEnabled ? (params.driveMix ?? 1) : 0
      if (params.driveAmount !== undefined) this.distortionNode.distortion = params.driveAmount
    }

    if (params.bitcrusherEnabled !== undefined) {
      this.bitcrusherNode.wet.value = params.bitcrusherEnabled ? (params.bitcrusherMix ?? 1) : 0
      if (params.bitcrusherDepth !== undefined) this.bitcrusherNode.bits.value = params.bitcrusherDepth
    }

    if (params.filterEnabled !== undefined) {
      // Filter has no wet, we set frequency to max if disabled for LP, min for HP. 
      // But it's better to just set it to 20000 if disabled for LP.
      // Wait, Tone.Filter doesn't have wet?
      // Actually we can just use set() or directly set params.
      if (params.filterType !== undefined) this.filterNode.type = params.filterType
      if (params.filterFrequency !== undefined) {
        this.filterNode.frequency.value = params.filterEnabled ? Math.max(20, Math.min(20000, params.filterFrequency)) : 
          (this.filterNode.type === 'highpass' ? 20 : 20000)
      }
      if (params.filterResonance !== undefined) this.filterNode.Q.value = params.filterResonance
    }

    if (params.delayEnabled !== undefined) {
      this.delayNode.wet.value = params.delayEnabled ? (params.delayWet ?? 0.5) : 0
      if (params.delayTime !== undefined) this.delayNode.delayTime.value = params.delayTime
      if (params.delayFeedback !== undefined) this.delayNode.feedback.value = params.delayFeedback
    }

    if (params.reverbEnabled !== undefined) {
      this.reverbNode.wet.value = params.reverbEnabled ? (params.reverbWet ?? 0.5) : 0
      if (params.reverbSize !== undefined) this.reverbNode.roomSize.value = params.reverbSize
    }
  }

  setMute(muted: boolean) {
    this.output.gain.rampTo(muted ? 0 : 1, 0.01)
  }

  connect(destination: Tone.InputNode) {
    this.output.connect(destination)
  }

  dispose() {
    this.volumeNode.dispose()
    this.compressorNode.dispose()
    this.distortionNode.dispose()
    this.bitcrusherNode.dispose()
    this.filterNode.dispose()
    this.delayNode.dispose()
    this.reverbNode.dispose()
    this.pannerNode.dispose()
    this.output.dispose()
  }
}
