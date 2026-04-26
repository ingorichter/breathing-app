import { describe, it, expect, beforeEach, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '../test/utils';
import { Home } from './Home';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return { ...actual, useNavigate: () => mockNavigate };
});

describe('Home page', () => {
  beforeEach(() => {
    localStorage.clear();
    mockNavigate.mockReset();
  });

  it('renders the app title', () => {
    renderWithProviders(<Home />);
    expect(screen.getByText('4 · 7 · 8')).toBeInTheDocument();
  });

  it('shows "No streak yet" when there are no sessions', () => {
    renderWithProviders(<Home />);
    expect(screen.getByText(/No streak yet/i)).toBeInTheDocument();
  });

  it('shows "0 sessions" when there are no sessions', () => {
    renderWithProviders(<Home />);
    expect(screen.getByText(/0 sessions/i)).toBeInTheDocument();
  });

  it('shows "1 session" (singular) when total is 1', () => {
    localStorage.setItem(
      'breathing-sessions',
      JSON.stringify([
        { id: '1', date: '2026-03-29', duration: 5, completedCycles: 3, timestamp: 1 },
      ])
    );
    renderWithProviders(<Home />);
    expect(screen.getByText(/1 session\b/i)).toBeInTheDocument();
  });

  it('shows Begin button with configured duration', () => {
    localStorage.setItem('breathing-config', JSON.stringify({ duration: 10, audioMode: 'bowl' }));
    renderWithProviders(<Home />);
    expect(screen.getByText(/Begin · 10 min/i)).toBeInTheDocument();
  });

  it('Begin button defaults to 5 min', () => {
    renderWithProviders(<Home />);
    expect(screen.getByText(/Begin · 5 min/i)).toBeInTheDocument();
  });

  it('clicking Begin navigates to /session', async () => {
    const user = userEvent.setup();
    renderWithProviders(<Home />);
    await user.click(screen.getByText(/Begin/i));
    expect(mockNavigate).toHaveBeenCalledWith('/session');
  });

  it('clicking Change settings navigates to /setup', async () => {
    const user = userEvent.setup();
    renderWithProviders(<Home />);
    await user.click(screen.getByText(/Change settings/i));
    expect(mockNavigate).toHaveBeenCalledWith('/setup');
  });

  it('shows the 4-7-8 pattern card', () => {
    renderWithProviders(<Home />);
    expect(screen.getByText('4s')).toBeInTheDocument();
    expect(screen.getByText('7s')).toBeInTheDocument();
    expect(screen.getByText('8s')).toBeInTheDocument();
  });
});
