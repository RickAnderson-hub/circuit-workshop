import { edgeKey } from './types';
import { LEVELS, LevelDef } from './levels';
import { isLevelSolvable } from './levelSolvability';

describe('isLevelSolvable', () => {
  it('confirms every shipped level has at least one winning arrangement', () => {
    for (const level of LEVELS) {
      expect(isLevelSolvable(level)).toBe(true);
    }
  });

  it('returns false for a level whose tray cannot possibly close the loop', () => {
    const unsolvable: LevelDef = {
      id: 'unsolvable-test-fixture',
      title: 'test',
      goal: 'test',
      stage: 1,
      rows: 2,
      cols: 2,
      fixed: {
        [edgeKey(0, 0, 'h')]: { type: 'battery' },
        [edgeKey(0, 1, 'v')]: { type: 'bulb' },
      },
      // Missing the second wire needed to close the loop, so no arrangement can light the bulb.
      tray: [],
      rewardPart: 'nose',
    };
    expect(isLevelSolvable(unsolvable)).toBe(false);
  });

  it('respects the tray as a finite budget, not an unlimited supply of each type', () => {
    // Needs two wires to close the loop via (0,0,'v') and (1,0,'h'), but the
    // tray only provides one — should be unsolvable now that placing a
    // component consumes it from the tray.
    const oneWireShort: LevelDef = {
      id: 'one-wire-short-test-fixture',
      title: 'test',
      goal: 'test',
      stage: 1,
      rows: 2,
      cols: 2,
      fixed: {
        [edgeKey(0, 0, 'h')]: { type: 'battery' },
        [edgeKey(0, 1, 'v')]: { type: 'bulb' },
      },
      tray: ['wire'],
      rewardPart: 'nose',
    };
    expect(isLevelSolvable(oneWireShort)).toBe(false);
  });

  it('explores both diode directions, not just the default', () => {
    // Only empty slot is (0,1,'v'); the only way around the loop traverses
    // it from (1,1) to (0,1) — the *reverse* of a diode's default forward
    // direction. Forcing exactly one slot and one tray item (no alternate
    // placement the solver could pick instead) means this is only
    // solvable if the search actually tries the reversed direction.
    const needsReversedDiode: LevelDef = {
      id: 'diode-reversed-test-fixture',
      title: 'test',
      goal: 'test',
      stage: 1,
      rows: 2,
      cols: 2,
      fixed: {
        [edgeKey(0, 0, 'h')]: { type: 'battery' },
        [edgeKey(0, 0, 'v')]: { type: 'wire' },
        [edgeKey(1, 0, 'h')]: { type: 'bulb' },
      },
      tray: ['diode'],
      rewardPart: 'nose',
    };
    expect(isLevelSolvable(needsReversedDiode)).toBe(true);
  });
});
