import { render, RenderOptions } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider } from '../context/ThemeContext';

interface WrapperOptions extends RenderOptions {
  route?: string;
}

export function renderWithProviders(ui: React.ReactElement, { route = '/', ...opts }: WrapperOptions = {}) {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <ThemeProvider>{ui}</ThemeProvider>
    </MemoryRouter>,
    opts
  );
}
