import { useEffect } from 'react';
import { LEVELS } from '../domain/levels';
import { earnedPartsFrom } from '../domain/rewards';
import { RobotSidekick } from '../components/RobotSidekick';
import { useProgress } from '../store/ProgressContext';
import { useMuted } from '../audio/useMuted';
import './WorkshopMap.css';

export interface WorkshopMapProps {
  onSelectLevel: (levelId: string) => void;
  celebratingLevelId?: string | null;
  onCelebrationDone?: () => void;
}

export function WorkshopMap({ onSelectLevel, celebratingLevelId = null, onCelebrationDone }: WorkshopMapProps) {
  const { state, isLevelUnlocked } = useProgress();
  const [muted, toggleMuted] = useMuted();
  const earnedParts = earnedPartsFrom(state.completedLevelIds);
  const celebrating = celebratingLevelId !== null;

  useEffect(() => {
    if (!celebrating || !onCelebrationDone) return;
    const timer = setTimeout(onCelebrationDone, 1800);
    return () => clearTimeout(timer);
  }, [celebrating, onCelebrationDone]);

  return (
    <div className="workshop-map">
      <button
        type="button"
        className="mute-button"
        onClick={toggleMuted}
        aria-pressed={muted}
        aria-label={muted ? 'Unmute sound' : 'Mute sound'}
      >
        {muted ? '🔇' : '🔊'}
      </button>
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
