import { describe, it, expect, beforeEach, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '../test/utils';
import { Session } from './Session';
import type { BreathPhase } from '../types';

const mockNavigate = vi.fn();
const mockStart = vi.fn();
const mockStop = vi.fn();
const mockSave = vi.fn();
const mockRequest = vi.fn();
const mockRelease = vi.fn();

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return { ...actual, useNavigate: () => mockNavigate };
});

const mockBreathingState = {
  phase: 'inhale' as BreathPhase,
  cycleCount: 0,
  phaseProgress: 0,
  totalProgress: 0.1,
  timeRemaining: 270,
  isRunning: true,
  phaseDuration: 4,
  start: mockStart,
  stop: mockStop,
};

vi.mock('../hooks/useBreathing', () => ({
  useBreathing: vi.fn(() => mockBreathingState),
}));

vi.mock('../hooks/useWakeLock', () => ({
  useWakeLock: vi.fn(() => ({ request: mockRequest, release: mockRelease })),
}));

vi.mock('../hooks/useSessions', () => ({
  useSessions: vi.fn(() => ({
    save: mockSave,
    getAll: vi.fn().mockReturnValue([]),
    getStreak: vi.fn().mockReturnValue(0),
    getTotalCount: vi.fn().mockReturnValue(0),
  })),
}));

describe('Session page', () => {
  beforeEach(() => {
    localStorage.clear();
    mockNavigate.mockReset();
    mockStart.mockReset();
    mockStop.mockReset();
    mockSave.mockReset();
    mockRequest.mockReset();
    mockRelease.mockReset();

    // Reset to running state
    mockBreathingState.isRunning = true;
    mockBreathingState.totalProgress = 0.1;
    mockBreathingState.cycleCount = 0;
    mockBreathingState.phase = 'inhale';
  });

  it('renders restart and stop buttons', () => {
    renderWithProviders(<Session />);
    expect(screen.getByRole('button', { name: /restart/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /end session/i })).toBeInTheDocument();
  });

  it('does not show completion overlay while running', () => {
    renderWithProviders(<Session />);
    expect(screen.queryByText('Well done')).not.toBeInTheDocument();
  });

  it('shows completion overlay when session is finished', () => {
    mockBreathingState.isRunning = false;
    mockBreathingState.totalProgress = 0.999;
    renderWithProviders(<Session />);
    expect(screen.getByText('Well done')).toBeInTheDocument();
  });

  it('completion overlay shows cycle count', () => {
    mockBreathingState.isRunning = false;
    mockBreathingState.totalProgress = 0.999;
    mockBreathingState.cycleCount = 5;
    renderWithProviders(<Session />);
    // "Well done" is the overlay title; its sibling contains the stats
    const overlayText = screen.getByText('Well done').parentElement!;
    expect(overlayText).toHaveTextContent(/5 cycles/i);
  });

  it('Done button on completion overlay navigates to /', async () => {
    mockBreathingState.isRunning = false;
    mockBreathingState.totalProgress = 0.999;
    const user = userEvent.setup();
    renderWithProviders(<Session />);
    await user.click(screen.getByRole('button', { name: /done/i }));
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  it('Stop button saves partial session if progress > 0', async () => {
    const user = userEvent.setup();
    renderWithProviders(<Session />);
    await user.click(screen.getByRole('button', { name: /end session/i }));
    expect(mockSave).toHaveBeenCalled();
    expect(mockStop).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  it('Stop button does not save if no progress', async () => {
    mockBreathingState.totalProgress = 0;
    const user = userEvent.setup();
    renderWithProviders(<Session />);
    await user.click(screen.getByRole('button', { name: /end session/i }));
    expect(mockSave).not.toHaveBeenCalled();
  });

  it('requests wake lock on mount', () => {
    renderWithProviders(<Session />);
    expect(mockRequest).toHaveBeenCalled();
  });

  it('starts breathing on mount', () => {
    renderWithProviders(<Session />);
    expect(mockStart).toHaveBeenCalled();
  });
});
