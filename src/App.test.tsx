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

  it('celebrates on the workshop map after completing a level', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('button', { name: LEVELS[0].title }));

    // Level 0 grid is 2x2 with a battery on edge (0,0,'h') and a bulb on
    // (0,1,'v'); the tray has two wires to complete the loop via
    // (0,0,'v') and (1,0,'h').
    await user.click(screen.getAllByRole('button', { name: /wire/i })[0]);
    await user.click(screen.getByTestId('hit-0,0,v'));
    await user.click(screen.getAllByRole('button', { name: /wire/i })[0]);
    await user.click(screen.getByTestId('hit-1,0,h'));

    await user.click(screen.getByRole('button', { name: /back/i }));
    expect(screen.getByText('The Robot Workshop')).toBeInTheDocument();
    expect(screen.getByTestId('robot-sidekick')).toHaveClass('celebrating');
  });
});
