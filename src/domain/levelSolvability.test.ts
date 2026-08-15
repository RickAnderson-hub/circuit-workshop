import { edgeKey } from './types';
import { LEVELS } from './levels';
import { isLevelSolvable } from './levelSolvability';

describe('isLevelSolvable', () => {
  it('confirms every shipped level has at least one winning arrangement', () => {
    for (const level of LEVELS) {
      expect(isLevelSolvable(level)).toBe(true);
    }
  });

  it('returns false for a level whose tray cannot possibly close the loop', () => {
    const unsolvable = {
      id: 'unsolvable-test-fixture',
      title: 'test',
      goal: 'test',
      rows: 2,
      cols: 2,
      fixed: {
        [edgeKey(0, 0, 'h')]: { type: 'battery' as const },
        [edgeKey(0, 1, 'v')]: { type: 'bulb' as const },
      },
      // Missing the second wire needed to close the loop, so no arrangement can light the bulb.
      tray: [],
      rewardPart: 'nose' as const,
    };
    expect(isLevelSolvable(unsolvable)).toBe(false);
  });
});
