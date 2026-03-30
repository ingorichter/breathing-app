import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAudio } from './useAudio';

function makeMockAudioContext() {
  const oscillator = {
    connect: vi.fn(),
    type: 'sine' as OscillatorType,
    frequency: { value: 0 },
    start: vi.fn(),
    stop: vi.fn(),
  };
  const gainNode = {
    connect: vi.fn(),
    gain: {
      value: 0,
      setValueAtTime: vi.fn(),
      linearRampToValueAtTime: vi.fn(),
      exponentialRampToValueAtTime: vi.fn(),
    },
  };
  const ctx = {
    state: 'running' as AudioContextState,
    currentTime: 0,
    destination: {},
    createOscillator: vi.fn().mockReturnValue(oscillator),
    createGain: vi.fn().mockReturnValue(gainNode),
    resume: vi.fn().mockResolvedValue(undefined),
  };
  return { ctx, oscillator, gainNode };
}

// AudioContext is a constructor — arrow functions are not constructable, use a regular function
function stubAudioContext(ctx: ReturnType<typeof makeMockAudioContext>['ctx']) {
  vi.stubGlobal('AudioContext', vi.fn().mockImplementation(function () { return ctx; }));
}

describe('useAudio', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  beforeEach(() => {
    const { ctx } = makeMockAudioContext();
    stubAudioContext(ctx);
  });

  it('playPhase does nothing in visual mode', async () => {
    const { result } = renderHook(() => useAudio('visual'));
    await act(async () => { result.current.playPhase('inhale'); });
    expect(AudioContext).not.toHaveBeenCalled();
  });

  it('playPhase creates AudioContext in bowl mode', async () => {
    const { result } = renderHook(() => useAudio('bowl'));
    await act(async () => { result.current.playPhase('inhale'); });
    expect(AudioContext).toHaveBeenCalled();
  });

  it('playPhase creates AudioContext in tone mode', async () => {
    const { result } = renderHook(() => useAudio('tone'));
    await act(async () => { result.current.playPhase('exhale'); });
    expect(AudioContext).toHaveBeenCalled();
  });

  it('bowl mode creates multiple oscillators (one per partial)', async () => {
    const { ctx } = makeMockAudioContext();
    stubAudioContext(ctx);

    const { result } = renderHook(() => useAudio('bowl'));
    await act(async () => { result.current.playPhase('inhale'); });

    // BOWL_PARTIALS has 3 entries → 3 oscillators created
    expect(ctx.createOscillator).toHaveBeenCalledTimes(3);
  });

  it('tone mode creates exactly one oscillator', async () => {
    const { ctx } = makeMockAudioContext();
    stubAudioContext(ctx);

    const { result } = renderHook(() => useAudio('tone'));
    await act(async () => { result.current.playPhase('hold'); });

    expect(ctx.createOscillator).toHaveBeenCalledTimes(1);
  });

  it('resumes suspended AudioContext before playing', async () => {
    const { ctx } = makeMockAudioContext();
    ctx.state = 'suspended';
    stubAudioContext(ctx);

    const { result } = renderHook(() => useAudio('tone'));
    await act(async () => { result.current.playPhase('inhale'); });

    expect(ctx.resume).toHaveBeenCalled();
  });
});
