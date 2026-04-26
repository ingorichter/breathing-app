import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useHaptics } from './useHaptics';

describe('useHaptics', () => {
  beforeEach(() => {
    Object.defineProperty(navigator, 'vibrate', {
      value: vi.fn().mockReturnValue(true),
      configurable: true,
      writable: true,
    });
  });

  it('vibrates with a short pulse for inhale', () => {
    const { result } = renderHook(() => useHaptics());
    act(() => {
      result.current.vibrate('inhale');
    });
    expect(navigator.vibrate).toHaveBeenCalledWith([60]);
  });

  it('vibrates with a triple tap pattern for hold', () => {
    const { result } = renderHook(() => useHaptics());
    act(() => {
      result.current.vibrate('hold');
    });
    expect(navigator.vibrate).toHaveBeenCalledWith([30, 60, 30, 60, 30]);
  });

  it('vibrates with a longer pulse for exhale', () => {
    const { result } = renderHook(() => useHaptics());
    act(() => {
      result.current.vibrate('exhale');
    });
    expect(navigator.vibrate).toHaveBeenCalledWith([120]);
  });

  it('does not throw when vibrate is denied by the device (returns false)', () => {
    // The Vibration API returns false when the device cannot vibrate
    Object.defineProperty(navigator, 'vibrate', {
      value: vi.fn().mockReturnValue(false),
      configurable: true,
      writable: true,
    });
    const { result } = renderHook(() => useHaptics());
    expect(() => {
      act(() => {
        result.current.vibrate('inhale');
      });
    }).not.toThrow();
  });
});
