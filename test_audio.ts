import { engine } from './src/audio-engine/AudioEngine'

async function run() {
  try {
    await engine.initialize()
    console.log("Engine initialized")

    // We can't actually play a buffer without AudioContext, but Tone.js in node uses a mock context sometimes?
    // Actually, running Tone.js in Node will likely crash because it expects the DOM AudioContext.
  } catch (err) {
    console.error("Crash:", err)
  }
}

run()
