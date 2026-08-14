import { edgeJunctions, EdgeKey, GridState, junctionKey, PlacedComponent } from './types';

function conducts(component: PlacedComponent): boolean {
  if (component.type === 'switch') return component.closed === true;
  return true;
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
    addEdge(aKey, bKey);
    addEdge(bKey, aKey);
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

    const reachableFromA = reachableFrom(adjacency, batteryA, [aKey, bKey]);
    const reachableFromB = reachableFrom(adjacency, batteryB, [aKey, bKey]);

    const forward = reachableFromA.has(aKey) && reachableFromB.has(bKey);
    const backward = reachableFromA.has(bKey) && reachableFromB.has(aKey);
    if (forward || backward) live.add(key);
  }
  return live;
}
