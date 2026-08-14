import { LEVELS } from '../domain/levels';
import { RobotSidekick } from '../components/RobotSidekick';
import { useProgress } from '../store/ProgressContext';
import './WorkshopMap.css';

export interface WorkshopMapProps {
  onSelectLevel: (levelId: string) => void;
}

export function WorkshopMap({ onSelectLevel }: WorkshopMapProps) {
  const { state, isLevelUnlocked } = useProgress();
  const earnedParts = LEVELS.filter((level) => state.completedLevelIds.includes(level.id)).map(
    (level) => level.rewardPart,
  );

  return (
    <div className="workshop-map">
      <h1>The Robot Workshop</h1>
      <RobotSidekick earnedParts={earnedParts} celebrating={false} />
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
