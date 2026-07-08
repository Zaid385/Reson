import * as Tone from 'tone'
import { linearToDb } from '@utils/math'

export class PadBus {
  public readonly volumeNode: Tone.Volume
  public readonly pannerNode: Tone.Panner
  public readonly output: Tone.Gain

  constructor() {
    this.volumeNode = new Tone.Volume(0)
    this.pannerNode = new Tone.Panner(0)
    this.output = new Tone.Gain(1)

    // Chain: Volume -> Panner -> Output
    // This allows voices to connect to volumeNode.
    this.volumeNode.connect(this.pannerNode)
    this.pannerNode.connect(this.output)
  }

  setVolume(volumeLinear: number) {
    this.volumeNode.volume.value = linearToDb(volumeLinear)
  }

  setPan(pan: number) {
    this.pannerNode.pan.value = pan
  }

  setMute(muted: boolean) {
    // Gated mute on the output node to avoid touching the main volume node
    this.output.gain.rampTo(muted ? 0 : 1, 0.01)
  }

  connect(destination: Tone.InputNode) {
    this.output.connect(destination)
  }

  dispose() {
    this.volumeNode.dispose()
    this.pannerNode.dispose()
    this.output.dispose()
  }
}
