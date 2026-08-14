export const SCHEMA_VERSION = 1;
export const STORAGE_KEY = 'circuit-workshop:v1';

export interface ProgressState {
  version: number;
  completedLevelIds: string[];
}

export function createDefaultProgress(): ProgressState {
  return { version: SCHEMA_VERSION, completedLevelIds: [] };
}
