import { describe, it, expect, beforeEach, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '../test/utils';
import { Stats } from './Stats';
import type { SessionRecord } from '../types';

const FIXED_DATE = '2026-03-29';

vi.mock('@js-temporal/polyfill', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@js-temporal/polyfill')>();
  return {
    ...actual,
    Temporal: {
      ...actual.Temporal,
      Now: {
        plainDateISO: () => actual.Temporal.PlainDate.from(FIXED_DATE),
        instant: () => actual.Temporal.Instant.fromEpochMilliseconds(1743206400000),
      },
    },
  };
});

const sampleSessions: SessionRecord[] = [
  { id: '1', date: '2026-03-29', duration: 5, completedCycles: 3, timestamp: 1743206400000 },
  { id: '2', date: '2026-03-28', duration: 10, completedCycles: 7, timestamp: 1743120000000 },
];

describe('Stats page', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders the heading', () => {
    renderWithProviders(<Stats />);
    expect(screen.getByText('Your Practice')).toBeInTheDocument();
  });

  it('shows zero streak with no sessions', () => {
    renderWithProviders(<Stats />);
    const streakCard = screen.getByText('Streak').closest('div')!.parentElement!;
    expect(streakCard).toHaveTextContent('0');
  });

  it('shows zero sessions with no data', () => {
    renderWithProviders(<Stats />);
    expect(screen.getByText('Sessions').closest('div')!.parentElement!).toHaveTextContent('0');
  });

  it('shows empty state message when no sessions', () => {
    renderWithProviders(<Stats />);
    expect(screen.getByText(/No sessions yet/i)).toBeInTheDocument();
  });

  it('shows session history when sessions exist', () => {
    localStorage.setItem('breathing-sessions', JSON.stringify(sampleSessions));
    renderWithProviders(<Stats />);
    expect(screen.queryByText(/No sessions yet/i)).not.toBeInTheDocument();
  });

  it('shows total minutes from all sessions', () => {
    localStorage.setItem('breathing-sessions', JSON.stringify(sampleSessions));
    renderWithProviders(<Stats />);
    // 5 + 10 = 15 minutes
    expect(screen.getByText('Minutes').closest('div')!.parentElement!).toHaveTextContent('15');
  });

  it('shows total session count', () => {
    localStorage.setItem('breathing-sessions', JSON.stringify(sampleSessions));
    renderWithProviders(<Stats />);
    expect(screen.getByText('Sessions').closest('div')!.parentElement!).toHaveTextContent('2');
  });

  it('renders 35 calendar cells', () => {
    renderWithProviders(<Stats />);
    expect(screen.getByText('Last 35 days')).toBeInTheDocument();
  });

  it('shows cycles and duration in session history', () => {
    localStorage.setItem('breathing-sessions', JSON.stringify(sampleSessions));
    renderWithProviders(<Stats />);
    expect(screen.getByText('7 cycles')).toBeInTheDocument();
    expect(screen.getByText('10 min')).toBeInTheDocument();
  });
});
