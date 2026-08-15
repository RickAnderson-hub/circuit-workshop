import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { LEVELS } from '../domain/levels';
import { completeLevel, createDefaultProgress, saveProgress } from '../storage/persistence';
import { ProgressProvider } from '../store/ProgressContext';
import { WorkshopMap } from './WorkshopMap';

describe('WorkshopMap', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('enables only the first level by default', () => {
    render(
      <ProgressProvider>
        <WorkshopMap onSelectLevel={vi.fn()} />
      </ProgressProvider>,
    );
    expect(screen.getByRole('button', { name: LEVELS[0].title })).toBeEnabled();
    expect(screen.getByRole('button', { name: LEVELS[1].title })).toBeDisabled();
  });

  it('renders earned robot parts from completed levels', () => {
    const progress = completeLevel(createDefaultProgress(), LEVELS[0].id);
    saveProgress(progress);

    render(
      <ProgressProvider>
        <WorkshopMap onSelectLevel={vi.fn()} />
      </ProgressProvider>,
    );

    expect(screen.getByTestId(`part-${LEVELS[0].rewardPart}`)).toHaveClass('earned');
  });

  it('shows the robot celebrating when a celebratingLevelId is passed', () => {
    render(
      <ProgressProvider>
        <WorkshopMap onSelectLevel={vi.fn()} celebratingLevelId={LEVELS[0].id} />
      </ProgressProvider>,
    );

    expect(screen.getByTestId('robot-sidekick')).toHaveClass('celebrating');
  });

  it('toggles the mute button', async () => {
    const user = userEvent.setup();
    render(
      <ProgressProvider>
        <WorkshopMap onSelectLevel={vi.fn()} />
      </ProgressProvider>,
    );
    const muteButton = screen.getByRole('button', { name: /mute sound/i });
    expect(muteButton).toHaveAttribute('aria-pressed', 'false');
    await user.click(muteButton);
    expect(muteButton).toHaveAttribute('aria-pressed', 'true');
  });

  const stage1Levels = LEVELS.filter((level) => level.stage === 1);
  const stage2Levels = LEVELS.filter((level) => level.stage === 2);
  const stage3Levels = LEVELS.filter((level) => level.stage === 3);

  it('keeps the Stage 2 tab locked until every stage 1 level is completed', () => {
    let progress = createDefaultProgress();
    // Complete all but the last stage 1 level.
    for (const level of stage1Levels.slice(0, -1)) {
      progress = completeLevel(progress, level.id);
    }
    saveProgress(progress);

    render(
      <ProgressProvider>
        <WorkshopMap onSelectLevel={vi.fn()} />
      </ProgressProvider>,
    );

    expect(screen.getByRole('tab', { name: /stage 2/i })).toBeDisabled();
  });

  it('unlocks the Stage 2 tab, showing only its first level enabled, once stage 1 is fully complete', async () => {
    const user = userEvent.setup();
    let progress = createDefaultProgress();
    for (const level of stage1Levels) {
      progress = completeLevel(progress, level.id);
    }
    saveProgress(progress);

    render(
      <ProgressProvider>
        <WorkshopMap onSelectLevel={vi.fn()} />
      </ProgressProvider>,
    );

    const stage2Tab = screen.getByRole('tab', { name: /stage 2/i });
    expect(stage2Tab).toBeEnabled();
    await user.click(stage2Tab);

    expect(screen.getByTestId('robot-sidekick-mk2')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: stage2Levels[0].title })).toBeEnabled();
    expect(screen.getByRole('button', { name: stage2Levels[1].title })).toBeDisabled();
  });

  it('switches to the Stage 2 tab and celebrates on the mk2 robot when a stage 2 level is the one just completed', () => {
    let progress = createDefaultProgress();
    for (const level of stage1Levels) {
      progress = completeLevel(progress, level.id);
    }
    saveProgress(progress);

    render(
      <ProgressProvider>
        <WorkshopMap onSelectLevel={vi.fn()} celebratingLevelId={stage2Levels[0].id} />
      </ProgressProvider>,
    );

    expect(screen.getByTestId('robot-sidekick-mk2')).toHaveClass('celebrating');
    expect(screen.queryByTestId('robot-sidekick')).not.toBeInTheDocument();
  });

  it('keeps the Stage 3 tab locked until every stage 2 level is completed', () => {
    let progress = createDefaultProgress();
    for (const level of [...stage1Levels, ...stage2Levels.slice(0, -1)]) {
      progress = completeLevel(progress, level.id);
    }
    saveProgress(progress);

    render(
      <ProgressProvider>
        <WorkshopMap onSelectLevel={vi.fn()} />
      </ProgressProvider>,
    );

    expect(screen.getByRole('tab', { name: /stage 3/i })).toBeDisabled();
  });

  it('unlocks the Stage 3 tab with the badge collection once stage 2 is fully complete', async () => {
    const user = userEvent.setup();
    let progress = createDefaultProgress();
    for (const level of [...stage1Levels, ...stage2Levels]) {
      progress = completeLevel(progress, level.id);
    }
    saveProgress(progress);

    render(
      <ProgressProvider>
        <WorkshopMap onSelectLevel={vi.fn()} />
      </ProgressProvider>,
    );

    const stage3Tab = screen.getByRole('tab', { name: /stage 3/i });
    expect(stage3Tab).toBeEnabled();
    await user.click(stage3Tab);

    expect(screen.getByTestId('badge-collection')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: stage3Levels[0].title })).toBeEnabled();
    expect(screen.getByRole('button', { name: stage3Levels[1].title })).toBeDisabled();
  });

  it('switches to the Stage 3 tab and celebrates on the badge collection when a stage 3 level is the one just completed', () => {
    let progress = createDefaultProgress();
    for (const level of [...stage1Levels, ...stage2Levels]) {
      progress = completeLevel(progress, level.id);
    }
    saveProgress(progress);

    render(
      <ProgressProvider>
        <WorkshopMap onSelectLevel={vi.fn()} celebratingLevelId={stage3Levels[0].id} />
      </ProgressProvider>,
    );

    expect(screen.getByTestId('badge-collection')).toHaveClass('celebrating');
  });
});
