import { useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, RotateCcw } from 'lucide-react';
import { loadConfig } from '../store/config';
import { useBreathing } from '../hooks/useBreathing';
import { useWakeLock } from '../hooks/useWakeLock';
import { useSessions } from '../hooks/useSessions';
import { BreathingCircle } from '../components/BreathingCircle';
import styles from './Session.module.css';

export function Session() {
  const navigate = useNavigate();
  const config = loadConfig();
  const { save } = useSessions();
  const wakeLock = useWakeLock();

  const handleComplete = useCallback(
    (cycles: number) => {
      save({ duration: config.duration, completedCycles: cycles });
      wakeLock.release();
    },
    [save, config.duration, wakeLock]
  );

  const breathing = useBreathing({
    durationMinutes: config.duration,
    audioMode: config.audioMode,
    onComplete: handleComplete,
  });

  useEffect(() => {
    wakeLock.request();
    breathing.start();
    return () => {
      wakeLock.release();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleStop = () => {
    if (breathing.totalProgress > 0) {
      save({ duration: config.duration, completedCycles: breathing.cycleCount });
    }
    breathing.stop();
    wakeLock.release();
    navigate('/');
  };

  const handleRestart = () => {
    if (breathing.totalProgress > 0) {
      save({ duration: config.duration, completedCycles: breathing.cycleCount });
    }
    breathing.stop();
    setTimeout(() => breathing.start(), 80);
  };

  const isFinished = !breathing.isRunning && breathing.totalProgress >= 0.999;

  return (
    <div className={styles.container}>
      {/* Top controls */}
      <div className={styles.topControls}>
        <button onClick={handleRestart} aria-label="Restart session" className={styles.iconBtn}>
          <RotateCcw size={16} strokeWidth={1.5} />
        </button>
        <button onClick={handleStop} aria-label="End session" className={styles.iconBtn}>
          <X size={16} strokeWidth={1.5} />
        </button>
      </div>

      {/* Breathing circle */}
      <BreathingCircle
        phase={breathing.phase}
        totalProgress={breathing.totalProgress}
        cycleCount={breathing.cycleCount}
        timeRemaining={breathing.timeRemaining}
        phaseDuration={breathing.phaseDuration}
        phaseProgress={breathing.phaseProgress}
      />

      {/* Session complete overlay */}
      {isFinished && (
        <div className={styles.completeOverlay}>
          <div className={styles.completeTextWrapper}>
            <div className={styles.completeTitle}>Well done</div>
            <div className={styles.completeStats}>
              {breathing.cycleCount} cycle{breathing.cycleCount !== 1 ? 's' : ''} ·{' '}
              {config.duration} min
            </div>
          </div>
          <div className={styles.btnRow}>
            <button className={styles.ghostBtn} onClick={handleRestart}>
              Again
            </button>
            <button className={styles.primaryBtn} onClick={() => navigate('/')}>
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
