import { useNavigate } from 'react-router-dom';
import { Wind, Flame, Layers } from 'lucide-react';
import { useSessions } from '../hooks/useSessions';
import { loadConfig } from '../store/config';
import styles from './Home.module.css';

export function Home() {
  const navigate = useNavigate();
  const { getStreak, getTotalCount } = useSessions();

  const streak = getStreak();
  const total = getTotalCount();
  const config = loadConfig();

  return (
    <div className={styles.page}>
      {/* Logo / Title */}
      <div className={styles.logoWrapper}>
        <Wind size={36} strokeWidth={1} className={styles.windIcon} />
        <h1 className={styles.title}>4 · 7 · 8</h1>
        <p className={styles.subtitle}>Breathing</p>
      </div>

      {/* Stat badges */}
      <div className={styles.statBadges}>
        <div className={`${styles.streakBadge}${streak > 0 ? ` ${styles.streakBadgeActive}` : ''}`}>
          <Flame size={14} strokeWidth={1.5} />
          {streak > 0 ? `${streak} day streak` : 'No streak yet'}
        </div>

        <div className={styles.sessionsBadge}>
          <Layers size={14} strokeWidth={1.5} />
          {total} session{total !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Start button */}
      <div className={styles.buttonGroup}>
        <button className={styles.primaryBtn} onClick={() => navigate('/session')}>
          Begin · {config.duration} min
        </button>
        <button className={styles.ghostBtn} onClick={() => navigate('/setup')}>
          Change settings
        </button>
      </div>

      {/* Pattern reminder */}
      <div className={styles.patternCard}>
        {[
          { label: 'Inhale', value: '4s' },
          { label: 'Hold', value: '7s' },
          { label: 'Exhale', value: '8s' },
        ].map(({ label, value }) => (
          <div key={label} className={styles.patternItem}>
            <div className={styles.patternValue}>{value}</div>
            <div className={styles.patternLabel}>{label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
