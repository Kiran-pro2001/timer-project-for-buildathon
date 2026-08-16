/**
 * Synthesized "rocket launch → firework explosion" sound, built with the
 * Web Audio API so no audio files are needed and it works offline.
 *
 * Browsers only allow audio after a user gesture, so `unlockAudio()` should be
 * called from the first click/keypress (see Dashboard). After that the sound
 * can play from auto-triggered billboards too.
 */

let ctx: AudioContext | null = null;
let muted = false;

type WebkitWindow = Window & { webkitAudioContext?: typeof AudioContext };

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const AC = window.AudioContext || (window as WebkitWindow).webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

/** Prime the audio context on a user gesture so later playback isn't blocked. */
export function unlockAudio() {
  getCtx();
}

export function setMuted(m: boolean) {
  muted = m;
}

export function isMuted() {
  return muted;
}

function noiseBuffer(ac: AudioContext, duration: number): AudioBuffer {
  const len = Math.max(1, Math.floor(ac.sampleRate * duration));
  const buf = ac.createBuffer(1, len, ac.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
  return buf;
}

/** Play the full rocket-whistle + boom + crackle. Loud by design. */
export function playLaunchSound() {
  if (muted) return;
  const ac = getCtx();
  if (!ac) return;

  const t = ac.currentTime;

  // Limiter keeps things punchy and distortion-free even when driven hard.
  const limiter = ac.createDynamicsCompressor();
  limiter.threshold.value = -6;
  limiter.knee.value = 6;
  limiter.ratio.value = 20;
  limiter.attack.value = 0.002;
  limiter.release.value = 0.25;
  limiter.connect(ac.destination);

  const master = ac.createGain();
  master.gain.value = 2.6; // cranked — the limiter absorbs the peaks
  master.connect(limiter);

  // 1) Rising rocket whistle (ascent)
  const whistle = ac.createOscillator();
  whistle.type = "sawtooth";
  whistle.frequency.setValueAtTime(500, t);
  whistle.frequency.exponentialRampToValueAtTime(1700, t + 0.45);
  const wGain = ac.createGain();
  wGain.gain.setValueAtTime(0.0001, t);
  wGain.gain.exponentialRampToValueAtTime(0.3, t + 0.05);
  wGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.5);
  const wFilter = ac.createBiquadFilter();
  wFilter.type = "bandpass";
  wFilter.frequency.value = 1200;
  wFilter.Q.value = 6;
  whistle.connect(wFilter).connect(wGain).connect(master);
  whistle.start(t);
  whistle.stop(t + 0.5);

  // 2) Explosion boom
  const boomT = t + 0.48;
  const boom = ac.createOscillator();
  boom.type = "sine";
  boom.frequency.setValueAtTime(180, boomT);
  boom.frequency.exponentialRampToValueAtTime(40, boomT + 0.35);
  const bGain = ac.createGain();
  bGain.gain.setValueAtTime(0.0001, boomT);
  bGain.gain.exponentialRampToValueAtTime(1.0, boomT + 0.02);
  bGain.gain.exponentialRampToValueAtTime(0.0001, boomT + 0.55);
  boom.connect(bGain).connect(master);
  boom.start(boomT);
  boom.stop(boomT + 0.6);

  // 3) Explosion noise burst
  const burst = ac.createBufferSource();
  burst.buffer = noiseBuffer(ac, 0.6);
  const nGain = ac.createGain();
  nGain.gain.setValueAtTime(0.0001, boomT);
  nGain.gain.exponentialRampToValueAtTime(0.7, boomT + 0.01);
  nGain.gain.exponentialRampToValueAtTime(0.0001, boomT + 0.5);
  const nFilter = ac.createBiquadFilter();
  nFilter.type = "lowpass";
  nFilter.frequency.setValueAtTime(3200, boomT);
  nFilter.frequency.exponentialRampToValueAtTime(400, boomT + 0.5);
  burst.connect(nFilter).connect(nGain).connect(master);
  burst.start(boomT);
  burst.stop(boomT + 0.6);

  // 4) Crackling sparkles
  for (let i = 0; i < 14; i++) {
    const ct = boomT + 0.08 + Math.random() * 0.7;
    const c = ac.createBufferSource();
    c.buffer = noiseBuffer(ac, 0.05);
    const cg = ac.createGain();
    cg.gain.setValueAtTime(0.0001, ct);
    cg.gain.exponentialRampToValueAtTime(0.35, ct + 0.004);
    cg.gain.exponentialRampToValueAtTime(0.0001, ct + 0.05);
    const cf = ac.createBiquadFilter();
    cf.type = "highpass";
    cf.frequency.value = 2200;
    c.connect(cf).connect(cg).connect(master);
    c.start(ct);
    c.stop(ct + 0.06);
  }
}
