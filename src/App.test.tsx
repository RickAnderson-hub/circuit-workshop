import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import { LEVELS } from './domain/levels';
import App from './App';

describe('App', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('shows the workshop map first, then the selected level on tap', async () => {
    const user = userEvent.setup();
    render(<App />);
    expect(screen.getByText('The Robot Workshop')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: LEVELS[0].title }));
    expect(screen.getByText(LEVELS[0].goal)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /back/i }));
    expect(screen.getByText('The Robot Workshop')).toBeInTheDocument();
  });
});
