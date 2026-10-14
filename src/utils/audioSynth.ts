// Web Audio API synthesizers for space telemetry and plasma noise

let audioCtx: AudioContext | null = null;
let damagedNode: { osc: OscillatorNode; noise: AudioBufferSourceNode; gain: GainNode } | null = null;
let cleanNode: { osc1: OscillatorNode; osc2: OscillatorNode; gain: GainNode } | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    audioCtx = new AudioContextClass();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export function playDamagedAudio(volume = 0.15): void {
  stopAllAudio();
  const ctx = getAudioContext();

  // Create White/Pink Noise for cosmic plasma static
  const bufferSize = ctx.sampleRate * 2;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1; // white noise
  }

  const noise = ctx.createBufferSource();
  noise.buffer = buffer;
  noise.loop = true;

  // Filter the noise to sound like deep-space solar flare static
  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.value = 800;
  filter.Q.value = 1.2;

  // Subtle distorted underlying carrier wave
  const osc = ctx.createOscillator();
  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(440, ctx.currentTime);

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(volume, ctx.currentTime);

  noise.connect(filter);
  filter.connect(gain);
  osc.connect(gain);
  gain.connect(ctx.destination);

  noise.start();
  osc.start();

  damagedNode = { osc, noise, gain };
}

export function playCleanAudio(volume = 0.12): void {
  stopAllAudio();
  const ctx = getAudioContext();

  // Pristine pure sinusoidal harmonic tones (1420 MHz hydrogen telemetry recreation)
  const osc1 = ctx.createOscillator();
  osc1.type = 'sine';
  osc1.frequency.setValueAtTime(523.25, ctx.currentTime); // C5

  const osc2 = ctx.createOscillator();
  osc2.type = 'sine';
  osc2.frequency.setValueAtTime(783.99, ctx.currentTime); // G5 (harmonic fifth)

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(volume, ctx.currentTime);

  osc1.connect(gain);
  osc2.connect(gain);
  gain.connect(ctx.destination);

  osc1.start();
  osc2.start();

  cleanNode = { osc1, osc2, gain };
}

export function stopAllAudio(): void {
  if (damagedNode) {
    try {
      damagedNode.noise.stop();
      damagedNode.osc.stop();
      damagedNode.gain.disconnect();
    } catch {
      // ignore
    }
    damagedNode = null;
  }
  if (cleanNode) {
    try {
      cleanNode.osc1.stop();
      cleanNode.osc2.stop();
      cleanNode.gain.disconnect();
    } catch {
      // ignore
    }
    cleanNode = null;
  }
}

/**
 * Generate a valid 44.1kHz 16-bit PCM WAV file blob of the denoised hydrogen telemetry
 */
export function createDenoisedWavBlob(durationSeconds = 3): Blob {
  const sampleRate = 44100;
  const numSamples = sampleRate * durationSeconds;
  const buffer = new ArrayBuffer(44 + numSamples * 2);
  const view = new DataView(buffer);

  // Write WAV Header
  // RIFF identifier
  view.setUint32(0, 0x52494646, false); // 'RIFF'
  // file length minus 8
  view.setUint32(4, 36 + numSamples * 2, true);
  // WAVE identifier
  view.setUint32(8, 0x57415645, false); // 'WAVE'
  // format chunk identifier 'fmt '
  view.setUint32(12, 0x666d7420, false);
  // format chunk length
  view.setUint32(16, 16, true);
  // sample format (1 = PCM)
  view.setUint16(20, 1, true);
  // channel count (1 = Mono)
  view.setUint16(22, 1, true);
  // sample rate
  view.setUint32(24, sampleRate, true);
  // byte rate (sampleRate * 1 * 2)
  view.setUint32(28, sampleRate * 2, true);
  // block align
  view.setUint16(32, 2, true);
  // bits per sample
  view.setUint16(34, 16, true);
  // data chunk identifier 'data'
  view.setUint32(36, 0x64617461, false);
  // data chunk length
  view.setUint32(40, numSamples * 2, true);

  // Synthesize clean audio samples (dual sine 523.25 Hz & 783.99 Hz with gentle envelope)
  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    const s1 = Math.sin(2 * Math.PI * 523.25 * t);
    const s2 = Math.sin(2 * Math.PI * 783.99 * t) * 0.5;
    // Fade in and fade out envelope
    let env = 1.0;
    if (t < 0.05) env = t / 0.05;
    else if (t > durationSeconds - 0.05) env = (durationSeconds - t) / 0.05;

    const sample = (s1 + s2) * 0.3 * env;
    const clamped = Math.max(-1, Math.min(1, sample));
    const int16 = clamped < 0 ? clamped * 0x8000 : clamped * 0x7fff;
    view.setInt16(44 + i * 2, int16, true);
  }

  return new Blob([buffer], { type: 'audio/wav' });
}
