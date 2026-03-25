import { useCallback } from 'react';
import { BreathPhase } from '../types';

// Vibration patterns: ms on / ms off / ms on …
const PATTERNS: Record<Exclude<BreathPhase, 'idle'>, number[]> = {
  inhale: [60], // gentle single pulse — begin inhale
  hold: [30, 60, 30, 60, 30], // soft triple tap — hold
  exhale: [120], // longer release pulse — exhale
};

export function useHaptics() {
  const vibrate = useCallback((phase: Exclude<BreathPhase, 'idle'>) => {
    if ('vibrate' in navigator) {
      navigator.vibrate(PATTERNS[phase]);
    }
  }, []);

  return { vibrate };
}
