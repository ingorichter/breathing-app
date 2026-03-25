import { useMemo } from 'react';
import { Temporal } from '@js-temporal/polyfill';
import { Flame, Wind, Clock } from 'lucide-react';
import { useSessions } from '../hooks/useSessions';
import { SessionRecord } from '../types';
import styles from './Stats.module.css';

function formatDate(dateStr: string): string {
  return Temporal.PlainDate.from(dateStr).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

function totalMinutes(sessions: SessionRecord[]): number {
  return sessions.reduce((sum, s) => sum + s.duration, 0);
}

/** Last 35 days calendar grid */
function CalendarGrid({ sessions }: { sessions: SessionRecord[] }) {
  const dateSet = useMemo(() => new Set(sessions.map((s) => s.date)), [sessions]);

  const days = useMemo(() => {
    const arr: { date: string; active: boolean }[] = [];
    const today = Temporal.Now.plainDateISO();
    for (let i = 34; i >= 0; i--) {
      const str = today.subtract({ days: i }).toString();
      arr.push({ date: str, active: dateSet.has(str) });
    }
    return arr;
  }, [dateSet]);

  return (
    <div>
      <div className={styles.calLabel}>Last 35 days</div>
      <div className={styles.calGrid}>
        {days.map(({ date, active }) => (
          <div
            key={date}
            title={formatDate(date)}
            className={`${styles.calCell}${active ? ` ${styles.calCellActive}` : ''}`}
          />
        ))}
      </div>
      <div className={styles.calLegend}>
        <span className={styles.legendItem}>
          <span className={styles.legendDot} />
          No session
        </span>
        <span className={styles.legendItem}>
          <span className={`${styles.legendDot} ${styles.legendDotActive}`} />
          Session
        </span>
      </div>
    </div>
  );
}

export function Stats() {
  const { getAll, getStreak, getTotalCount } = useSessions();
  const sessions = useMemo(() => getAll().slice().reverse(), [getAll]);
  const streak = getStreak();
  const total = getTotalCount();
  const mins = totalMinutes(sessions);

  const STAT_CARDS = [
    {
      icon: Flame,
      value: streak,
      label: 'Streak',
      unit: 'days',
      colorClass: streak > 0 ? styles.statStreak : styles.statStreakEmpty,
    },
    { icon: Wind, value: total, label: 'Sessions', unit: '', colorClass: styles.statSessions },
    { icon: Clock, value: mins, label: 'Minutes', unit: '', colorClass: styles.statMinutes },
  ];

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <h2 className={styles.heading}>Your Practice</h2>
      </div>

      {/* Summary cards */}
      <div className={styles.summaryGrid}>
        {STAT_CARDS.map(({ icon: Icon, value, label, unit, colorClass }) => (
          <div key={label} className={`${styles.summaryCard} ${colorClass}`}>
            <Icon size={16} strokeWidth={1.5} className={styles.statIcon} />
            <div className={styles.statValue}>
              {value}
              {unit && <span className={styles.statUnit}>{unit}</span>}
            </div>
            <div className={styles.statLabel}>{label}</div>
          </div>
        ))}
      </div>

      {/* Calendar */}
      <div className={styles.calendarCard}>
        <CalendarGrid sessions={sessions} />
      </div>

      {/* Session history */}
      <div className={styles.historyCard}>
        <div className={styles.historyLabel}>History</div>

        {sessions.length === 0 ? (
          <div className={styles.emptyState}>No sessions yet — start breathing!</div>
        ) : (
          <div className={styles.historyList}>
            {sessions.slice(0, 30).map((s) => (
              <div key={s.id} className={styles.historyItem}>
                <span className={styles.historyDate}>{formatDate(s.date)}</span>
                <div className={styles.historyMeta}>
                  <span className={styles.historyCycles}>{s.completedCycles} cycles</span>
                  <span className={styles.historyDuration}>{s.duration} min</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
