import { useCallback, useRef } from 'react';
import { AudioMode, BreathPhase } from '../types';

// Approximate inharmonic partial ratios of a real Tibetan singing bowl
const BOWL_PARTIALS = [
  { ratio: 1, gain: 0.5 },
  { ratio: 2.756, gain: 0.28 },
  { ratio: 5.404, gain: 0.12 },
];

// Fundamental Hz per phase — chosen for a calming progression
const BOWL_FREQ: Record<Exclude<BreathPhase, 'idle'>, number> = {
  inhale: 396, // F — grounding, inviting inward breath
  hold: 528, // C — resonant stillness
  exhale: 285, // D — lower, releasing
};

const TONE_FREQ: Record<Exclude<BreathPhase, 'idle'>, number> = {
  inhale: 440,
  hold: 528,
  exhale: 330,
};

export function useAudio(mode: AudioMode) {
  const ctxRef = useRef<AudioContext | null>(null);

  const getCtx = useCallback(async (): Promise<AudioContext> => {
    if (!ctxRef.current || ctxRef.current.state === 'closed') {
      ctxRef.current = new AudioContext();
    }
    if (ctxRef.current.state === 'suspended') {
      await ctxRef.current.resume();
    }
    return ctxRef.current;
  }, []);


  /** Singing-bowl synthesis: layered sine harmonics with exponential decay */
  const playBowl = useCallback(
    async (phase: Exclude<BreathPhase, 'idle'>) => {
      const ctx = await getCtx();
      const f0 = BOWL_FREQ[phase];
      const decay = 3.2; // seconds for the tail

      // Masterbus gain so bowl isn't too loud
      const master = ctx.createGain();
      master.gain.value = 0.55;
      master.connect(ctx.destination);

      BOWL_PARTIALS.forEach(({ ratio, gain }) => {
        const osc = ctx.createOscillator();
        const gNode = ctx.createGain();

        osc.connect(gNode);
        gNode.connect(master);

        osc.type = 'sine';
        osc.frequency.value = f0 * ratio;

        // Short physical attack (mallet strike)
        gNode.gain.setValueAtTime(0, ctx.currentTime);
        gNode.gain.linearRampToValueAtTime(gain, ctx.currentTime + 0.06);
        // Exponential decay — bowl rings out naturally
        gNode.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + decay);

        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + decay + 0.05);
      });
    },
    [getCtx]
  );

  /** Simple sine tone with fast envelope */
  const playTone = useCallback(
    async (phase: Exclude<BreathPhase, 'idle'>) => {
      const ctx = await getCtx();
      const osc = ctx.createOscillator();
      const gNode = ctx.createGain();

      osc.connect(gNode);
      gNode.connect(ctx.destination);

      osc.type = 'sine';
      osc.frequency.value = TONE_FREQ[phase];

      gNode.gain.setValueAtTime(0.3, ctx.currentTime);
      gNode.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.55);

      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.6);
    },
    [getCtx]
  );

  const playPhase = useCallback(
    (phase: Exclude<BreathPhase, 'idle'>) => {
      if (mode === 'visual') return;
      if (mode === 'bowl') playBowl(phase);
      if (mode === 'tone') playTone(phase);
    },
    [mode, playBowl, playTone]
  );

  return { playPhase };
}
