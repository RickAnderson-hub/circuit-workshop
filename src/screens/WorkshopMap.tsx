import { useEffect } from 'react';
import { LEVELS } from '../domain/levels';
import { RobotSidekick } from '../components/RobotSidekick';
import { useProgress } from '../store/ProgressContext';
import './WorkshopMap.css';

export interface WorkshopMapProps {
  onSelectLevel: (levelId: string) => void;
  celebratingLevelId?: string | null;
  onCelebrationDone?: () => void;
}

export function WorkshopMap({ onSelectLevel, celebratingLevelId = null, onCelebrationDone }: WorkshopMapProps) {
  const { state, isLevelUnlocked } = useProgress();
  const earnedParts = LEVELS.filter((level) => state.completedLevelIds.includes(level.id)).map(
    (level) => level.rewardPart,
  );
  const celebrating = celebratingLevelId !== null;

  useEffect(() => {
    if (!celebrating || !onCelebrationDone) return;
    const timer = setTimeout(onCelebrationDone, 1800);
    return () => clearTimeout(timer);
  }, [celebrating, onCelebrationDone]);

  return (
    <div className="workshop-map">
      <h1>The Robot Workshop</h1>
      <RobotSidekick earnedParts={earnedParts} celebrating={celebrating} />
      <div className="level-list">
        {LEVELS.map((level) => (
          <button
            key={level.id}
            type="button"
            disabled={!isLevelUnlocked(level.id)}
            onClick={() => onSelectLevel(level.id)}
          >
            {level.title}
          </button>
        ))}
      </div>
    </div>
  );
}
