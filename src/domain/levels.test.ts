import { LEVELS } from './levels';

describe('LEVELS', () => {
  it('has at least 5 levels with unique, non-empty ids', () => {
    expect(LEVELS.length).toBeGreaterThanOrEqual(5);
    const ids = LEVELS.map((level) => level.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of ids) expect(id.length).toBeGreaterThan(0);
  });

  it('gives every level a non-empty tray and goal text', () => {
    for (const level of LEVELS) {
      expect(level.tray.length).toBeGreaterThan(0);
      expect(level.goal.length).toBeGreaterThan(0);
    }
  });

  it('gives every level exactly one fixed battery', () => {
    for (const level of LEVELS) {
      const batteryCount = Object.values(level.fixed).filter((c) => c.type === 'battery').length;
      expect(batteryCount).toBe(1);
    }
  });

  it('assigns a distinct reward part to every level', () => {
    const rewardParts = LEVELS.map((level) => level.rewardPart);
    expect(new Set(rewardParts).size).toBe(rewardParts.length);
  });

  it('orders every stage 1 level before every stage 2 level', () => {
    // isLevelUnlocked has no stage-specific gate — it relies entirely on
    // stage 2 levels coming after all of stage 1 in this array, so that the
    // existing purely-sequential unlock rule implies stage 2 only opens up
    // once stage 1 is fully complete. If this ordering ever breaks, that
    // gate silently breaks with it.
    const stages = LEVELS.map((level) => level.stage);
    const firstStage2Index = stages.indexOf(2);
    expect(firstStage2Index).toBeGreaterThan(-1);
    expect(stages.slice(0, firstStage2Index).every((stage) => stage === 1)).toBe(true);
    expect(stages.slice(firstStage2Index).every((stage) => stage === 2)).toBe(true);
  });
});
