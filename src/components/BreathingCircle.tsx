import { useMemo } from 'react';
import { BreathPhase } from '../types';
import styles from './BreathingCircle.module.css';

interface Props {
  phase: BreathPhase;
  totalProgress: number; // 0–1
  cycleCount: number;
  timeRemaining: number; // seconds
  phaseDuration: number; // seconds
  phaseProgress: number; // 0–1
}

const PHASE_LABELS: Record<BreathPhase, string> = {
  idle:   '',
  inhale: 'Breathe In',
  hold:   'Hold',
  exhale: 'Breathe Out',
};

const PHASE_LABEL_CLASS: Record<BreathPhase, string> = {
  idle:   '',
  inhale: styles.phaseLabelInhale,
  hold:   styles.phaseLabelHold,
  exhale: styles.phaseLabelExhale,
};

const PHASE_RING_CLASS: Record<BreathPhase, string> = {
  idle:   '',
  inhale: styles.breathRingInhale,
  hold:   styles.breathRingHold,
  exhale: styles.breathRingExhale,
};

function formatTime(s: number): string {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return m > 0
    ? `${m}:${String(sec).padStart(2, '0')}`
    : `${sec}s`;
}

const SVG_SIZE  = 340;
const CENTER    = SVG_SIZE / 2;
const PROG_R    = 154;
const PROG_CIRC = 2 * Math.PI * PROG_R;

export function BreathingCircle({
  phase,
  totalProgress,
  cycleCount,
  timeRemaining,
  phaseDuration,
  phaseProgress,
}: Props) {
  const strokeDashoffset = useMemo(
    () => PROG_CIRC * (1 - totalProgress),
    [totalProgress],
  );

  const phaseSecondsLeft = phase === 'idle'
    ? 0
    : Math.ceil(phaseDuration * (1 - phaseProgress));

  return (
    <div className={styles.wrapper}>

      {/* ── Outer SVG progress ring ── */}
      <svg
        width={SVG_SIZE}
        height={SVG_SIZE}
        viewBox={`0 0 ${SVG_SIZE} ${SVG_SIZE}`}
        className={styles.progressRing}
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="arcGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%"   stopColor="var(--ocean-deep)" stopOpacity="0.6" />
            <stop offset="100%" stopColor="var(--sage)"       stopOpacity="0.9" />
          </linearGradient>
        </defs>

        {/* Track */}
        <circle
          cx={CENTER} cy={CENTER} r={PROG_R}
          fill="none"
          stroke="rgba(27,73,101,0.25)"
          strokeWidth="2"
        />

        {/* Progress arc */}
        <circle
          cx={CENTER} cy={CENTER} r={PROG_R}
          fill="none"
          stroke="url(#arcGrad)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeDasharray={PROG_CIRC}
          strokeDashoffset={strokeDashoffset}
          className={styles.progressArc}
        />
      </svg>

      {/* ── Breathing ring ── */}
      <div className={styles.breathWrapper}>
        <div className={`${styles.breathRing} ${PHASE_RING_CLASS[phase]}`} />
      </div>

      {/* ── Center text overlay ── */}
      <div className={styles.centerOverlay}>
        {phase !== 'idle' ? (
          <>
            <span className={`${styles.phaseLabel} ${PHASE_LABEL_CLASS[phase]}`}>
              {PHASE_LABELS[phase]}
            </span>
            <span className={styles.phaseTimer}>
              {phaseSecondsLeft}
            </span>
          </>
        ) : (
          <span className={styles.idleLabel}>ready</span>
        )}
      </div>

      {/* ── Below-circle stats ── */}
      <div className={styles.statsBelow}>
        <span className={styles.cycleCount}>
          {cycleCount > 0 ? `${cycleCount} cycle${cycleCount !== 1 ? 's' : ''}` : '\u00a0'}
        </span>
        <span className={styles.timeRemaining}>
          {phase !== 'idle' ? formatTime(timeRemaining) + ' left' : ''}
        </span>
      </div>
    </div>
  );
}
