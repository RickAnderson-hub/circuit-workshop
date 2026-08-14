import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import {
  completeLevel as completeLevelInState,
  isLevelUnlocked as isLevelUnlockedInState,
  loadProgress,
  saveProgress,
} from '../storage/persistence';
import { ProgressState } from '../storage/schema';

interface ProgressContextValue {
  state: ProgressState;
  completeLevel: (levelId: string) => void;
  isLevelUnlocked: (levelId: string) => boolean;
}

const ProgressContext = createContext<ProgressContextValue | null>(null);

export function ProgressProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<ProgressState>(() => loadProgress());

  const completeLevel = useCallback((levelId: string) => {
    setState((previous) => {
      const next = completeLevelInState(previous, levelId);
      saveProgress(next);
      return next;
    });
  }, []);

  const isLevelUnlocked = useCallback(
    (levelId: string) => isLevelUnlockedInState(state, levelId),
    [state],
  );

  const value = useMemo(
    () => ({ state, completeLevel, isLevelUnlocked }),
    [state, completeLevel, isLevelUnlocked],
  );

  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>;
}

export function useProgress(): ProgressContextValue {
  const context = useContext(ProgressContext);
  if (!context) throw new Error('useProgress must be used within a ProgressProvider');
  return context;
}
