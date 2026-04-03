/**
 * audio-engine.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Precision metronome audio engine using the Web Audio API.
 *
 * HOW PRECISION TIMING WORKS:
 * ─────────────────────────────────────────────────────────────────────────────
 * JavaScript's setInterval / setTimeout suffer from "timer drift" because the
 * main thread can be blocked by rendering, GC, or other tasks. The Web Audio
 * API, by contrast, runs on a dedicated audio thread with a hardware clock
 * exposed via `AudioContext.currentTime` (sub-millisecond precision).
 *
 * We use the classic "double-buffering" scheduler pattern:
 *   1. A lightweight `setInterval` wakes up every SCHEDULER_INTERVAL ms.
 *   2. On each tick, it looks LOOKAHEAD_TIME seconds into the future.
 *   3. Any beats that fall within that window are scheduled via
 *      `OscillatorNode.start(absoluteTime)` — an absolute audio-clock time,
 *      not a relative delay.
 *   4. The interval wakes up again before the scheduled events play, ensuring
 *      seamless playback even if the JS thread stalls for a frame or two.
 *
 * Result: ±1–2 ms jitter instead of the ±10–50 ms you'd get with setInterval.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { SoundType } from '../types';

export interface BeatEvent {
  beat: number;      // 0-indexed beat within the bar
  isAccent: boolean; // true for beat 0
  time: number;      // AudioContext absolute time
}

export type BeatCallback = (event: BeatEvent) => void;

// Sound Synthesis Helpers 

function synthesizeClick(ctx: AudioContext, time: number, isAccent: boolean, volume: number) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.frequency.value = isAccent ? 1200 : 800;
  osc.type = 'sine';

  gain.gain.setValueAtTime(0, time);
  gain.gain.linearRampToValueAtTime(volume, time + 0.002);
  gain.gain.exponentialRampToValueAtTime(0.001, time + 0.06);

  osc.start(time);
  osc.stop(time + 0.07);
}

function synthesizeWoodblock(ctx: AudioContext, time: number, isAccent: boolean, volume: number) {
  const bufferSize = ctx.sampleRate * 0.08;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);

  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.02));
  }

  const source = ctx.createBufferSource();
  source.buffer = buffer;

  const bpf = ctx.createBiquadFilter();
  bpf.type = 'bandpass';
  bpf.frequency.value = isAccent ? 900 : 600;
  bpf.Q.value = 3;

  const gain = ctx.createGain();
  gain.gain.value = volume * (isAccent ? 1.4 : 1.0);

  source.connect(bpf);
  bpf.connect(gain);
  gain.connect(ctx.destination);

  source.start(time);
}

function synthesizeHihat(ctx: AudioContext, time: number, isAccent: boolean, volume: number) {
  const bufferSize = ctx.sampleRate * 0.1;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);

  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }

  const source = ctx.createBufferSource();
  source.buffer = buffer;

  const hpf = ctx.createBiquadFilter();
  hpf.type = 'highpass';
  hpf.frequency.value = isAccent ? 8000 : 10000;

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(volume * (isAccent ? 1.3 : 0.9), time);
  gain.gain.exponentialRampToValueAtTime(0.001, time + (isAccent ? 0.09 : 0.06));

  source.connect(hpf);
  hpf.connect(gain);
  gain.connect(ctx.destination);

  source.start(time);
  source.stop(time + 0.1);
}

// AudioEngine Class 

export class AudioEngine {
  private ctx: AudioContext | null = null;
  private schedulerTimer: ReturnType<typeof setInterval> | null = null;

  private bpm = 120;
  private beatsPerBar = 4;
  private soundType: SoundType = 'click';
  private volume = 0.8;

  private currentBeat = 0;
  private nextBeatTime = 0;
  private isRunning = false;

  private readonly lookahead = 0.1; // seconds to look ahead
  private readonly scheduleInterval = 25; // ms between scheduler ticks

  private onBeat: BeatCallback | null = null;

  // Lifecycle 

  start(bpm: number, beatsPerBar: number, soundType: SoundType, volume: number, onBeat: BeatCallback) {
    this.stopInternal();

    this.ctx = new AudioContext();

    // Fix móvil: algunos browsers requieren resume() explícito después de crear el contexto
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    this.bpm = bpm;
    this.beatsPerBar = beatsPerBar;
    this.soundType = soundType;
    this.volume = volume;
    this.onBeat = onBeat;

    this.currentBeat = 0;
    this.nextBeatTime = this.ctx.currentTime + 0.05;
    this.isRunning = true;

    this.schedulerTimer = setInterval(() => this.schedule(), this.scheduleInterval);
  }

  stop() {
    this.stopInternal();
  }

  // Interno: limpia timer y suspende contexto sin destruirlo
  private stopInternal() {
    this.isRunning = false;

    if (this.schedulerTimer !== null) {
      clearInterval(this.schedulerTimer);
      this.schedulerTimer = null;
    }

    if (this.ctx) {
      // suspend() en lugar de close() — evita contextos zombie
      // y permite que el GC lo limpie sin errores
      this.ctx.suspend().catch(() => { });
      this.ctx = null;
    }
  }

  // Setters en caliente (sin reiniciar) 

  updateBpm(bpm: number) {
    this.bpm = bpm;
  }

  updateVolume(vol: number) {
    this.volume = vol;
  }

  updateSound(soundType: SoundType) {
    this.soundType = soundType;
  }

  get running() {
    return this.isRunning;
  }

  // Core Scheduler 

  private schedule() {
    if (!this.ctx || !this.isRunning) return;

    const now = this.ctx.currentTime;
    const secondsPerBeat = 60 / this.bpm;

    while (this.nextBeatTime < now + this.lookahead) {
      const isAccent = this.currentBeat === 0;
      const beatTime = this.nextBeatTime;
      const beatIndex = this.currentBeat;

      this.playSoundAt(beatTime, isAccent);

      if (this.onBeat) {
        this.onBeat({ beat: beatIndex, isAccent, time: beatTime });
      }

      this.currentBeat = (this.currentBeat + 1) % this.beatsPerBar;
      this.nextBeatTime += secondsPerBeat;
    }
  }

  private playSoundAt(time: number, isAccent: boolean) {
    if (!this.ctx) return;
    switch (this.soundType) {
      case 'click': synthesizeClick(this.ctx, time, isAccent, this.volume); break;
      case 'woodblock': synthesizeWoodblock(this.ctx, time, isAccent, this.volume); break;
      case 'hihat': synthesizeHihat(this.ctx, time, isAccent, this.volume); break;
    }
  }

  // Reloj para sincronizar UI 

  get currentTime(): number {
    return this.ctx?.currentTime ?? 0;
  }
}

// Singleton — una sola instancia por app
export const audioEngine = new AudioEngine();