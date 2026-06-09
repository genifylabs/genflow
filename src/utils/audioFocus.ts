// Native client-side Web Audio API Focus & Meditation Sound Synthesizer
// Completely local, procedural, zero-bandwidth, and offline-friendly.

let audioCtx: AudioContext | null = null;

// Sound states references
interface SoundNode {
  sourceNodes: any[];
  gainNode: GainNode;
  active: boolean;
}

const activeSounds: Record<string, SoundNode> = {};

function getAudioContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  if (audioCtx.state === "suspended") {
    audioCtx.resume();
  }
  return audioCtx;
}

// Procedural Brownian Noise Generator buffer
function createBrownianNoiseBuffer(ctx: AudioContext) {
  const bufferSize = 2 * ctx.sampleRate;
  const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const output = noiseBuffer.getChannelData(0);
  let lastOut = 0.0;
  
  for (let i = 0; i < bufferSize; i++) {
    const white = Math.random() * 2 - 1;
    // 1st-order brownian integration filter
    output[i] = (lastOut + (0.02 * white)) / 1.02;
    lastOut = output[i];
    output[i] *= 4.0; // compensate volume
  }
  return noiseBuffer;
}

// Procedural Pink Noise Generator buffer
function createPinkNoiseBuffer(ctx: AudioContext) {
  const bufferSize = 2 * ctx.sampleRate;
  const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const output = noiseBuffer.getChannelData(0);
  let b0, b1, b2, b3, b4, b5, b6;
  b0 = b1 = b2 = b3 = b4 = b5 = b6 = 0.0;
  
  for (let i = 0; i < bufferSize; i++) {
    const white = Math.random() * 2 - 1;
    b0 = 0.99886 * b0 + white * 0.0555179;
    b1 = 0.99332 * b1 + white * 0.0750759;
    b2 = 0.96900 * b2 + white * 0.1538520;
    b3 = 0.86650 * b3 + white * 0.3104856;
    b4 = 0.55000 * b4 + white * 0.5329522;
    b5 = -0.7616 * b5 - white * 0.0168980;
    output[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
    output[i] *= 0.11; // compensate volume
    b6 = white * 0.115926;
  }
  return noiseBuffer;
}

export const startFocusSound = (type: "binaural" | "waves" | "rain" | "space", volume: number) => {
  try {
    const ctx = getAudioContext();
    if (activeSounds[type]) {
      activeSounds[type].gainNode.gain.setValueAtTime(volume, ctx.currentTime);
      return;
    }

    const mainGain = ctx.createGain();
    mainGain.gain.setValueAtTime(volume, ctx.currentTime);
    mainGain.connect(ctx.destination);

    const sourceNodes: any[] = [];

    if (type === "binaural") {
      // theta wave (4Hz differential) to engage deep flow and target recall
      // left ear: 140Hz, right ear: 144Hz
      const splitter = ctx.createChannelMerger(2);
      
      const leftOsc = ctx.createOscillator();
      leftOsc.type = "sine";
      leftOsc.frequency.setValueAtTime(140, ctx.currentTime);
      
      const rightOsc = ctx.createOscillator();
      rightOsc.type = "sine";
      rightOsc.frequency.setValueAtTime(144, ctx.currentTime);

      const leftGain = ctx.createGain();
      const rightGain = ctx.createGain();
      leftGain.gain.setValueAtTime(0.5, ctx.currentTime);
      rightGain.gain.setValueAtTime(0.5, ctx.currentTime);

      leftOsc.connect(leftGain);
      rightOsc.connect(rightGain);
      
      leftGain.connect(splitter, 0, 0);
      rightGain.connect(splitter, 0, 1);
      
      splitter.connect(mainGain);
      
      leftOsc.start();
      rightOsc.start();
      
      sourceNodes.push(leftOsc, rightOsc);

    } else if (type === "waves") {
      // Oceanic periodic crests & troughs
      // Brownian base noise with sweeping resonant lowpass filter
      const noise = ctx.createBufferSource();
      noise.buffer = createBrownianNoiseBuffer(ctx);
      noise.loop = true;

      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.Q.setValueAtTime(1.5, ctx.currentTime);

      // Low frequency modulation (LFO) to sweep lowpass filter back & forth (breath style)
      const lfo = ctx.createOscillator();
      lfo.frequency.setValueAtTime(0.12, ctx.currentTime); // ~8 second wave period
      const lfoGain = ctx.createGain();
      lfoGain.gain.setValueAtTime(350, ctx.currentTime);   // sweep width

      lfo.connect(lfoGain);
      lfoGain.connect(filter.frequency);
      
      // Initial value
      filter.frequency.setValueAtTime(450, ctx.currentTime);

      noise.connect(filter);
      filter.connect(mainGain);
      
      lfo.start();
      noise.start();
      
      sourceNodes.push(noise, lfo);

    } else if (type === "rain") {
      // Pink rainfall with cozy static dampening
      const noise = ctx.createBufferSource();
      noise.buffer = createPinkNoiseBuffer(ctx);
      noise.loop = true;

      const bandpass = ctx.createBiquadFilter();
      bandpass.type = "bandpass";
      bandpass.frequency.setValueAtTime(1200, ctx.currentTime);
      bandpass.Q.setValueAtTime(0.4, ctx.currentTime);

      const lowpass = ctx.createBiquadFilter();
      lowpass.type = "lowpass";
      lowpass.frequency.setValueAtTime(2500, ctx.currentTime);

      noise.connect(bandpass);
      bandpass.connect(lowpass);
      lowpass.connect(mainGain);

      noise.start();
      
      sourceNodes.push(noise);

    } else if (type === "space") {
      // Deep resonant synth wash
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      
      osc1.type = "triangle";
      osc1.frequency.setValueAtTime(55, ctx.currentTime); // A1 note
      
      osc2.type = "sawtooth";
      osc2.frequency.setValueAtTime(55.5, ctx.currentTime); // detuned

      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(180, ctx.currentTime);
      filter.Q.setValueAtTime(3, ctx.currentTime);

      const lfo = ctx.createOscillator();
      lfo.frequency.setValueAtTime(0.08, ctx.currentTime);
      const lfoGain = ctx.createGain();
      lfoGain.gain.setValueAtTime(45, ctx.currentTime);

      lfo.connect(lfoGain);
      lfoGain.connect(filter.frequency);

      const oscGain = ctx.createGain();
      oscGain.gain.setValueAtTime(0.12, ctx.currentTime); // keep synth sub-bass smooth

      osc1.connect(oscGain);
      osc2.connect(oscGain);
      oscGain.connect(filter);
      filter.connect(mainGain);

      osc1.start();
      osc2.start();
      lfo.start();

      sourceNodes.push(osc1, osc2, lfo);
    }

    activeSounds[type] = {
      sourceNodes,
      gainNode: mainGain,
      active: true
    };
  } catch (e) {
    console.warn("Web Audio Context could not start:", e);
  }
};

export const setFocusSoundVolume = (type: "binaural" | "waves" | "rain" | "space", volume: number) => {
  const ctx = getAudioContext();
  if (activeSounds[type]) {
    activeSounds[type].gainNode.gain.setValueAtTime(volume, ctx.currentTime);
  }
};

export const stopFocusSound = (type: "binaural" | "waves" | "rain" | "space") => {
  if (activeSounds[type]) {
    try {
      activeSounds[type].sourceNodes.forEach((node) => node.stop());
    } catch (e) {}
    try {
      activeSounds[type].gainNode.disconnect();
    } catch (e) {}
    delete activeSounds[type];
  }
};

export const stopAllFocusSounds = () => {
  Object.keys(activeSounds).forEach((key) => {
    stopFocusSound(key as any);
  });
};
