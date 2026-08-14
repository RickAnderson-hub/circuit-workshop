import { useState } from 'react';
import { LEVELS } from './domain/levels';
import { ProgressProvider, useProgress } from './store/ProgressContext';
import { WorkshopMap } from './screens/WorkshopMap';
import { LevelScreen } from './screens/LevelScreen';

function AppShell() {
  const [activeLevelId, setActiveLevelId] = useState<string | null>(null);
  const [justCompletedLevelId, setJustCompletedLevelId] = useState<string | null>(null);
  const { completeLevel } = useProgress();

  if (!activeLevelId) {
    return (
      <WorkshopMap
        onSelectLevel={setActiveLevelId}
        celebratingLevelId={justCompletedLevelId}
        onCelebrationDone={() => setJustCompletedLevelId(null)}
      />
    );
  }

  const level = LEVELS.find((candidate) => candidate.id === activeLevelId);
  if (!level) {
    setActiveLevelId(null);
    return null;
  }

  return (
    <LevelScreen
      level={level}
      onBack={() => setActiveLevelId(null)}
      onComplete={() => {
        completeLevel(level.id);
        setJustCompletedLevelId(level.id);
      }}
    />
  );
}

export default function App() {
  return (
    <ProgressProvider>
      <AppShell />
    </ProgressProvider>
  );
}
