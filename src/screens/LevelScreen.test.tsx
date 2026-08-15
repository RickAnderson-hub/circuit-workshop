import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { LEVELS } from '../domain/levels';
import { LevelScreen } from './LevelScreen';

describe('LevelScreen', () => {
  it('shows the level goal and tray items', () => {
    render(<LevelScreen level={LEVELS[0]} onComplete={vi.fn()} onBack={vi.fn()} />);
    expect(screen.getByText(LEVELS[0].goal)).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: /wire/i }).length).toBeGreaterThan(0);
  });

  it('calls onComplete once the fixed bulb is wired into a closed loop', async () => {
    const user = userEvent.setup();
    const onComplete = vi.fn();
    render(<LevelScreen level={LEVELS[0]} onComplete={onComplete} onBack={vi.fn()} />);

    // Level 0 grid is 2x2 with a battery on edge (0,0,'h') and a bulb on
    // (0,1,'v'); the tray has two wires to complete the loop via
    // (0,0,'v') and (1,0,'h').
    await user.click(screen.getAllByRole('button', { name: /wire/i })[0]);
    await user.click(screen.getByTestId('hit-0,0,v'));
    await user.click(screen.getAllByRole('button', { name: /wire/i })[0]);
    await user.click(screen.getByTestId('hit-1,0,h'));

    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it('allows removing a misplaced wire and placing it correctly afterward', async () => {
    const user = userEvent.setup();
    const onComplete = vi.fn();
    render(<LevelScreen level={LEVELS[0]} onComplete={onComplete} onBack={vi.fn()} />);

    // Place a wire on the wrong-ish slot first, then undo it, then place both
    // wires correctly to confirm the edge can still be completed afterward.
    await user.click(screen.getAllByRole('button', { name: /wire/i })[0]);
    await user.click(screen.getByTestId('hit-0,0,v'));
    await user.click(screen.getByTestId('hit-0,0,v'));

    await user.click(screen.getAllByRole('button', { name: /wire/i })[0]);
    await user.click(screen.getByTestId('hit-0,0,v'));
    await user.click(screen.getAllByRole('button', { name: /wire/i })[0]);
    await user.click(screen.getByTestId('hit-1,0,h'));

    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it('calls onBack when the back button is tapped', async () => {
    const user = userEvent.setup();
    const onBack = vi.fn();
    render(<LevelScreen level={LEVELS[0]} onComplete={vi.fn()} onBack={onBack} />);
    await user.click(screen.getByRole('button', { name: /back/i }));
    expect(onBack).toHaveBeenCalled();
  });
});
