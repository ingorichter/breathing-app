import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useBreathing, PHASE_DURATIONS } from './useBreathing';

vi.mock('./useAudio', () => ({
  useAudio: () => ({ playPhase: vi.fn(), playGong: vi.fn() }),
}));
vi.mock('./useHaptics', () => ({
  useHaptics: () => ({ vibrate: vi.fn() }),
}));

const CYCLE_DURATION = PHASE_DURATIONS.inhale + PHASE_DURATIONS.hold + PHASE_DURATIONS.exhale; // 19s

// Use a generous buffer to account for floating point accumulation in tick counters
function advanceSec(sec: number) {
  act(() => {
    vi.advanceTimersByTime(sec * 1000 + 500);
  });
}

describe('useBreathing', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('starts in idle state', () => {
    const { result } = renderHook(() =>
      useBreathing({ durationMinutes: 5, audioMode: 'visual', onComplete: vi.fn() })
    );
    expect(result.current.phase).toBe('idle');
    expect(result.current.isRunning).toBe(false);
    expect(result.current.cycleCount).toBe(0);
    expect(result.current.totalProgress).toBe(0);
  });

  it('initialises timeRemaining from durationMinutes', () => {
    const { result } = renderHook(() =>
      useBreathing({ durationMinutes: 3, audioMode: 'visual', onComplete: vi.fn() })
    );
    expect(result.current.timeRemaining).toBe(180);
  });

  it('start() transitions to inhale and sets isRunning', () => {
    const { result } = renderHook(() =>
      useBreathing({ durationMinutes: 5, audioMode: 'visual', onComplete: vi.fn() })
    );
    act(() => {
      result.current.start();
    });
    expect(result.current.phase).toBe('inhale');
    expect(result.current.isRunning).toBe(true);
  });

  it('phaseDuration is 0 while idle', () => {
    const { result } = renderHook(() =>
      useBreathing({ durationMinutes: 5, audioMode: 'visual', onComplete: vi.fn() })
    );
    expect(result.current.phaseDuration).toBe(0);
  });

  it('phaseDuration matches inhale after start', () => {
    const { result } = renderHook(() =>
      useBreathing({ durationMinutes: 5, audioMode: 'visual', onComplete: vi.fn() })
    );
    act(() => {
      result.current.start();
    });
    expect(result.current.phaseDuration).toBe(PHASE_DURATIONS.inhale);
  });

  it('transitions inhale → hold after 4 seconds', () => {
    const { result } = renderHook(() =>
      useBreathing({ durationMinutes: 5, audioMode: 'visual', onComplete: vi.fn() })
    );
    act(() => {
      result.current.start();
    });
    advanceSec(PHASE_DURATIONS.inhale);
    expect(result.current.phase).toBe('hold');
  });

  it('transitions hold → exhale after 4+7 seconds', () => {
    const { result } = renderHook(() =>
      useBreathing({ durationMinutes: 5, audioMode: 'visual', onComplete: vi.fn() })
    );
    act(() => {
      result.current.start();
    });
    advanceSec(PHASE_DURATIONS.inhale + PHASE_DURATIONS.hold);
    expect(result.current.phase).toBe('exhale');
  });

  it('increments cycleCount after one full 19s cycle', () => {
    const { result } = renderHook(() =>
      useBreathing({ durationMinutes: 5, audioMode: 'visual', onComplete: vi.fn() })
    );
    act(() => {
      result.current.start();
    });
    advanceSec(CYCLE_DURATION);
    expect(result.current.cycleCount).toBe(1);
  });

  it('increments cycleCount after two full cycles', () => {
    const { result } = renderHook(() =>
      useBreathing({ durationMinutes: 5, audioMode: 'visual', onComplete: vi.fn() })
    );
    act(() => {
      result.current.start();
    });
    advanceSec(CYCLE_DURATION * 2);
    expect(result.current.cycleCount).toBe(2);
  });

  it('totalProgress increases over time', () => {
    const { result } = renderHook(() =>
      useBreathing({ durationMinutes: 5, audioMode: 'visual', onComplete: vi.fn() })
    );
    act(() => {
      result.current.start();
    });
    advanceSec(30);
    expect(result.current.totalProgress).toBeGreaterThan(0);
    expect(result.current.totalProgress).toBeLessThanOrEqual(1);
  });

  it('stop() resets to idle and stops running', () => {
    const { result } = renderHook(() =>
      useBreathing({ durationMinutes: 5, audioMode: 'visual', onComplete: vi.fn() })
    );
    act(() => {
      result.current.start();
    });
    advanceSec(5);
    act(() => {
      result.current.stop();
    });
    expect(result.current.phase).toBe('idle');
    expect(result.current.isRunning).toBe(false);
  });

  it('calls onComplete with cycle count when session finishes', () => {
    const onComplete = vi.fn();
    const { result } = renderHook(() =>
      useBreathing({ durationMinutes: 1, audioMode: 'visual', onComplete })
    );
    act(() => {
      result.current.start();
    });
    advanceSec(61); // advance past 1 minute
    expect(onComplete).toHaveBeenCalledTimes(1);
    expect(onComplete).toHaveBeenCalledWith(expect.any(Number));
  });

  it('does not call onComplete after stop()', () => {
    const onComplete = vi.fn();
    const { result } = renderHook(() =>
      useBreathing({ durationMinutes: 1, audioMode: 'visual', onComplete })
    );
    act(() => {
      result.current.start();
    });
    act(() => {
      result.current.stop();
    });
    advanceSec(61);
    expect(onComplete).not.toHaveBeenCalled();
  });
});
