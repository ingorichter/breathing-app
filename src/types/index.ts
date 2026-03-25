export type AudioMode = 'bowl' | 'tone' | 'visual';
export type BreathPhase = 'idle' | 'inhale' | 'hold' | 'exhale';

export interface SessionConfig {
  duration: number; // minutes, 1–60
  audioMode: AudioMode;
}

export interface SessionRecord {
  id: string;
  date: string; // YYYY-MM-DD
  duration: number; // configured minutes
  completedCycles: number;
  timestamp: number; // unix ms — for sorting
}
