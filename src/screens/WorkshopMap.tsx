import { useEffect, useState } from 'react';
import { LevelDef, LEVELS } from '../domain/levels';
import { earnedPartsFrom } from '../domain/rewards';
import { RobotSidekick } from '../components/RobotSidekick';
import { RobotSidekickMk2 } from '../components/RobotSidekickMk2';
import { BadgeCollection } from '../components/BadgeCollection';
import { useProgress } from '../store/ProgressContext';
import { useMuted } from '../audio/useMuted';
import './WorkshopMap.css';

export interface WorkshopMapProps {
  onSelectLevel: (levelId: string) => void;
  celebratingLevelId?: string | null;
  onCelebrationDone?: () => void;
}

type Stage = LevelDef['stage'];

const STAGE_NUMBERS: Stage[] = Array.from(new Set(LEVELS.map((level) => level.stage))).sort((a, b) => a - b);
const LEVELS_BY_STAGE = new Map<Stage, LevelDef[]>(
  STAGE_NUMBERS.map((stage) => [stage, LEVELS.filter((level) => level.stage === stage)]),
);
const STAGE_LABELS: Record<Stage, string> = { 1: 'Stage 1', 2: 'Stage 2', 3: 'Stage 3' };

export function WorkshopMap({ onSelectLevel, celebratingLevelId = null, onCelebrationDone }: WorkshopMapProps) {
  const { state, isLevelUnlocked } = useProgress();
  const [muted, toggleMuted] = useMuted();
  const earnedParts = earnedPartsFrom(state.completedLevelIds);
  const celebratingLevel = LEVELS.find((level) => level.id === celebratingLevelId) ?? null;
  const celebrating = celebratingLevel !== null;
  const [activeStage, setActiveStage] = useState<Stage>(celebratingLevel?.stage ?? STAGE_NUMBERS[0]);

  useEffect(() => {
    if (!celebrating || !onCelebrationDone) return;
    const timer = setTimeout(onCelebrationDone, 1800);
    return () => clearTimeout(timer);
  }, [celebrating, onCelebrationDone]);

  // Jump to whichever stage's level was just completed, so the celebration is visible.
  useEffect(() => {
    if (celebratingLevel) setActiveStage(celebratingLevel.stage);
  }, [celebratingLevel]);

  function isStageUnlocked(stage: Stage): boolean {
    const stageLevels = LEVELS_BY_STAGE.get(stage) ?? [];
    return stageLevels.length > 0 && isLevelUnlocked(stageLevels[0].id);
  }

  const activeLevels = LEVELS_BY_STAGE.get(activeStage) ?? [];

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
        {STAGE_NUMBERS.map((stage) => {
          const unlocked = stage === STAGE_NUMBERS[0] || isStageUnlocked(stage);
          return (
            <button
              key={stage}
              type="button"
              role="tab"
              aria-selected={activeStage === stage}
              className={`stage-tab${activeStage === stage ? ' active' : ''}`}
              disabled={!unlocked}
              onClick={() => setActiveStage(stage)}
            >
              {STAGE_LABELS[stage] ?? `Stage ${stage}`} {!unlocked && '🔒'}
            </button>
          );
        })}
      </div>

      {activeStage === 1 && (
        <RobotSidekick earnedParts={earnedParts} celebrating={celebrating && celebratingLevel?.stage === 1} />
      )}
      {activeStage === 2 && (
        <RobotSidekickMk2 earnedParts={earnedParts} celebrating={celebrating && celebratingLevel?.stage === 2} />
      )}
      {activeStage === 3 && (
        <BadgeCollection earnedParts={earnedParts} celebrating={celebrating && celebratingLevel?.stage === 3} />
      )}

      <div className="level-list">
        {activeLevels.map((level) => (
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
