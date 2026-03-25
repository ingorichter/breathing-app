import { useCallback } from 'react';
import { SessionRecord } from '../types';

const STORAGE_KEY = 'breathing-sessions';
const MS_PER_DAY  = 86_400_000;

function toDateStr(ts?: number): string {
  const d = ts !== undefined ? new Date(ts) : new Date();
  return d.toISOString().slice(0, 10); // YYYY-MM-DD
}

export function useSessions() {
  const getAll = useCallback((): SessionRecord[] => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]') as SessionRecord[];
    } catch {
      return [];
    }
  }, []);

  const save = useCallback(
    (partial: Omit<SessionRecord, 'id' | 'date' | 'timestamp'>): SessionRecord => {
      const all = getAll();
      const record: SessionRecord = {
        ...partial,
        id:        crypto.randomUUID(),
        date:      toDateStr(),
        timestamp: Date.now(),
      };
      all.push(record);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
      return record;
    },
    [getAll],
  );

  /**
   * Current streak = number of consecutive calendar days (ending today or
   * yesterday) that contain at least one completed session.
   */
  const getStreak = useCallback((): number => {
    const all = getAll();
    if (all.length === 0) return 0;

    // Unique dates, newest first
    const dates = [...new Set(all.map(s => s.date))].sort().reverse();

    const today     = toDateStr();
    const yesterday = toDateStr(Date.now() - MS_PER_DAY);

    // Streak must touch today or yesterday to be "active"
    if (dates[0] !== today && dates[0] !== yesterday) return 0;

    let streak = 1;
    for (let i = 0; i < dates.length - 1; i++) {
      const cur  = new Date(dates[i]).getTime();
      const prev = new Date(dates[i + 1]).getTime();
      if (Math.round((cur - prev) / MS_PER_DAY) === 1) {
        streak++;
      } else {
        break;
      }
    }
    return streak;
  }, [getAll]);

  const getTotalCount = useCallback(() => getAll().length, [getAll]);

  return { getAll, save, getStreak, getTotalCount };
}
