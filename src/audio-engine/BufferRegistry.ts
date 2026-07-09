import * as Tone from 'tone'

export class BufferRegistry {
  private buffers = new Map<string, Tone.ToneAudioBuffer>()

  registerBuffer(assetId: string, buffer: AudioBuffer) {
    const toneBuffer = new Tone.ToneAudioBuffer(buffer)
    this.buffers.set(assetId, toneBuffer)
  }

  getBuffer(assetId: string, reversed: boolean = false): Tone.ToneAudioBuffer | undefined {
    const key = reversed ? `${assetId}::reversed` : assetId
    const buf = this.buffers.get(key)
    
    if (!buf && reversed) {
      const forwardBuf = this.buffers.get(assetId)
      if (forwardBuf && forwardBuf.get()) {
        const rawBuf = forwardBuf.get() as AudioBuffer
        const ctx = Tone.getContext().rawContext
        
        // Ensure ctx and createBuffer exist (defensive for tests)
        if (ctx && typeof ctx.createBuffer === 'function') {
          const clonedBuf = ctx.createBuffer(rawBuf.numberOfChannels, rawBuf.length, rawBuf.sampleRate)
          for (let i = 0; i < rawBuf.numberOfChannels; i++) {
            clonedBuf.copyToChannel(new Float32Array(rawBuf.getChannelData(i)), i)
          }
          const revBuf = new Tone.ToneAudioBuffer(clonedBuf)
          revBuf.reverse = true
          this.buffers.set(key, revBuf)
          return revBuf
        }
      }
    }
    return buf
  }

  unregisterBuffer(assetId: string) {
    const forward = this.buffers.get(assetId)
    if (forward) {
      forward.dispose()
      this.buffers.delete(assetId)
    }
    
    const reversed = this.buffers.get(`${assetId}::reversed`)
    if (reversed) {
      reversed.dispose()
      this.buffers.delete(`${assetId}::reversed`)
    }
  }

  dispose() {
    this.buffers.forEach((buf) => buf.dispose())
    this.buffers.clear()
  }
}
