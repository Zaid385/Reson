import pkg from 'wavefile';
const { WaveFile } = pkg;
import fs from 'fs';
import path from 'path';

const sampleRate = 44100;
const dir = path.join(process.cwd(), 'public/samples/acoustic-kit');

function createKick() {
  const duration = 0.5;
  const samples = new Float64Array(sampleRate * duration);
  for (let i = 0; i < samples.length; i++) {
    const t = i / sampleRate;
    samples[i] = Math.sin(2 * Math.PI * 150 * t * Math.exp(-t * 20)) * Math.exp(-t * 10);
  }
  return samples;
}

function createSnare() {
  const duration = 0.3;
  const samples = new Float64Array(sampleRate * duration);
  for (let i = 0; i < samples.length; i++) {
    const t = i / sampleRate;
    const tone = Math.sin(2 * Math.PI * 250 * t) * Math.exp(-t * 20);
    const noise = (Math.random() * 2 - 1) * Math.exp(-t * 15);
    samples[i] = (tone + noise) * 0.5;
  }
  return samples;
}

function createHihat() {
  const duration = 0.1;
  const samples = new Float64Array(sampleRate * duration);
  for (let i = 0; i < samples.length; i++) {
    const t = i / sampleRate;
    samples[i] = (Math.random() * 2 - 1) * Math.exp(-t * 40);
  }
  return samples;
}

function saveWav(filename, samples) {
  const wav = new WaveFile();
  wav.fromScratch(1, sampleRate, '32f', samples);
  fs.writeFileSync(path.join(dir, filename), wav.toBuffer());
  console.log(`Generated ${filename}`);
}

saveWav('kick.wav', createKick());
saveWav('snare.wav', createSnare());
saveWav('hihat-closed.wav', createHihat());
