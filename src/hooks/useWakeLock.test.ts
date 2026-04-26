import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useWakeLock } from './useWakeLock';

function makeMockWakeLock() {
  const sentinel = {
    release: vi.fn().mockResolvedValue(undefined),
    addEventListener: vi.fn(),
  };
  const wakeLock = {
    request: vi.fn().mockResolvedValue(sentinel),
  };
  return { sentinel, wakeLock };
}

describe('useWakeLock', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('request() calls navigator.wakeLock.request with screen', async () => {
    const { wakeLock } = makeMockWakeLock();
    Object.defineProperty(navigator, 'wakeLock', { value: wakeLock, configurable: true });

    const { result } = renderHook(() => useWakeLock());
    await act(async () => {
      await result.current.request();
    });

    expect(wakeLock.request).toHaveBeenCalledWith('screen');
  });

  it('release() calls sentinel.release()', async () => {
    const { sentinel, wakeLock } = makeMockWakeLock();
    Object.defineProperty(navigator, 'wakeLock', { value: wakeLock, configurable: true });

    const { result } = renderHook(() => useWakeLock());
    await act(async () => {
      await result.current.request();
    });
    await act(async () => {
      await result.current.release();
    });

    expect(sentinel.release).toHaveBeenCalled();
  });

  it('does not throw when wakeLock API is unavailable', async () => {
    Object.defineProperty(navigator, 'wakeLock', { value: undefined, configurable: true });

    const { result } = renderHook(() => useWakeLock());
    await expect(
      act(async () => {
        await result.current.request();
      })
    ).resolves.not.toThrow();
  });

  it('reacquires lock on visibility change when active', async () => {
    const { wakeLock } = makeMockWakeLock();
    Object.defineProperty(navigator, 'wakeLock', { value: wakeLock, configurable: true });

    const { result } = renderHook(() => useWakeLock());
    await act(async () => {
      await result.current.request();
    });

    // Simulate tab becoming visible again
    Object.defineProperty(document, 'visibilityState', { value: 'visible', configurable: true });
    await act(async () => {
      document.dispatchEvent(new Event('visibilitychange'));
    });

    expect(wakeLock.request).toHaveBeenCalledTimes(2);
  });
});
