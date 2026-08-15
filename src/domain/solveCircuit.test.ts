import { isSolved, solveCircuit } from './solveCircuit';
import { createEmptyGrid, edgeKey, GridState } from './types';

function withComponents(grid: GridState, placements: [ReturnType<typeof edgeKey>, GridState['edges'][string]][]): GridState {
  const edges = { ...grid.edges };
  for (const [key, component] of placements) {
    edges[key] = component;
  }
  return { ...grid, edges };
}

describe('solveCircuit', () => {
  it('returns nothing live when there is no battery', () => {
    const grid = withComponents(createEmptyGrid(2, 2), [
      [edgeKey(0, 0, 'h'), { type: 'wire' }],
    ]);
    expect(solveCircuit(grid)).toEqual(new Set());
  });

  it('returns nothing live when the battery has no external path', () => {
    const grid = withComponents(createEmptyGrid(2, 2), [
      [edgeKey(0, 0, 'h'), { type: 'battery' }],
    ]);
    expect(solveCircuit(grid)).toEqual(new Set());
  });

  it('lights every component in a simple closed loop', () => {
    // Junctions: (0,0)-(0,1) battery on top, (0,0)-(1,0) and (0,1)-(1,1)
    // wires down the sides, (1,0)-(1,1) wire across the bottom.
    const grid = withComponents(createEmptyGrid(2, 2), [
      [edgeKey(0, 0, 'h'), { type: 'battery' }],
      [edgeKey(0, 0, 'v'), { type: 'wire' }],
      [edgeKey(0, 1, 'v'), { type: 'led' }],
      [edgeKey(1, 0, 'h'), { type: 'wire' }],
    ]);
    const live = solveCircuit(grid);
    expect(live).toEqual(new Set([
      edgeKey(0, 0, 'h'),
      edgeKey(0, 0, 'v'),
      edgeKey(0, 1, 'v'),
      edgeKey(1, 0, 'h'),
    ]));
  });

  it('does not light a branch behind an open switch, but does light a parallel closed branch', () => {
    // Two parallel branches from (0,0) to (0,1) besides the battery:
    // branch A: down via (0,0)-(1,0) wire, across (1,0)-(1,1) wire, up (1,1)-(0,1) wire.
    // branch B: a switch directly wired in on a second row (2,0)-(2,1), connected in
    // by extra wires, with the switch open.
    const grid = withComponents(createEmptyGrid(3, 2), [
      [edgeKey(0, 0, 'h'), { type: 'battery' }],
      [edgeKey(0, 0, 'v'), { type: 'wire' }],
      [edgeKey(1, 0, 'h'), { type: 'wire' }],
      [edgeKey(0, 1, 'v'), { type: 'wire' }],
      [edgeKey(1, 0, 'v'), { type: 'wire' }],
      [edgeKey(2, 0, 'h'), { type: 'switch', closed: false }],
      [edgeKey(1, 1, 'v'), { type: 'wire' }],
    ]);
    const live = solveCircuit(grid);
    expect(live.has(edgeKey(2, 0, 'h'))).toBe(false);
    expect(live.has(edgeKey(0, 0, 'v'))).toBe(true);
    expect(live.has(edgeKey(1, 0, 'h'))).toBe(true);
  });

  it('lights a loop through a forward-facing diode, but blocks it when the diode is reversed', () => {
    // Same loop shape as the "simple closed loop" test above, but the bottom
    // wire is a diode. edgeJunctions(edgeKey(1, 0, 'h')) is [(1,0), (1,1)],
    // and the only path around the loop (other than through the battery
    // itself) traverses this edge from (1,0) to (1,1) — i.e. "forward".
    const forwardGrid = withComponents(createEmptyGrid(2, 2), [
      [edgeKey(0, 0, 'h'), { type: 'battery' }],
      [edgeKey(0, 0, 'v'), { type: 'wire' }],
      [edgeKey(0, 1, 'v'), { type: 'wire' }],
      [edgeKey(1, 0, 'h'), { type: 'diode', forward: true }],
    ]);
    expect(solveCircuit(forwardGrid)).toEqual(new Set([
      edgeKey(0, 0, 'h'),
      edgeKey(0, 0, 'v'),
      edgeKey(0, 1, 'v'),
      edgeKey(1, 0, 'h'),
    ]));

    const reversedGrid: GridState = {
      ...forwardGrid,
      edges: { ...forwardGrid.edges, [edgeKey(1, 0, 'h')]: { type: 'diode', forward: false } },
    };
    expect(solveCircuit(reversedGrid)).toEqual(new Set());
  });

  it('treats a diode with no explicit forward field as forward-facing by default', () => {
    const grid = withComponents(createEmptyGrid(2, 2), [
      [edgeKey(0, 0, 'h'), { type: 'battery' }],
      [edgeKey(0, 0, 'v'), { type: 'wire' }],
      [edgeKey(0, 1, 'v'), { type: 'wire' }],
      [edgeKey(1, 0, 'h'), { type: 'diode' }],
    ]);
    expect(solveCircuit(grid).has(edgeKey(1, 0, 'h'))).toBe(true);
  });

  it('lights a switch branch once closed, and stops lighting it once reopened', () => {
    const closedGrid = withComponents(createEmptyGrid(2, 2), [
      [edgeKey(0, 0, 'h'), { type: 'battery' }],
      [edgeKey(0, 0, 'v'), { type: 'switch', closed: true }],
      [edgeKey(0, 1, 'v'), { type: 'wire' }],
      [edgeKey(1, 0, 'h'), { type: 'wire' }],
    ]);
    expect(solveCircuit(closedGrid).has(edgeKey(0, 0, 'v'))).toBe(true);

    const openGrid: GridState = {
      ...closedGrid,
      edges: { ...closedGrid.edges, [edgeKey(0, 0, 'v')]: { type: 'switch', closed: false } },
    };
    expect(solveCircuit(openGrid)).toEqual(new Set());
  });

  it('lights an inverter branch by default, and stops lighting it once closed (it is a backwards switch)', () => {
    const defaultGrid = withComponents(createEmptyGrid(2, 2), [
      [edgeKey(0, 0, 'h'), { type: 'battery' }],
      [edgeKey(0, 0, 'v'), { type: 'inverter' }],
      [edgeKey(0, 1, 'v'), { type: 'wire' }],
      [edgeKey(1, 0, 'h'), { type: 'wire' }],
    ]);
    expect(solveCircuit(defaultGrid).has(edgeKey(0, 0, 'v'))).toBe(true);

    const closedGrid: GridState = {
      ...defaultGrid,
      edges: { ...defaultGrid.edges, [edgeKey(0, 0, 'v')]: { type: 'inverter', closed: true } },
    };
    expect(solveCircuit(closedGrid)).toEqual(new Set());
  });

  it('does not light a dangling wire stub that dead-ends off a live loop', () => {
    const grid = withComponents(createEmptyGrid(3, 2), [
      [edgeKey(0, 0, 'h'), { type: 'battery' }],
      [edgeKey(0, 0, 'v'), { type: 'wire' }],
      [edgeKey(1, 0, 'h'), { type: 'wire' }],
      [edgeKey(0, 1, 'v'), { type: 'wire' }],
      // Dangles off junction (1,0), which is on the loop, but (2,0) connects to nothing else.
      [edgeKey(1, 0, 'v'), { type: 'wire' }],
    ]);
    const live = solveCircuit(grid);
    expect(live.has(edgeKey(1, 0, 'v'))).toBe(false);
    expect(live.has(edgeKey(0, 0, 'v'))).toBe(true);
  });
});

describe('isSolved', () => {
  it('is false for an empty grid with no bulb or LED placed yet', () => {
    expect(isSolved(createEmptyGrid(2, 2))).toBe(false);
  });

  it('is true once every bulb/LED currently on the grid is live, regardless of how it got there', () => {
    // Mirrors a bulb placed via the tray rather than baked into the level's fixed components.
    const grid = withComponents(createEmptyGrid(2, 2), [
      [edgeKey(0, 0, 'h'), { type: 'battery' }],
      [edgeKey(0, 0, 'v'), { type: 'wire' }],
      [edgeKey(0, 1, 'v'), { type: 'bulb' }],
      [edgeKey(1, 0, 'h'), { type: 'wire' }],
    ]);
    expect(isSolved(grid)).toBe(true);
  });

  it('requires a buzzer and a motor to be live too, not just bulbs/LEDs', () => {
    const grid = withComponents(createEmptyGrid(2, 2), [
      [edgeKey(0, 0, 'h'), { type: 'battery' }],
      [edgeKey(0, 0, 'v'), { type: 'wire' }],
      [edgeKey(0, 1, 'v'), { type: 'buzzer' }],
      [edgeKey(1, 0, 'h'), { type: 'motor' }],
    ]);
    expect(isSolved(grid)).toBe(true);
  });

  it('is false when a placed bulb/LED is not carrying current', () => {
    const grid = withComponents(createEmptyGrid(2, 2), [
      [edgeKey(0, 0, 'h'), { type: 'battery' }],
      [edgeKey(0, 1, 'v'), { type: 'bulb' }],
      // Loop left open: no wires connecting the other two sides.
    ]);
    expect(isSolved(grid)).toBe(false);
  });
});
