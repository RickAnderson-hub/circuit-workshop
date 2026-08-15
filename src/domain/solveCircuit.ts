import { edgeJunctions, EdgeKey, GridState, junctionKey, PlacedComponent } from './types';

function conducts(component: PlacedComponent): boolean {
  if (component.type === 'switch') return component.closed === true;
  return true;
}

/** A diode with no explicit `forward` field conducts a→b (its default state). */
function diodeConductsForward(component: PlacedComponent): boolean {
  return component.forward !== false;
}

function buildAdjacency(grid: GridState): Map<string, string[]> {
  const adjacency = new Map<string, string[]>();
  const addEdge = (a: string, b: string) => {
    if (!adjacency.has(a)) adjacency.set(a, []);
    adjacency.get(a)!.push(b);
  };
  for (const key of Object.keys(grid.edges)) {
    const component = grid.edges[key];
    if (!conducts(component)) continue;
    const [a, b] = edgeJunctions(key);
    const aKey = junctionKey(a);
    const bKey = junctionKey(b);
    if (component.type === 'diode') {
      if (diodeConductsForward(component)) addEdge(aKey, bKey);
      else addEdge(bKey, aKey);
    } else {
      addEdge(aKey, bKey);
      addEdge(bKey, aKey);
    }
  }
  return adjacency;
}

/** BFS reachability from `start`, optionally refusing to cross one edge. */
function reachableFrom(adjacency: Map<string, string[]>, start: string, excluded?: [string, string]): Set<string> {
  const visited = new Set<string>([start]);
  const queue = [start];
  while (queue.length > 0) {
    const current = queue.shift()!;
    for (const neighbor of adjacency.get(current) ?? []) {
      if (excluded) {
        const [x, y] = excluded;
        if ((current === x && neighbor === y) || (current === y && neighbor === x)) continue;
      }
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        queue.push(neighbor);
      }
    }
  }
  return visited;
}

function findBatteryTerminals(grid: GridState): [string, string] | null {
  for (const key of Object.keys(grid.edges)) {
    if (grid.edges[key].type === 'battery') {
      const [a, b] = edgeJunctions(key);
      return [junctionKey(a), junctionKey(b)];
    }
  }
  return null;
}

/**
 * Returns the set of placed components currently carrying current: those
 * lying on at least one path between the battery's two terminals within
 * the subgraph of conducting components (an open switch does not
 * conduct). If no external path connects the battery's terminals, or
 * there is no battery, nothing is live.
 */
export function solveCircuit(grid: GridState): Set<EdgeKey> {
  const terminals = findBatteryTerminals(grid);
  if (!terminals) return new Set();
  const [batteryA, batteryB] = terminals;

  const adjacency = buildAdjacency(grid);
  // Check if an external path exists between battery terminals. This upfront check is critical:
  // in the per-edge loop below, for the battery edge itself, aKey and bKey are each BFS's start
  // node from a battery terminal, making them trivially reachable (always true). Without this
  // guard, the battery would be incorrectly marked live even if no external path exists.
  const externallyClosed = reachableFrom(adjacency, batteryA, [batteryA, batteryB]).has(batteryB);
  if (!externallyClosed) return new Set();

  const live = new Set<EdgeKey>();
  for (const key of Object.keys(grid.edges)) {
    const component = grid.edges[key];
    if (!conducts(component)) continue;
    const [a, b] = edgeJunctions(key);
    const aKey = junctionKey(a);
    const bKey = junctionKey(b);
    const excluded: [string, string] = [aKey, bKey];

    const reachableFromA = reachableFrom(adjacency, batteryA, excluded);
    const reachableFromB = reachableFrom(adjacency, batteryB, excluded);

    // Does current delivered by one battery terminal arrive at `from`, and
    // — walking onward from `to` (not backtracking through this edge) —
    // reach the *other* terminal? Walking onward from `to` rather than
    // checking `to`'s membership in a battery-rooted set is what makes this
    // correct for directional (diode) edges: a node downstream of a diode
    // may be unreachable from either battery terminal by itself (nothing
    // points back to it once this edge is excluded), even though current
    // genuinely flows through it via this edge and onward.
    function passesThrough(from: string, to: string): boolean {
      const reachableFromTo = reachableFrom(adjacency, to, excluded);
      const viaA = reachableFromA.has(from) && reachableFromTo.has(batteryB);
      const viaB = reachableFromB.has(from) && reachableFromTo.has(batteryA);
      return viaA || viaB;
    }

    const forward = passesThrough(aKey, bKey);
    const backward = passesThrough(bKey, aKey);
    // A diode only ever conducts one way, so only its own allowed direction
    // counts — unlike other components, where current could be flowing
    // through in either direction.
    const isLive = component.type === 'diode' ? (diodeConductsForward(component) ? forward : backward) : forward || backward;
    if (isLive) live.add(key);
  }
  return live;
}

const OUTPUT_TYPES = new Set<PlacedComponent['type']>(['led', 'bulb', 'buzzer', 'motor']);

/**
 * A grid is solved once every output (bulb/LED/buzzer/motor) currently on
 * it is carrying current — checking the live grid rather than just the
 * level's fixed components means an output supplied via the tray is held
 * to the same standard as one built into the puzzle. An empty grid (no
 * outputs placed yet) is never solved.
 */
export function isSolved(grid: GridState): boolean {
  const live = solveCircuit(grid);
  const targets = Object.entries(grid.edges).filter(([, component]) => OUTPUT_TYPES.has(component.type));
  return targets.length > 0 && targets.every(([key]) => live.has(key));
}
