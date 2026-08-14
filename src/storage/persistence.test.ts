import { beforeEach, describe, expect, it } from 'vitest';
import { LEVELS } from '../domain/levels';
import {
  completeLevel,
  createDefaultProgress,
  isLevelUnlocked,
  loadProgress,
  saveProgress,
} from './persistence';

describe('progress persistence', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('creates a default progress state with nothing completed', () => {
    const state = createDefaultProgress();
    expect(state.completedLevelIds).toEqual([]);
  });

  it('returns the default state when nothing is saved yet', () => {
    expect(loadProgress()).toEqual(createDefaultProgress());
  });

  it('round-trips a saved state through localStorage', () => {
    const state = completeLevel(createDefaultProgress(), LEVELS[0].id);
    saveProgress(state);
    expect(loadProgress()).toEqual(state);
  });

  it('falls back to the default state on corrupted storage', () => {
    localStorage.setItem('circuit-workshop:v1', 'not json');
    expect(loadProgress()).toEqual(createDefaultProgress());
  });

  it('does not duplicate an already-completed level', () => {
    const once = completeLevel(createDefaultProgress(), LEVELS[0].id);
    const twice = completeLevel(once, LEVELS[0].id);
    expect(twice.completedLevelIds).toEqual([LEVELS[0].id]);
  });

  it('unlocks only the first level by default', () => {
    const state = createDefaultProgress();
    expect(isLevelUnlocked(state, LEVELS[0].id)).toBe(true);
    expect(isLevelUnlocked(state, LEVELS[1].id)).toBe(false);
  });

  it('unlocks the next level once the previous one is completed', () => {
    const state = completeLevel(createDefaultProgress(), LEVELS[0].id);
    expect(isLevelUnlocked(state, LEVELS[1].id)).toBe(true);
    expect(isLevelUnlocked(state, LEVELS[2].id)).toBe(false);
  });
});
