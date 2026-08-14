import { render, screen } from '@testing-library/react';
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
});
