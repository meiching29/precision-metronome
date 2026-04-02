import { useState, useCallback, useRef, useEffect } from 'react';
import { audioEngine, BeatEvent } from '../utils/audio-engine';
import { saveConfig, loadConfig } from '../utils/storage';
import {
  MetronomeConfig,
  TIME_SIGNATURES,
  TimeSignature,
  SoundType,
} from '../types';

const MAX_TAP_INTERVAL_MS = 3000;
const MIN_TAP_SAMPLES = 2;
const MAX_TAP_SAMPLES = 8;

export function useMetronome() {
  const [config, setConfig] = useState<MetronomeConfig>(() => loadConfig());
  const [isPlaying, setIsPlaying] = useState(false);

  // Usamos objeto con counter para forzar re-render incluso cuando beat === 0 siempre (1/1)
  const [beatState, setBeatState] = useState<{ beat: number; isAccent: boolean; tick: number }>({
    beat: -1, isAccent: false, tick: 0,
  });

  const configRef = useRef(config);
  useEffect(() => { configRef.current = config; }, [config]);

  const barCountRef = useRef(0);
  const tapTimesRef = useRef<number[]>([]);

  useEffect(() => { saveConfig(config); }, [config]);

  const handleBeat = useCallback((event: BeatEvent) => {
    const delta = Math.max(0, (event.time - audioEngine.currentTime) * 1000);

    setTimeout(() => {
      // tick siempre incrementa
      setBeatState(prev => ({ beat: event.beat, isAccent: event.isAccent, tick: prev.tick + 1 }));
      if (event.beat === 0) barCountRef.current += 1;
    }, delta);

    const cfg = configRef.current;
    if (cfg.practiceMode && event.beat === 0 && barCountRef.current > 0) {
      if (barCountRef.current % cfg.practiceBars === 0) {
        setConfig(prev => {
          const nextBpm = Math.min(prev.bpm + prev.practiceIncrement, prev.practiceTargetBpm);
          if (nextBpm !== prev.bpm) audioEngine.updateBpm(nextBpm);
          return { ...prev, bpm: nextBpm };
        });
      }
    }
  }, []);

  const start = useCallback((overrideConfig?: Partial<MetronomeConfig>) => {
    const cfg = { ...configRef.current, ...overrideConfig };
    barCountRef.current = 0;
    audioEngine.start(cfg.bpm, cfg.timeSignature.beats, cfg.soundType, cfg.volume, handleBeat);
    setIsPlaying(true);
    setBeatState({ beat: -1, isAccent: false, tick: 0 });
  }, [handleBeat]);

  const stop = useCallback(() => {
    audioEngine.stop();
    setIsPlaying(false);
    setBeatState({ beat: -1, isAccent: false, tick: 0 });
    barCountRef.current = 0;
  }, []);

  const toggle = useCallback(() => {
    isPlaying ? stop() : start();
  }, [isPlaying, start, stop]);

  const setBpm = useCallback((bpm: number) => {
    const clamped = Math.min(220, Math.max(40, bpm));
    setConfig(prev => ({ ...prev, bpm: clamped }));
    audioEngine.updateBpm(clamped);
  }, []);

  const setTimeSignature = useCallback((ts: TimeSignature) => {
    setConfig(prev => ({ ...prev, timeSignature: ts }));
    if (isPlaying) {
      audioEngine.stop();
      setTimeout(() => {
        barCountRef.current = 0;
        const cfg = configRef.current;
        audioEngine.start(cfg.bpm, ts.beats, cfg.soundType, cfg.volume, handleBeat);
      }, 30);
    }
  }, [isPlaying, handleBeat]);

  const setSoundType = useCallback((soundType: SoundType) => {
    setConfig(prev => ({ ...prev, soundType }));
    audioEngine.updateSound(soundType);
  }, []);

  const setVolume = useCallback((volume: number) => {
    setConfig(prev => ({ ...prev, volume }));
    audioEngine.updateVolume(volume);
  }, []);

  const setPracticeMode = useCallback((enabled: boolean) => {
    setConfig(prev => ({ ...prev, practiceMode: enabled }));
    barCountRef.current = 0;
  }, []);

  const setPracticeIncrement = useCallback((v: number) => {
    setConfig(prev => ({ ...prev, practiceIncrement: v }));
  }, []);

  const setPracticeBars = useCallback((v: number) => {
    setConfig(prev => ({ ...prev, practiceBars: v }));
  }, []);

  const setPracticeTargetBpm = useCallback((v: number) => {
    setConfig(prev => ({ ...prev, practiceTargetBpm: Math.min(220, Math.max(configRef.current.bpm, v)) }));
  }, []);

  const tap = useCallback(() => {
    const now = performance.now();
    const taps = tapTimesRef.current;
    if (taps.length > 0 && now - taps[taps.length - 1] > MAX_TAP_INTERVAL_MS) {
      tapTimesRef.current = [];
    }
    tapTimesRef.current.push(now);
    if (tapTimesRef.current.length > MAX_TAP_SAMPLES) {
      tapTimesRef.current = tapTimesRef.current.slice(-MAX_TAP_SAMPLES);
    }
    if (tapTimesRef.current.length >= MIN_TAP_SAMPLES) {
      const times = tapTimesRef.current;
      let total = 0;
      for (let i = 1; i < times.length; i++) total += times[i] - times[i - 1];
      const newBpm = Math.round(60000 / (total / (times.length - 1)));
      setBpm(newBpm);
    }
  }, [setBpm]);

  return {
    config, isPlaying,
    activeBeat: beatState.beat,
    isAccentBeat: beatState.isAccent,
    beatTick: beatState.tick,
    toggle, start, stop, tap,
    setBpm, setTimeSignature, setSoundType, setVolume,
    setPracticeMode, setPracticeIncrement, setPracticeBars, setPracticeTargetBpm,
    timeSignatures: TIME_SIGNATURES,
  };
}