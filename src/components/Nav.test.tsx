import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Nav } from './Nav';

function renderNav(route = '/') {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <Nav />
    </MemoryRouter>
  );
}

describe('Nav', () => {
  it('renders all three navigation links', () => {
    renderNav();
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Setup')).toBeInTheDocument();
    expect(screen.getByText('Stats')).toBeInTheDocument();
  });

  it('Home link points to /', () => {
    renderNav();
    const link = screen.getByText('Home').closest('a');
    expect(link).toHaveAttribute('href', '/');
  });

  it('Setup link points to /setup', () => {
    renderNav();
    const link = screen.getByText('Setup').closest('a');
    expect(link).toHaveAttribute('href', '/setup');
  });

  it('Stats link points to /stats', () => {
    renderNav();
    const link = screen.getByText('Stats').closest('a');
    expect(link).toHaveAttribute('href', '/stats');
  });

  it('renders a <nav> element', () => {
    renderNav();
    expect(screen.getByRole('navigation')).toBeInTheDocument();
  });
});
