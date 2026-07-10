import * as Tone from 'tone'
import { AudioEngine } from '@audio-engine'

export interface GeneratedSample {
  id: string
  name: string
  buffer: AudioBuffer
  peaks: { low: number[], high: number[] }
}

export class BuiltInSampleGenerator {
  private static extractPeaks(audioBuffer: AudioBuffer, samples = 100) {
    const channelData = audioBuffer.getChannelData(0)
    const step = Math.ceil(channelData.length / samples)
    const low: number[] = []
    const high: number[] = []
    
    for (let i = 0; i < samples; i++) {
      let min = 1.0
      let max = -1.0
      for (let j = 0; j < step; j++) {
        const datum = channelData[i * step + j]
        if (datum < min) min = datum
        if (datum > max) max = datum
      }
      low.push(min)
      high.push(max)
    }
    return { low, high }
  }

  private static async renderOffline(duration: number, renderFn: () => void | Promise<void>): Promise<AudioBuffer> {
    const buffer = await Tone.Offline(async () => {
      await renderFn()
    }, duration)
    return buffer.get() as AudioBuffer
  }



  private static async generateKickHeavy(): Promise<AudioBuffer> {
    return this.renderOffline(0.5, () => {
      const kick = new Tone.MembraneSynth({
        pitchDecay: 0.05,
        octaves: 10,
        oscillator: { type: 'sine' },
        envelope: { attack: 0.001, decay: 0.4, sustain: 0.01, release: 0.1 }
      })
      const dist = new Tone.Distortion(0.8).toDestination()
      kick.connect(dist)
      kick.triggerAttackRelease('C1', '8n', 0)
    })
  }

  private static async generateKickPunch(): Promise<AudioBuffer> {
    return this.renderOffline(0.4, () => {
      const kick = new Tone.MembraneSynth({
        pitchDecay: 0.02,
        octaves: 12,
        oscillator: { type: 'triangle' },
        envelope: { attack: 0.001, decay: 0.2, sustain: 0, release: 0.1 }
      }).toDestination()
      kick.triggerAttackRelease('G1', '16n', 0)
    })
  }

  private static async generateKickDeep808(): Promise<AudioBuffer> {
    return this.renderOffline(1.0, () => {
      const kick = new Tone.MembraneSynth({
        pitchDecay: 0.08,
        octaves: 4,
        oscillator: { type: 'sine' },
        envelope: { attack: 0.005, decay: 0.8, sustain: 0, release: 0.2 }
      })
      const filter = new Tone.Filter(200, "lowpass").toDestination()
      kick.connect(filter)
      kick.triggerAttackRelease('C0', '4n', 0)
    })
  }

  private static async generateKickAcoustic(): Promise<AudioBuffer> {
    return this.renderOffline(0.4, () => {
      const kick = new Tone.MembraneSynth({
        pitchDecay: 0.03,
        octaves: 6,
        oscillator: { type: 'square4' },
        envelope: { attack: 0.002, decay: 0.3, sustain: 0, release: 0.1 }
      })
      const filter = new Tone.Filter(150, "lowpass").toDestination()
      kick.connect(filter)
      kick.triggerAttackRelease('E1', '8n', 0)
    })
  }

  private static async generateKickSoft(): Promise<AudioBuffer> {
    return this.renderOffline(0.4, () => {
      const kick = new Tone.MembraneSynth({
        pitchDecay: 0.01,
        octaves: 2,
        oscillator: { type: 'sine' },
        envelope: { attack: 0.01, decay: 0.3, sustain: 0, release: 0.1 }
      }).toDestination()
      kick.triggerAttackRelease('C1', '8n', 0)
    })
  }

  private static async generateSnareTight(): Promise<AudioBuffer> {
    return this.renderOffline(0.3, () => {
      const noise = new Tone.NoiseSynth({
        noise: { type: 'white' },
        envelope: { attack: 0.001, decay: 0.1, sustain: 0 }
      })
      const osc = new Tone.MembraneSynth({
        pitchDecay: 0.01,
        octaves: 4,
        envelope: { attack: 0.001, decay: 0.1, sustain: 0 }
      })
      const filter = new Tone.Filter(5000, "highpass").toDestination()
      noise.connect(filter)
      osc.toDestination()
      
      noise.triggerAttackRelease('16n', 0)
      osc.triggerAttackRelease('G3', '16n', 0)
    })
  }

  private static async generateSnareTrap(): Promise<AudioBuffer> {
    return this.renderOffline(0.3, () => {
      const noise = new Tone.NoiseSynth({
        noise: { type: 'white' },
        envelope: { attack: 0.001, decay: 0.2, sustain: 0 }
      })
      const osc = new Tone.MembraneSynth({
        pitchDecay: 0.05,
        octaves: 5,
        envelope: { attack: 0.001, decay: 0.15, sustain: 0 }
      })
      const eq = new Tone.EQ3(5, 0, 10).toDestination()
      noise.connect(eq)
      osc.connect(eq)
      
      noise.triggerAttackRelease('16n', 0)
      osc.triggerAttackRelease('C4', '16n', 0)
    })
  }

  private static async generateSnareAcoustic(): Promise<AudioBuffer> {
    return this.renderOffline(0.4, () => {
      const noise = new Tone.NoiseSynth({
        noise: { type: 'pink' },
        envelope: { attack: 0.005, decay: 0.25, sustain: 0 }
      })
      const osc = new Tone.MembraneSynth({
        pitchDecay: 0.02,
        octaves: 3,
        envelope: { attack: 0.001, decay: 0.2, sustain: 0 }
      })
      const dist = new Tone.Distortion(0.2).toDestination()
      noise.connect(dist)
      osc.connect(dist)
      
      noise.triggerAttackRelease('8n', 0)
      osc.triggerAttackRelease('E3', '8n', 0)
    })
  }

  private static async generateSnareHybrid(): Promise<AudioBuffer> {
    return this.renderOffline(0.4, () => {
      const noise = new Tone.NoiseSynth({
        noise: { type: 'white' },
        envelope: { attack: 0.001, decay: 0.15, sustain: 0 }
      })
      const osc = new Tone.Synth({
        oscillator: { type: 'square' },
        envelope: { attack: 0.001, decay: 0.1, sustain: 0 }
      })
      const filter = new Tone.Filter(2000, "bandpass").toDestination()
      noise.connect(filter)
      osc.connect(filter)
      
      noise.triggerAttackRelease('16n', 0)
      osc.triggerAttackRelease('A3', '16n', 0)
    })
  }

  private static async generateClap(spread: number, filterFreq: number): Promise<AudioBuffer> {
    return this.renderOffline(0.4, () => {
      const noise = new Tone.NoiseSynth({
        noise: { type: 'pink' },
        envelope: { attack: 0.001, decay: 0.3, sustain: 0 }
      })
      const filter = new Tone.Filter(filterFreq, "bandpass").toDestination()
      noise.connect(filter)

      // trigger multiple times for clap effect
      noise.triggerAttackRelease('16n', 0)
      noise.triggerAttackRelease('16n', spread * 0.01)
      noise.triggerAttackRelease('16n', spread * 0.02)
      noise.triggerAttackRelease('16n', spread * 0.035)
    })
  }

  private static async generateHiHat(type: 'closed'|'open'|'pedal', decay: number): Promise<AudioBuffer> {
    return this.renderOffline(type === 'open' ? 0.6 : 0.2, () => {
      const noise = new Tone.NoiseSynth({
        noise: { type: 'white' },
        envelope: { attack: type === 'pedal' ? 0.02 : 0.001, decay: decay, sustain: 0 }
      })
      const filter = new Tone.Filter(8000, "highpass").toDestination()
      noise.connect(filter)
      noise.triggerAttackRelease('16n', 0)
    })
  }

  private static async generateTom(freq: string): Promise<AudioBuffer> {
    return this.renderOffline(0.5, () => {
      const osc = new Tone.MembraneSynth({
        pitchDecay: 0.05,
        octaves: 3,
        envelope: { attack: 0.005, decay: 0.4, sustain: 0 }
      }).toDestination()
      osc.triggerAttackRelease(freq, '8n', 0)
    })
  }

  private static async generateCowbell(): Promise<AudioBuffer> {
    return this.renderOffline(0.4, () => {
      const osc1 = new Tone.Synth({
        oscillator: { type: 'square' },
        envelope: { attack: 0.001, decay: 0.3, sustain: 0 }
      })
      const osc2 = new Tone.Synth({
        oscillator: { type: 'square' },
        envelope: { attack: 0.001, decay: 0.3, sustain: 0 }
      })
      const filter = new Tone.Filter(800, "highpass").toDestination()
      osc1.connect(filter)
      osc2.connect(filter)
      
      osc1.triggerAttackRelease('D4', '8n', 0)
      osc2.triggerAttackRelease('F#4', '8n', 0)
    })
  }
  
  private static async generateRim(): Promise<AudioBuffer> {
    return this.renderOffline(0.2, () => {
      const osc = new Tone.MembraneSynth({
        pitchDecay: 0.01,
        octaves: 1,
        envelope: { attack: 0.001, decay: 0.05, sustain: 0 }
      }).toDestination()
      osc.triggerAttackRelease('C5', '16n', 0)
    })
  }

  private static async generateShaker(): Promise<AudioBuffer> {
    return this.renderOffline(0.3, () => {
      const noise = new Tone.NoiseSynth({
        noise: { type: 'pink' },
        envelope: { attack: 0.02, decay: 0.1, sustain: 0 }
      })
      const filter = new Tone.Filter(6000, "highpass").toDestination()
      noise.connect(filter)
      noise.triggerAttackRelease('16n', 0)
    })
  }

  private static async generateCrash(reverse: boolean = false): Promise<AudioBuffer> {
    return this.renderOffline(2.0, () => {
      const noise = new Tone.NoiseSynth({
        noise: { type: 'white' },
        envelope: reverse 
          ? { attack: 1.5, decay: 0.1, sustain: 1, release: 0.1 }
          : { attack: 0.005, decay: 1.5, sustain: 0 }
      })
      const filter1 = new Tone.Filter(4000, "highpass")
      const filter2 = new Tone.Filter(8000, "lowpass")
      const reverb = new Tone.Reverb(1.5).toDestination()
      
      noise.chain(filter1, filter2, reverb)
      noise.triggerAttackRelease(reverse ? '1n' : '8n', 0)
    })
  }

  private static async generateRide(): Promise<AudioBuffer> {
    return this.renderOffline(1.5, () => {
      const osc = new Tone.FMSynth({
        harmonicity: 3.5,
        modulationIndex: 10,
        oscillator: { type: 'sine' },
        envelope: { attack: 0.001, decay: 1.2, sustain: 0 }
      })
      const filter = new Tone.Filter(5000, "highpass").toDestination()
      osc.connect(filter)
      osc.triggerAttackRelease('C5', '8n', 0)
    })
  }

  private static async generate808(duration: number): Promise<AudioBuffer> {
    return this.renderOffline(duration, () => {
      const synth = new Tone.Synth({
        oscillator: { type: 'triangle' },
        envelope: { attack: 0.02, decay: duration * 0.8, sustain: 0 }
      })
      const dist = new Tone.Distortion(0.5).toDestination()
      synth.connect(dist)
      synth.triggerAttackRelease('C2', duration, 0)
    })
  }

  private static async generateBell(): Promise<AudioBuffer> {
    return this.renderOffline(1.5, () => {
      const synth = new Tone.FMSynth({
        harmonicity: 2.1,
        modulationIndex: 3,
        envelope: { attack: 0.01, decay: 1.0, sustain: 0 }
      }).toDestination()
      synth.triggerAttackRelease('E5', '4n', 0)
    })
  }

  private static async generatePianoStab(): Promise<AudioBuffer> {
    return this.renderOffline(1.0, () => {
      const synth = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: 'triangle' },
        envelope: { attack: 0.01, decay: 0.5, sustain: 0 }
      })
      const filter = new Tone.Filter(2000, "lowpass").toDestination()
      synth.connect(filter)
      synth.triggerAttackRelease(['C4', 'E4', 'G4', 'B4'], '8n', 0)
    })
  }

  private static async generateVocalHey(): Promise<AudioBuffer> {
    return this.renderOffline(0.4, () => {
      // Very basic formant synth placeholder
      const osc = new Tone.PWMOscillator(300, 0.2).start(0).stop(0.3)
      const filter1 = new Tone.Filter(800, "bandpass", -12)
      const filter2 = new Tone.Filter(1200, "bandpass", -12)
      const env = new Tone.AmplitudeEnvelope({ attack: 0.01, decay: 0.2, sustain: 0 })
      
      osc.connect(filter1)
      osc.connect(filter2)
      filter1.connect(env)
      filter2.connect(env)
      env.toDestination()
      
      env.triggerAttackRelease('8n', 0)
    })
  }

  private static async generateImpact(): Promise<AudioBuffer> {
    return this.renderOffline(2.0, () => {
      const osc = new Tone.MembraneSynth({
        pitchDecay: 0.1,
        octaves: 8,
        envelope: { attack: 0.01, decay: 1.5, sustain: 0 }
      })
      const noise = new Tone.NoiseSynth({
        noise: { type: 'pink' },
        envelope: { attack: 0.01, decay: 1.5, sustain: 0 }
      })
      const dist = new Tone.Distortion(0.8)
      const reverb = new Tone.Reverb(2).toDestination()
      
      osc.chain(dist, reverb)
      noise.chain(dist, reverb)
      
      osc.triggerAttackRelease('C1', '4n', 0)
      noise.triggerAttackRelease('4n', 0)
    })
  }

  public static async generateAll(): Promise<GeneratedSample[]> {
    const tasks = [
      { id: 'acoustic-kit/kick-heavy', name: 'Kick - Heavy', fn: () => this.generateKickHeavy() },
      { id: 'acoustic-kit/kick-punch', name: 'Kick - Punch', fn: () => this.generateKickPunch() },
      { id: 'acoustic-kit/kick-deep808', name: 'Kick - Deep 808', fn: () => this.generateKickDeep808() },
      { id: 'acoustic-kit/kick-acoustic', name: 'Kick - Acoustic', fn: () => this.generateKickAcoustic() },
      { id: 'acoustic-kit/kick-soft', name: 'Kick - Soft', fn: () => this.generateKickSoft() },
      
      { id: 'acoustic-kit/snare-tight', name: 'Snare - Tight', fn: () => this.generateSnareTight() },
      { id: 'acoustic-kit/snare-trap', name: 'Snare - Trap', fn: () => this.generateSnareTrap() },
      { id: 'acoustic-kit/snare-acoustic', name: 'Snare - Acoustic', fn: () => this.generateSnareAcoustic() },
      { id: 'acoustic-kit/snare-hybrid', name: 'Snare - Hybrid', fn: () => this.generateSnareHybrid() },
      
      { id: 'acoustic-kit/clap-classic', name: 'Clap - Classic', fn: () => this.generateClap(1, 1500) },
      { id: 'acoustic-kit/clap-tape', name: 'Clap - Tape', fn: () => this.generateClap(1.5, 1000) },
      { id: 'acoustic-kit/clap-wide', name: 'Clap - Wide', fn: () => this.generateClap(2, 2000) },
      
      { id: 'acoustic-kit/hihat-closed', name: 'HiHat - Closed', fn: () => this.generateHiHat('closed', 0.05) },
      { id: 'acoustic-kit/hihat-closed-soft', name: 'HiHat - Closed Soft', fn: () => this.generateHiHat('closed', 0.02) },
      { id: 'acoustic-kit/hihat-open', name: 'HiHat - Open', fn: () => this.generateHiHat('open', 0.4) },
      { id: 'acoustic-kit/hihat-pedal', name: 'HiHat - Pedal', fn: () => this.generateHiHat('pedal', 0.1) },
      { id: 'acoustic-kit/hihat-loose', name: 'HiHat - Loose', fn: () => this.generateHiHat('closed', 0.1) },
      
      { id: 'acoustic-kit/rim', name: 'Rim', fn: () => this.generateRim() },
      { id: 'acoustic-kit/cowbell', name: 'Cowbell', fn: () => this.generateCowbell() },
      { id: 'acoustic-kit/tom-high', name: 'Tom High', fn: () => this.generateTom('G3') },
      { id: 'acoustic-kit/tom-mid', name: 'Tom Mid', fn: () => this.generateTom('D3') },
      { id: 'acoustic-kit/tom-low', name: 'Tom Low', fn: () => this.generateTom('A2') },
      { id: 'acoustic-kit/shaker', name: 'Shaker', fn: () => this.generateShaker() },
      
      { id: 'acoustic-kit/crash', name: 'Crash', fn: () => this.generateCrash(false) },
      { id: 'acoustic-kit/ride', name: 'Ride', fn: () => this.generateRide() },
      { id: 'acoustic-kit/reverse-crash', name: 'Reverse Crash', fn: () => this.generateCrash(true) },
      
      { id: 'acoustic-kit/808-long', name: '808 Long', fn: () => this.generate808(1.5) },
      { id: 'acoustic-kit/808-short', name: '808 Short', fn: () => this.generate808(0.4) },
      
      { id: 'acoustic-kit/bell', name: 'Bell', fn: () => this.generateBell() },
      { id: 'acoustic-kit/piano-stab', name: 'Piano Stab', fn: () => this.generatePianoStab() },
      
      { id: 'acoustic-kit/vocal-hey', name: 'Vocal Hey', fn: () => this.generateVocalHey() },
      
      { id: 'acoustic-kit/impact', name: 'Impact', fn: () => this.generateImpact() },
    ]

    const results: GeneratedSample[] = []
    for (const t of tasks) {
      try {
        const buffer = await t.fn()
        const peaks = this.extractPeaks(buffer, 100)
        AudioEngine.registerBuffer(t.id, buffer)
        results.push({ id: t.id, name: t.name, buffer, peaks })
      } catch (e) {
        console.error(`Failed to generate ${t.name}`, e)
      }
    }
    
    return results
  }
}
