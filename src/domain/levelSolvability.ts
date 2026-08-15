import { LevelDef } from './levels';
import { isSolved } from './solveCircuit';
import { ComponentType, edgeKey, GridState, PlacedComponent } from './types';

function allEdgeKeys(rows: number, cols: number): string[] {
  const keys: string[] = [];
  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      if (col < cols - 1) keys.push(edgeKey(row, col, 'h'));
      if (row < rows - 1) keys.push(edgeKey(row, col, 'v'));
    }
  }
  return keys;
}

/**
 * Candidate contents for one empty slot: nothing, or one of the tray's
 * component types. A switch only needs its closed state tried here — an
 * open switch never conducts, so it behaves exactly like an empty slot for
 * reachability purposes and would only bloat the search.
 */
function slotCandidates(types: ComponentType[]): (PlacedComponent | null)[] {
  return [null, ...types.map((type): PlacedComponent => (type === 'switch' ? { type, closed: true } : { type }))];
}

/**
 * Brute-forces whether some placement of the level's tray components onto
 * its empty slots solves the level. The tray is treated as an unlimited
 * supply of its listed types (matching in-game behavior: placing a
 * component doesn't consume it from the tray), so only the distinct types
 * available matter, not how many of each the tray lists.
 */
export function isLevelSolvable(level: LevelDef): boolean {
  const emptyKeys = allEdgeKeys(level.rows, level.cols).filter((key) => !(key in level.fixed));
  const types = Array.from(new Set(level.tray));
  const candidates = slotCandidates(types);

  const edges: GridState['edges'] = { ...level.fixed };

  function search(index: number): boolean {
    if (index === emptyKeys.length) {
      return isSolved({ rows: level.rows, cols: level.cols, edges });
    }
    const key = emptyKeys[index];
    for (const candidate of candidates) {
      if (candidate) edges[key] = candidate;
      else delete edges[key];
      if (search(index + 1)) return true;
    }
    delete edges[key];
    return false;
  }

  return search(0);
}
