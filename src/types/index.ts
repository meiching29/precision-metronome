// Sound Profiles
export type SoundType = 'click' | 'woodblock' | 'hihat';

// Time Signatures
export interface TimeSignature {
  beats: number;
  value: number;
  label: string;
}

export const TIME_SIGNATURES: TimeSignature[] = [
  { beats: 1, value: 1, label: '1/1' },
  { beats: 2, value: 4, label: '2/4' },
  { beats: 3, value: 4, label: '3/4' },
  { beats: 4, value: 4, label: '4/4' },
  { beats: 6, value: 8, label: '6/8' },
  { beats: 5, value: 4, label: '5/4' },
  { beats: 7, value: 8, label: '7/8' },
];

// Metronome Config
export interface MetronomeConfig {
  bpm: number;
  timeSignature: TimeSignature;
  soundType: SoundType;
  volume: number;
  // Practice mode
  practiceMode: boolean;
  practiceIncrement: number;   // BPM to add every N bars
  practiceBars: number;        // bars before incrementing
  practiceTargetBpm: number;
}

export const DEFAULT_CONFIG: MetronomeConfig = {
  bpm: 120,
  timeSignature: TIME_SIGNATURES[2], // 4/4
  soundType: 'click',
  volume: 0.8,
  practiceMode: false,
  practiceIncrement: 5,
  practiceBars: 4,
  practiceTargetBpm: 160,
};

// Scheduler Constants
// How far ahead (seconds) to schedule audio events
export const LOOKAHEAD_TIME = 0.1;
// How often (ms) to call the scheduler
export const SCHEDULER_INTERVAL = 25;
