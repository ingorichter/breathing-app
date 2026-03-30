import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSessions } from './useSessions';
import type { SessionRecord } from '../types';

// Fix "today" to a known date so streak logic is deterministic
const FIXED_DATE = '2026-03-29';
const FIXED_EPOCH_MS = 1743206400000;

vi.mock('@js-temporal/polyfill', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@js-temporal/polyfill')>();
  return {
    ...actual,
    Temporal: {
      ...actual.Temporal,
      Now: {
        plainDateISO: () => actual.Temporal.PlainDate.from(FIXED_DATE),
        instant: () => actual.Temporal.Instant.fromEpochMilliseconds(FIXED_EPOCH_MS),
      },
    },
  };
});

describe('useSessions', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('getAll returns empty array when storage is empty', () => {
    const { result } = renderHook(() => useSessions());
    expect(result.current.getAll()).toEqual([]);
  });

  it('save persists a session and returns the record', () => {
    const { result } = renderHook(() => useSessions());
    let record: SessionRecord | null = null;

    act(() => {
      record = result.current.save({ duration: 5, completedCycles: 3 });
    });

    expect(record).not.toBeNull();
    const r = record!;
    expect(r.date).toBe(FIXED_DATE);
    expect(r.duration).toBe(5);
    expect(r.completedCycles).toBe(3);
    expect(r.id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/);
  });

  it('getTotalCount reflects saved sessions', () => {
    const { result } = renderHook(() => useSessions());

    act(() => {
      result.current.save({ duration: 5, completedCycles: 3 });
      result.current.save({ duration: 10, completedCycles: 7 });
    });

    expect(result.current.getTotalCount()).toBe(2);
  });

  it('getStreak returns 0 with no sessions', () => {
    const { result } = renderHook(() => useSessions());
    expect(result.current.getStreak()).toBe(0);
  });

  it('getStreak returns 1 for a session today', () => {
    const { result } = renderHook(() => useSessions());

    act(() => {
      result.current.save({ duration: 5, completedCycles: 3 });
    });

    expect(result.current.getStreak()).toBe(1);
  });

  it('getStreak counts consecutive days', () => {
    const records: SessionRecord[] = [
      { id: 'id-0', date: '2026-03-29', duration: 5, completedCycles: 3, timestamp: FIXED_EPOCH_MS },
      { id: 'id-1', date: '2026-03-28', duration: 5, completedCycles: 3, timestamp: FIXED_EPOCH_MS - 86400000 },
      { id: 'id-2', date: '2026-03-27', duration: 5, completedCycles: 3, timestamp: FIXED_EPOCH_MS - 172800000 },
    ];
    localStorage.setItem('breathing-sessions', JSON.stringify(records));

    const { result } = renderHook(() => useSessions());
    expect(result.current.getStreak()).toBe(3);
  });

  it('getStreak breaks on a gap', () => {
    const records: SessionRecord[] = [
      { id: 'id-0', date: '2026-03-29', duration: 5, completedCycles: 3, timestamp: FIXED_EPOCH_MS },
      // gap: 2026-03-28 missing
      { id: 'id-1', date: '2026-03-27', duration: 5, completedCycles: 3, timestamp: FIXED_EPOCH_MS - 172800000 },
    ];
    localStorage.setItem('breathing-sessions', JSON.stringify(records));

    const { result } = renderHook(() => useSessions());
    expect(result.current.getStreak()).toBe(1);
  });

  it('getAll returns [] when localStorage contains invalid JSON', () => {
    localStorage.setItem('breathing-sessions', 'not-json');
    const { result } = renderHook(() => useSessions());
    expect(result.current.getAll()).toEqual([]);
  });
});
