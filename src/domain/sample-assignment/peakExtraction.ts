export function extractPeaks(buffer: AudioBuffer, lowResCount: number = 64, highResCount: number = 2000): { low: number[], high: number[] } {
  const channelData = buffer.getChannelData(0) // Just use Left channel for visual peaks
  
  // High res
  const high = extractResolution(channelData, Math.min(highResCount, Math.floor(channelData.length / 256)))
  
  // Low res
  const low = extractResolution(channelData, lowResCount)
  
  return { low, high }
}

function extractResolution(channelData: Float32Array, numPoints: number): number[] {
  if (numPoints <= 0) return []
  
  const step = Math.max(1, Math.floor(channelData.length / numPoints))
  const peaks: number[] = []
  
  for (let i = 0; i < numPoints; i++) {
    let min = 1.0
    let max = -1.0
    const start = i * step
    const end = Math.min(start + step, channelData.length)
    
    for (let j = start; j < end; j++) {
      const val = channelData[j]
      if (val < min) min = val
      if (val > max) max = val
    }
    
    // We store the max absolute value as a single positive magnitude [0, 1] for simple UI bars
    peaks.push(Math.max(Math.abs(min), Math.abs(max)))
  }
  
  return peaks
}
