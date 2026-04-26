import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BreathingCircle } from './BreathingCircle';

const baseProps = {
  phase: 'idle' as const,
  totalProgress: 0,
  cycleCount: 0,
  timeRemaining: 300,
  phaseDuration: 0,
  phaseProgress: 0,
};

describe('BreathingCircle', () => {
  it('shows "ready" label in idle phase', () => {
    render(<BreathingCircle {...baseProps} />);
    expect(screen.getByText('ready')).toBeInTheDocument();
  });

  it('shows "Breathe In" label during inhale', () => {
    render(<BreathingCircle {...baseProps} phase="inhale" phaseDuration={4} phaseProgress={0} />);
    expect(screen.getByText('Breathe In')).toBeInTheDocument();
  });

  it('shows "Hold" label during hold phase', () => {
    render(<BreathingCircle {...baseProps} phase="hold" phaseDuration={7} phaseProgress={0} />);
    expect(screen.getByText('Hold')).toBeInTheDocument();
  });

  it('shows "Breathe Out" label during exhale', () => {
    render(<BreathingCircle {...baseProps} phase="exhale" phaseDuration={8} phaseProgress={0} />);
    expect(screen.getByText('Breathe Out')).toBeInTheDocument();
  });

  it('shows phase seconds countdown', () => {
    // phaseDuration=4, phaseProgress=0 → phaseSecondsLeft = ceil(4 * 1) = 4
    render(<BreathingCircle {...baseProps} phase="inhale" phaseDuration={4} phaseProgress={0} />);
    expect(screen.getByText('4')).toBeInTheDocument();
  });

  it('shows remaining seconds halfway through a phase', () => {
    // phaseDuration=4, phaseProgress=0.5 → phaseSecondsLeft = ceil(4 * 0.5) = 2
    render(<BreathingCircle {...baseProps} phase="inhale" phaseDuration={4} phaseProgress={0.5} />);
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('does not show phase timer in idle state', () => {
    render(<BreathingCircle {...baseProps} />);
    expect(screen.queryByText(/\d+s?$/)).not.toBeInTheDocument();
  });

  it('shows time remaining in seconds format when under 1 minute', () => {
    render(
      <BreathingCircle
        {...baseProps}
        phase="inhale"
        phaseDuration={4}
        phaseProgress={0}
        timeRemaining={45}
      />
    );
    expect(screen.getByText('45s left')).toBeInTheDocument();
  });

  it('shows time remaining in m:ss format when 1 minute or more', () => {
    render(
      <BreathingCircle
        {...baseProps}
        phase="inhale"
        phaseDuration={4}
        phaseProgress={0}
        timeRemaining={90}
      />
    );
    expect(screen.getByText('1:30 left')).toBeInTheDocument();
  });

  it('shows singular "cycle" for cycleCount of 1', () => {
    render(<BreathingCircle {...baseProps} cycleCount={1} />);
    expect(screen.getByText('1 cycle')).toBeInTheDocument();
  });

  it('shows plural "cycles" for cycleCount > 1', () => {
    render(<BreathingCircle {...baseProps} cycleCount={3} />);
    expect(screen.getByText('3 cycles')).toBeInTheDocument();
  });

  it('does not show cycle text when cycleCount is 0', () => {
    render(<BreathingCircle {...baseProps} cycleCount={0} />);
    expect(screen.queryByText(/cycle/)).not.toBeInTheDocument();
  });

  it('does not show time remaining in idle state', () => {
    render(<BreathingCircle {...baseProps} phase="idle" timeRemaining={300} />);
    expect(screen.queryByText(/left/)).not.toBeInTheDocument();
  });
});
