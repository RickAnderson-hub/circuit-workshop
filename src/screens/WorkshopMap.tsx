import { useEffect, useState } from 'react';
import { LEVELS } from '../domain/levels';
import { earnedPartsFrom } from '../domain/rewards';
import { RobotSidekick } from '../components/RobotSidekick';
import { RobotSidekickMk2 } from '../components/RobotSidekickMk2';
import { useProgress } from '../store/ProgressContext';
import { useMuted } from '../audio/useMuted';
import './WorkshopMap.css';

export interface WorkshopMapProps {
  onSelectLevel: (levelId: string) => void;
  celebratingLevelId?: string | null;
  onCelebrationDone?: () => void;
}

const STAGE_1_LEVELS = LEVELS.filter((level) => level.stage === 1);
const STAGE_2_LEVELS = LEVELS.filter((level) => level.stage === 2);

export function WorkshopMap({ onSelectLevel, celebratingLevelId = null, onCelebrationDone }: WorkshopMapProps) {
  const { state, isLevelUnlocked } = useProgress();
  const [muted, toggleMuted] = useMuted();
  const earnedParts = earnedPartsFrom(state.completedLevelIds);
  const celebratingLevel = LEVELS.find((level) => level.id === celebratingLevelId) ?? null;
  const celebrating = celebratingLevel !== null;
  const stage2Unlocked = STAGE_2_LEVELS.length > 0 && isLevelUnlocked(STAGE_2_LEVELS[0].id);
  const [activeTab, setActiveTab] = useState<1 | 2>(celebratingLevel?.stage ?? 1);

  useEffect(() => {
    if (!celebrating || !onCelebrationDone) return;
    const timer = setTimeout(onCelebrationDone, 1800);
    return () => clearTimeout(timer);
  }, [celebrating, onCelebrationDone]);

  // Jump to whichever stage's level was just completed, so the celebration is visible.
  useEffect(() => {
    if (celebratingLevel) setActiveTab(celebratingLevel.stage);
  }, [celebratingLevel]);

  const levels = activeTab === 1 ? STAGE_1_LEVELS : STAGE_2_LEVELS;

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

      <div className="stage-tabs" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 1}
          className={`stage-tab${activeTab === 1 ? ' active' : ''}`}
          onClick={() => setActiveTab(1)}
        >
          Stage 1
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 2}
          className={`stage-tab${activeTab === 2 ? ' active' : ''}`}
          disabled={!stage2Unlocked}
          onClick={() => setActiveTab(2)}
        >
          Stage 2 {!stage2Unlocked && '🔒'}
        </button>
      </div>

      {activeTab === 1 ? (
        <RobotSidekick earnedParts={earnedParts} celebrating={celebrating && celebratingLevel?.stage === 1} />
      ) : (
        <RobotSidekickMk2 earnedParts={earnedParts} celebrating={celebrating && celebratingLevel?.stage === 2} />
      )}

      <div className="level-list">
        {levels.map((level) => (
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
