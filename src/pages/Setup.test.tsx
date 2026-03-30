import { describe, it, expect, beforeEach, vi } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '../test/utils';
import { Setup } from './Setup';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return { ...actual, useNavigate: () => mockNavigate };
});

describe('Setup page', () => {
  beforeEach(() => {
    localStorage.clear();
    mockNavigate.mockReset();
  });

  it('renders the heading', () => {
    renderWithProviders(<Setup />);
    expect(screen.getByText('Session Setup')).toBeInTheDocument();
  });

  it('shows the default duration of 5 min', () => {
    renderWithProviders(<Setup />);
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('shows loaded duration from config', () => {
    localStorage.setItem('breathing-config', JSON.stringify({ duration: 15, audioMode: 'tone' }));
    renderWithProviders(<Setup />);
    expect(screen.getByText('15')).toBeInTheDocument();
  });

  it('duration slider is present', () => {
    renderWithProviders(<Setup />);
    const slider = screen.getByRole('slider', { name: /duration/i });
    expect(slider).toBeInTheDocument();
  });

  it('changes duration when slider is moved', () => {
    renderWithProviders(<Setup />);
    const slider = screen.getByRole('slider', { name: /duration/i });
    fireEvent.change(slider, { target: { value: '20' } });
    expect(screen.getByText('20')).toBeInTheDocument();
  });

  it('shows all three audio options', () => {
    renderWithProviders(<Setup />);
    expect(screen.getByText('Singing Bowl')).toBeInTheDocument();
    expect(screen.getByText('Tone')).toBeInTheDocument();
    expect(screen.getByText('Visual Only')).toBeInTheDocument();
  });

  it('shows mute hint when audio mode is not visual', () => {
    renderWithProviders(<Setup />);
    expect(screen.getByText(/not muted/i)).toBeInTheDocument();
  });

  it('hides mute hint when Visual Only is selected', async () => {
    const user = userEvent.setup();
    renderWithProviders(<Setup />);
    await user.click(screen.getByText('Visual Only'));
    expect(screen.queryByText(/not muted/i)).not.toBeInTheDocument();
  });

  it('shows all three theme options', () => {
    renderWithProviders(<Setup />);
    expect(screen.getByText('Sage')).toBeInTheDocument();
    expect(screen.getByText('Ember')).toBeInTheDocument();
    expect(screen.getByText('Blush')).toBeInTheDocument();
  });

  it('Save button persists config and navigates to /', async () => {
    const user = userEvent.setup();
    renderWithProviders(<Setup />);

    const slider = screen.getByRole('slider', { name: /duration/i });
    fireEvent.change(slider, { target: { value: '8' } });

    await user.click(screen.getByText('Save'));

    const stored = JSON.parse(localStorage.getItem('breathing-config')!);
    expect(stored.duration).toBe(8);
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  it('Cancel button navigates back without saving', async () => {
    const user = userEvent.setup();
    renderWithProviders(<Setup />);
    await user.click(screen.getByText('Cancel'));
    expect(mockNavigate).toHaveBeenCalledWith('/');
    expect(localStorage.getItem('breathing-config')).toBeNull();
  });

  it('shows estimated cycle count', () => {
    renderWithProviders(<Setup />);
    // 5 min = 300s / 19s per cycle ≈ 15 cycles
    expect(screen.getByText(/15 complete cycles/i)).toBeInTheDocument();
  });
});
