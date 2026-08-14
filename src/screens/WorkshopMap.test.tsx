import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { LEVELS } from '../domain/levels';
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
});
