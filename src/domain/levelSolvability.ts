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
 * Candidate contents for one empty slot, given what's still in the budget:
 * nothing, or one of the types with remaining stock. A switch only needs
 * its closed state tried here — an open switch never conducts, so it
 * behaves exactly like an empty slot for reachability purposes and would
 * only bloat the search.
 */
function slotCandidates(remaining: Map<ComponentType, number>): (PlacedComponent | null)[] {
  const options: (PlacedComponent | null)[] = [null];
  for (const [type, count] of remaining) {
    if (count > 0) options.push(type === 'switch' ? { type, closed: true } : { type });
  }
  return options;
}

/**
 * Brute-forces whether some placement of the level's tray components onto
 * its empty slots solves the level. The tray is a finite budget — each
 * type can only be placed as many times as it appears in `level.tray` —
 * matching in-game behavior where placing a component consumes it.
 */
export function isLevelSolvable(level: LevelDef): boolean {
  const emptyKeys = allEdgeKeys(level.rows, level.cols).filter((key) => !(key in level.fixed));
  const remaining = new Map<ComponentType, number>();
  for (const type of level.tray) remaining.set(type, (remaining.get(type) ?? 0) + 1);

  const edges: GridState['edges'] = { ...level.fixed };

  function search(index: number): boolean {
    if (index === emptyKeys.length) {
      return isSolved({ rows: level.rows, cols: level.cols, edges });
    }
    const key = emptyKeys[index];
    for (const candidate of slotCandidates(remaining)) {
      if (candidate) {
        edges[key] = candidate;
        remaining.set(candidate.type, remaining.get(candidate.type)! - 1);
      } else {
        delete edges[key];
      }
      const solved = search(index + 1);
      if (candidate) remaining.set(candidate.type, remaining.get(candidate.type)! + 1);
      if (solved) return true;
    }
    delete edges[key];
    return false;
  }

  return search(0);
}
