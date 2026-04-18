import { useCallback, useEffect, useRef, useState } from 'react';
import { AudioMode, BreathPhase } from '../types';
import { useAudio } from './useAudio';
import { useHaptics } from './useHaptics';

// Keep in sync with CSS --dur-* variables in index.css
export const PHASE_DURATIONS: Record<Exclude<BreathPhase, 'idle'>, number> = {
  inhale: 4,
  hold: 7,
  exhale: 8,
};

const SEQUENCE: Exclude<BreathPhase, 'idle'>[] = ['inhale', 'hold', 'exhale'];
const TICK_MS = 50;

interface Options {
  durationMinutes: number;
  audioMode: AudioMode;
  onComplete: (cycles: number) => void;
}

export function useBreathing({ durationMinutes, audioMode, onComplete }: Options) {
  const [phase, setPhase] = useState<BreathPhase>('idle');
  const [cycleCount, setCycleCount] = useState(0);
  const [phaseProgress, setPhaseProgress] = useState(0); // 0–1 within current phase
  const [totalProgress, setTotalProgress] = useState(0); // 0–1 across whole session
  const [timeRemaining, setTimeRemaining] = useState(durationMinutes * 60);
  const [isRunning, setIsRunning] = useState(false);

  const phaseIdxRef = useRef(0);
  const phaseElapsedRef = useRef(0);
  const totalElapsedRef = useRef(0);
  const cycleRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const totalSeconds = durationMinutes * 60;

  const { playPhase, playGong } = useAudio(audioMode);
  const { vibrate } = useHaptics();

  const enterPhase = useCallback(
    (idx: number) => {
      const p = SEQUENCE[idx];
      setPhase(p);
      phaseElapsedRef.current = 0;
      setPhaseProgress(0);
      playPhase(p);
      vibrate(p);
    },
    [playPhase, vibrate]
  );

  const start = useCallback(() => {
    phaseIdxRef.current = 0;
    phaseElapsedRef.current = 0;
    totalElapsedRef.current = 0;
    cycleRef.current = 0;
    setCycleCount(0);
    setTotalProgress(0);
    setTimeRemaining(totalSeconds);
    setIsRunning(true);
    enterPhase(0);
  }, [enterPhase, totalSeconds]);

  const stop = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    setIsRunning(false);
    setPhase('idle');
    setPhaseProgress(0);
  }, []);

  useEffect(() => {
    if (!isRunning) return;

    const tickSec = TICK_MS / 1000;

    timerRef.current = setInterval(() => {
      phaseElapsedRef.current += tickSec;
      totalElapsedRef.current += tickSec;

      const remaining = Math.max(0, totalSeconds - totalElapsedRef.current);
      setTimeRemaining(Math.ceil(remaining));
      setTotalProgress(Math.min(totalElapsedRef.current / totalSeconds, 1));

      const curPhase = SEQUENCE[phaseIdxRef.current];
      const dur = PHASE_DURATIONS[curPhase];
      setPhaseProgress(Math.min(phaseElapsedRef.current / dur, 1));

      // Session complete
      if (totalElapsedRef.current >= totalSeconds) {
        clearInterval(timerRef.current!);
        setIsRunning(false);
        setPhase('idle');
        playGong();
        onComplete(cycleRef.current);
        return;
      }

      // Advance phase
      if (phaseElapsedRef.current >= dur) {
        phaseIdxRef.current = (phaseIdxRef.current + 1) % SEQUENCE.length;
        if (phaseIdxRef.current === 0) {
          cycleRef.current += 1;
          setCycleCount(cycleRef.current);
        }
        enterPhase(phaseIdxRef.current);
      }
    }, TICK_MS);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, totalSeconds, enterPhase, onComplete, playGong]);

  return {
    phase,
    cycleCount,
    phaseProgress,
    totalProgress,
    timeRemaining,
    isRunning,
    phaseDuration: phase === 'idle' ? 0 : PHASE_DURATIONS[phase as Exclude<BreathPhase, 'idle'>],
    start,
    stop,
  };
}
