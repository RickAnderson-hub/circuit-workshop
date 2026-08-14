import { LEVELS } from '../domain/levels';
import { createDefaultProgress, ProgressState, SCHEMA_VERSION, STORAGE_KEY } from './schema';

export { createDefaultProgress };

function isValidShape(candidate: unknown): candidate is ProgressState {
  if (!candidate || typeof candidate !== 'object') return false;
  const version = (candidate as { version?: unknown }).version;
  const completed = (candidate as { completedLevelIds?: unknown }).completedLevelIds;
  return version === SCHEMA_VERSION && Array.isArray(completed);
}

export function loadProgress(): ProgressState {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return createDefaultProgress();
  try {
    const parsed = JSON.parse(raw);
    return isValidShape(parsed) ? parsed : createDefaultProgress();
  } catch {
    return createDefaultProgress();
  }
}

export function saveProgress(state: ProgressState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.warn('Failed to save progress:', error);
  }
}

export function completeLevel(state: ProgressState, levelId: string): ProgressState {
  if (state.completedLevelIds.includes(levelId)) return state;
  return { ...state, completedLevelIds: [...state.completedLevelIds, levelId] };
}

export function isLevelUnlocked(state: ProgressState, levelId: string): boolean {
  const index = LEVELS.findIndex((level) => level.id === levelId);
  if (index <= 0) return true;
  const previousId = LEVELS[index - 1].id;
  return state.completedLevelIds.includes(previousId);
}
