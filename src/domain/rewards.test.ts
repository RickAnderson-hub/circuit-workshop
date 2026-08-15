import { LEVELS } from './levels';
import { earnedPartsFrom } from './rewards';

describe('earnedPartsFrom', () => {
  it('returns no parts when nothing is completed', () => {
    expect(earnedPartsFrom([])).toEqual([]);
  });

  it('returns the reward part for each completed level, in level order', () => {
    const ids = [LEVELS[2].id, LEVELS[0].id];
    expect(earnedPartsFrom(ids)).toEqual([LEVELS[0].rewardPart, LEVELS[2].rewardPart]);
  });

  it('ignores unknown level ids', () => {
    expect(earnedPartsFrom(['not-a-real-level', LEVELS[0].id])).toEqual([LEVELS[0].rewardPart]);
  });
});
