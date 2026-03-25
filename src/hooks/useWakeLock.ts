import { useCallback, useEffect, useRef } from 'react';

export function useWakeLock() {
  const sentinelRef = useRef<WakeLockSentinel | null>(null);
  const activeRef   = useRef(false);

  const request = useCallback(async () => {
    if (!('wakeLock' in navigator)) return;
    try {
      sentinelRef.current = await navigator.wakeLock.request('screen');
      activeRef.current   = true;
      sentinelRef.current.addEventListener('release', () => {
        activeRef.current = false;
      });
    } catch {
      // User denied or device doesn't support — silently continue
    }
  }, []);

  const release = useCallback(async () => {
    activeRef.current = false;
    if (sentinelRef.current) {
      await sentinelRef.current.release();
      sentinelRef.current = null;
    }
  }, []);

  // Reacquire when the tab becomes visible again (wake lock is lost on hide)
  useEffect(() => {
    const onVisibility = async () => {
      if (document.visibilityState === 'visible' && activeRef.current) {
        await request();
      }
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, [request]);

  return { request, release };
}
