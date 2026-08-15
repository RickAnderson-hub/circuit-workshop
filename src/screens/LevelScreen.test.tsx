import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { LEVELS } from '../domain/levels';
import { playSound } from '../audio/sound';
import { ProgressProvider } from '../store/ProgressContext';
import { LevelScreen, LevelScreenProps } from './LevelScreen';

vi.mock('../audio/sound', () => ({ playSound: vi.fn() }));

function renderLevelScreen(props: LevelScreenProps) {
  return render(
    <ProgressProvider>
      <LevelScreen {...props} />
    </ProgressProvider>,
  );
}

describe('LevelScreen', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.mocked(playSound).mockClear();
  });

  it('shows the level goal and tray items', () => {
    renderLevelScreen({ level: LEVELS[0], onComplete: vi.fn(), onBack: vi.fn() });
    expect(screen.getByText(LEVELS[0].goal)).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: /wire/i }).length).toBeGreaterThan(0);
  });

  it('calls onComplete once the fixed bulb is wired into a closed loop', async () => {
    const user = userEvent.setup();
    const onComplete = vi.fn();
    renderLevelScreen({ level: LEVELS[0], onComplete: onComplete, onBack: vi.fn() });

    // Level 0 grid is 2x2 with a battery on edge (0,0,'h') and a bulb on
    // (0,1,'v'); the tray has two wires to complete the loop via
    // (0,0,'v') and (1,0,'h').
    await user.click(screen.getAllByRole('button', { name: /wire/i })[0]);
    await user.click(screen.getByTestId('hit-0,0,v'));
    await user.click(screen.getAllByRole('button', { name: /wire/i })[0]);
    await user.click(screen.getByTestId('hit-1,0,h'));

    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it('shows a completion banner with a Next button when onNext is provided, and calls it on tap', async () => {
    const user = userEvent.setup();
    const onNext = vi.fn();
    renderLevelScreen({ level: LEVELS[0], onComplete: vi.fn(), onBack: vi.fn(), onNext });

    expect(screen.queryByTestId('level-complete-banner')).not.toBeInTheDocument();

    await user.click(screen.getAllByRole('button', { name: /wire/i })[0]);
    await user.click(screen.getByTestId('hit-0,0,v'));
    await user.click(screen.getAllByRole('button', { name: /wire/i })[0]);
    await user.click(screen.getByTestId('hit-1,0,h'));

    expect(screen.getByTestId('level-complete-banner')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /next level/i }));
    expect(onNext).toHaveBeenCalledTimes(1);
  });

  it('omits the Next button when onNext is not provided (final level)', async () => {
    const user = userEvent.setup();
    renderLevelScreen({ level: LEVELS[0], onComplete: vi.fn(), onBack: vi.fn() });

    await user.click(screen.getAllByRole('button', { name: /wire/i })[0]);
    await user.click(screen.getByTestId('hit-0,0,v'));
    await user.click(screen.getAllByRole('button', { name: /wire/i })[0]);
    await user.click(screen.getByTestId('hit-1,0,h'));

    expect(screen.getByTestId('level-complete-banner')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /next level/i })).not.toBeInTheDocument();
  });

  it('shows the mk2 robot, not the mk1 robot, in the completion banner for a stage 2 level', async () => {
    const user = userEvent.setup();
    const stage2Level = LEVELS.find((level) => level.id === 'buzzer-intro')!;
    renderLevelScreen({ level: stage2Level, onComplete: vi.fn(), onBack: vi.fn() });

    // Same shape as level 0 (battery + output, two empty wire slots).
    await user.click(screen.getAllByRole('button', { name: /wire/i })[0]);
    await user.click(screen.getByTestId('hit-0,0,v'));
    await user.click(screen.getAllByRole('button', { name: /wire/i })[0]);
    await user.click(screen.getByTestId('hit-1,0,h'));

    expect(screen.getByTestId('robot-sidekick-mk2')).toBeInTheDocument();
    expect(screen.queryByTestId('robot-sidekick')).not.toBeInTheDocument();
  });

  it('allows removing a misplaced wire and placing it correctly afterward', async () => {
    const user = userEvent.setup();
    const onComplete = vi.fn();
    renderLevelScreen({ level: LEVELS[0], onComplete: onComplete, onBack: vi.fn() });

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

  it('disables a tray item once its budget is used up, and restores it when a placed piece is removed', async () => {
    const user = userEvent.setup();
    renderLevelScreen({ level: LEVELS[0], onComplete: vi.fn(), onBack: vi.fn() });

    await user.click(screen.getByRole('button', { name: /wire/i }));
    await user.click(screen.getByTestId('hit-0,0,v'));
    await user.click(screen.getByRole('button', { name: /wire/i }));
    await user.click(screen.getByTestId('hit-1,0,h'));

    expect(screen.getByRole('button', { name: /wire/i })).toBeDisabled();

    await user.click(screen.getByTestId('hit-0,0,v'));
    expect(screen.getByRole('button', { name: /wire/i })).not.toBeDisabled();
  });

  it('calls onBack when the back button is tapped', async () => {
    const user = userEvent.setup();
    const onBack = vi.fn();
    renderLevelScreen({ level: LEVELS[0], onComplete: vi.fn(), onBack: onBack });
    await user.click(screen.getByRole('button', { name: /back/i }));
    expect(onBack).toHaveBeenCalled();
  });

  it('plays place, remove, and solve sounds at the right moments', async () => {
    const user = userEvent.setup();
    renderLevelScreen({ level: LEVELS[0], onComplete: vi.fn(), onBack: vi.fn() });

    await user.click(screen.getAllByRole('button', { name: /wire/i })[0]);
    await user.click(screen.getByTestId('hit-0,0,v'));
    expect(playSound).toHaveBeenLastCalledWith('place', false);

    await user.click(screen.getByTestId('hit-0,0,v'));
    expect(playSound).toHaveBeenLastCalledWith('remove', false);

    await user.click(screen.getAllByRole('button', { name: /wire/i })[0]);
    await user.click(screen.getByTestId('hit-0,0,v'));
    await user.click(screen.getAllByRole('button', { name: /wire/i })[0]);
    await user.click(screen.getByTestId('hit-1,0,h'));
    expect(playSound).toHaveBeenLastCalledWith('solve', false);
  });

  it('toggles the mute button and passes the muted state to playSound', async () => {
    const user = userEvent.setup();
    renderLevelScreen({ level: LEVELS[0], onComplete: vi.fn(), onBack: vi.fn() });

    const muteButton = screen.getByRole('button', { name: /mute sound/i });
    expect(muteButton).toHaveAttribute('aria-pressed', 'false');

    await user.click(muteButton);
    expect(muteButton).toHaveAttribute('aria-pressed', 'true');

    await user.click(screen.getAllByRole('button', { name: /wire/i })[0]);
    await user.click(screen.getByTestId('hit-0,0,v'));
    expect(playSound).toHaveBeenLastCalledWith('place', true);
  });
});
