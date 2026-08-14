export type ComponentType = 'wire' | 'switch' | 'led' | 'bulb' | 'battery';

export interface PlacedComponent {
  type: ComponentType;
  /** Only meaningful for 'switch': true = closed (conducting). */
  closed?: boolean;
}

export type EdgeOrientation = 'h' | 'v';

export type EdgeKey = string;

export function edgeKey(row: number, col: number, orientation: EdgeOrientation): EdgeKey {
  return `${row},${col},${orientation}`;
}

export interface JunctionId {
  row: number;
  col: number;
}

export function junctionKey(j: JunctionId): string {
  return `${j.row},${j.col}`;
}

export function edgeJunctions(key: EdgeKey): [JunctionId, JunctionId] {
  const [rowStr, colStr, orientation] = key.split(',');
  const row = Number(rowStr);
  const col = Number(colStr);
  if (orientation === 'h') {
    return [{ row, col }, { row, col: col + 1 }];
  }
  return [{ row, col }, { row: row + 1, col }];
}

export interface GridState {
  rows: number;
  cols: number;
  edges: Record<EdgeKey, PlacedComponent>;
}

export function createEmptyGrid(rows: number, cols: number): GridState {
  return { rows, cols, edges: {} };
}
