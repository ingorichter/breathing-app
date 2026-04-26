import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider, useTheme } from './ThemeContext';

function ThemeConsumer() {
  const { theme, setTheme } = useTheme();
  return (
    <div>
      <span data-testid="theme">{theme}</span>
      <button onClick={() => setTheme('orange')}>Orange</button>
      <button onClick={() => setTheme('peach')}>Peach</button>
      <button onClick={() => setTheme('green')}>Green</button>
    </div>
  );
}

describe('ThemeContext', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
  });

  it('defaults to green theme', () => {
    render(
      <ThemeProvider>
        <ThemeConsumer />
      </ThemeProvider>
    );
    expect(screen.getByTestId('theme').textContent).toBe('green');
  });

  it('reads initial theme from localStorage', () => {
    localStorage.setItem('breathing-theme', 'orange');
    render(
      <ThemeProvider>
        <ThemeConsumer />
      </ThemeProvider>
    );
    expect(screen.getByTestId('theme').textContent).toBe('orange');
  });

  it('setTheme updates the displayed theme', () => {
    render(
      <ThemeProvider>
        <ThemeConsumer />
      </ThemeProvider>
    );
    fireEvent.click(screen.getByText('Orange'));
    expect(screen.getByTestId('theme').textContent).toBe('orange');
  });

  it('setTheme persists to localStorage', () => {
    render(
      <ThemeProvider>
        <ThemeConsumer />
      </ThemeProvider>
    );
    fireEvent.click(screen.getByText('Peach'));
    expect(localStorage.getItem('breathing-theme')).toBe('peach');
  });

  it('non-green theme sets data-theme attribute on documentElement', () => {
    render(
      <ThemeProvider>
        <ThemeConsumer />
      </ThemeProvider>
    );
    fireEvent.click(screen.getByText('Orange'));
    expect(document.documentElement.getAttribute('data-theme')).toBe('orange');
  });

  it('switching back to green removes data-theme attribute', () => {
    localStorage.setItem('breathing-theme', 'peach');
    render(
      <ThemeProvider>
        <ThemeConsumer />
      </ThemeProvider>
    );
    fireEvent.click(screen.getByText('Green'));
    expect(document.documentElement.hasAttribute('data-theme')).toBe(false);
  });
});
