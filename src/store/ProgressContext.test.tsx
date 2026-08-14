import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import { LEVELS } from '../domain/levels';
import { loadProgress } from '../storage/persistence';
import { ProgressProvider, useProgress } from './ProgressContext';

function Harness() {
  const { state, completeLevel, isLevelUnlocked } = useProgress();
  return (
    <div>
      <span data-testid="completed-count">{state.completedLevelIds.length}</span>
      <span data-testid="second-unlocked">{String(isLevelUnlocked(LEVELS[1].id))}</span>
      <button onClick={() => completeLevel(LEVELS[0].id)}>Complete first level</button>
    </div>
  );
}

describe('ProgressContext', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('starts with zero completed levels and the second level locked', () => {
    render(
      <ProgressProvider>
        <Harness />
      </ProgressProvider>,
    );
    expect(screen.getByTestId('completed-count')).toHaveTextContent('0');
    expect(screen.getByTestId('second-unlocked')).toHaveTextContent('false');
  });

  it('unlocks the second level and persists after completing the first', async () => {
    const user = userEvent.setup();
    render(
      <ProgressProvider>
        <Harness />
      </ProgressProvider>,
    );
    await user.click(screen.getByText('Complete first level'));
    expect(screen.getByTestId('completed-count')).toHaveTextContent('1');
    expect(screen.getByTestId('second-unlocked')).toHaveTextContent('true');
    expect(loadProgress().completedLevelIds).toEqual([LEVELS[0].id]);
  });

  it('throws when used outside a ProgressProvider', () => {
    function Bare() {
      useProgress();
      return null;
    }
    expect(() => render(<Bare />)).toThrow('useProgress must be used within a ProgressProvider');
  });
});
