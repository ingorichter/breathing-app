import { useCallback } from 'react';
import { Temporal } from '@js-temporal/polyfill';
import { SessionRecord } from '../types';

const STORAGE_KEY = 'breathing-sessions';

function todayStr(): string {
  return Temporal.Now.plainDateISO().toString();
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
    (partial: Omit<SessionRecord, 'id' | 'date' | 'timestamp'>): SessionRecord | null => {
      try {
        const all = getAll();
        const record: SessionRecord = {
          ...partial,
          id: crypto.randomUUID(),
          date: todayStr(),
          timestamp: Temporal.Now.instant().epochMilliseconds,
        };
        all.push(record);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
        return record;
      } catch (err) {
        console.error('[useSessions] failed to save session:', err);
        return null;
      }
    },
    [getAll]
  );

  /**
   * Current streak = number of consecutive calendar days (ending today or
   * yesterday) that contain at least one completed session.
   */
  const getStreak = useCallback((): number => {
    const all = getAll();
    if (all.length === 0) return 0;

    // Unique dates, newest first
    const dates = [...new Set(all.map((s) => s.date))].sort().reverse();

    const today = Temporal.Now.plainDateISO();
    const yesterday = today.subtract({ days: 1 });

    // Streak must touch today or yesterday to be "active"
    if (dates[0] !== today.toString() && dates[0] !== yesterday.toString()) return 0;

    let streak = 1;
    for (let i = 0; i < dates.length - 1; i++) {
      const cur = Temporal.PlainDate.from(dates[i]);
      const prev = Temporal.PlainDate.from(dates[i + 1]);
      if (prev.until(cur).days === 1) {
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
