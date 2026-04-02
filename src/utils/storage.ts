import { MetronomeConfig, DEFAULT_CONFIG } from '../types';

const STORAGE_KEY = 'precision-metronome-v1';

export function saveConfig(config: MetronomeConfig): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  } catch {
    // Silently fail (private mode / quota exceeded)
  }
}

export function loadConfig(): MetronomeConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_CONFIG;
    const parsed = JSON.parse(raw) as Partial<MetronomeConfig>;
    return { ...DEFAULT_CONFIG, ...parsed };
  } catch {
    return DEFAULT_CONFIG;
  }
}
