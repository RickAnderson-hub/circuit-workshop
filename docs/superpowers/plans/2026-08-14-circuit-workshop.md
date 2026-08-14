# Circuit Workshop Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a mobile-playable, GitHub-Pages-hosted circuits puzzle game for a 9-year-old: drag components onto an SVG grid, watch a live simplified circuit simulation, progress through mastery-gated levels themed as a cartoon inventor's robot workshop.

**Architecture:** React + TypeScript + Vite SPA, no backend. A pure-function circuit-graph solver (junctions as nodes, placed components as edges) determines which components carry current on every grid change. Progress is versioned JSON in `localStorage`, exposed via a React context. UI is SVG-based so components are real, touch-friendly DOM nodes.

**Tech Stack:** React 19, TypeScript, Vite, Vitest + @testing-library/react, oxlint. Mirrors `/home/rick/Documents/code/ocean-math-quest`'s toolchain and file layout exactly.

**Spec:** `/home/rick/.claude/plans/i-want-to-create-sparkling-tarjan.md`

## Global Constraints

- No backend, no accounts — all progress in `localStorage` only.
- No ads, no dark patterns, no timers/fail states — an incomplete circuit just stays dark.
- Mobile-first touch interaction — drag/tap must work with pointer events, no hover-only affordances.
- Deployed as a static site to GitHub Pages via GitHub Actions (`actions/deploy-pages`), same as Ocean Math Quest.
- Match Ocean Math Quest's project conventions: `npm run dev/build/test/lint` scripts, oxlint, Vitest with jsdom, relative `base: './'` in Vite config.

---

### Task 1: Project scaffold

**Files:**
- Create: `circuit-workshop/package.json`
- Create: `circuit-workshop/vite.config.ts`
- Create: `circuit-workshop/tsconfig.json`
- Create: `circuit-workshop/tsconfig.app.json`
- Create: `circuit-workshop/tsconfig.node.json`
- Create: `circuit-workshop/.oxlintrc.json`
- Create: `circuit-workshop/index.html`
- Create: `circuit-workshop/public/favicon.svg`
- Create: `circuit-workshop/src/main.tsx`
- Create: `circuit-workshop/src/App.tsx`
- Create: `circuit-workshop/src/App.test.tsx`
- Create: `circuit-workshop/src/index.css`
- Create: `circuit-workshop/src/test/setup.ts`
- Create: `circuit-workshop/.github/workflows/deploy.yml`
- Create: `circuit-workshop/README.md`
- Create: `circuit-workshop/.gitignore`

**Interfaces:**
- Produces: an `App` component in `src/App.tsx` exported as default, rendered by `src/main.tsx` into `#root`. Later tasks replace `App`'s body but keep the default export and the `#root` mount contract.

- [ ] **Step 1: Create `package.json`**

```json
{
  "name": "circuit-workshop",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "lint": "oxlint",
    "preview": "vite preview",
    "test": "vitest run"
  },
  "dependencies": {
    "react": "^19.2.7",
    "react-dom": "^19.2.7"
  },
  "devDependencies": {
    "@testing-library/jest-dom": "^6.9.1",
    "@testing-library/react": "^16.3.2",
    "@testing-library/user-event": "^14.6.1",
    "@types/node": "^24.13.2",
    "@types/react": "^19.2.17",
    "@types/react-dom": "^19.2.3",
    "@vitejs/plugin-react": "^6.0.3",
    "jsdom": "^29.1.1",
    "oxlint": "^1.71.0",
    "typescript": "~6.0.2",
    "vite": "^8.1.1",
    "vitest": "^4.1.10"
  }
}
```

- [ ] **Step 2: Create `vite.config.ts`**

```ts
/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: './',
  test: {
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    globals: true,
  },
});
```

- [ ] **Step 3: Create `tsconfig.json`, `tsconfig.app.json`, `tsconfig.node.json`**

`tsconfig.json`:
```json
{
  "files": [],
  "references": [
    { "path": "./tsconfig.app.json" },
    { "path": "./tsconfig.node.json" }
  ]
}
```

`tsconfig.app.json`:
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "useDefineForClassFields": true,
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "Bundler",
    "allowImportingTsExtensions": true,
    "verbatimModuleSyntax": false,
    "moduleDetection": "force",
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "erasableSyntaxOnly": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedSideEffectImports": true,
    "types": ["vite/client", "vitest/globals", "@testing-library/jest-dom"]
  },
  "include": ["src"]
}
```

> **Note (post-Task-3 ruling):** `verbatimModuleSyntax` is `false` here (not `true` as Ocean Math Quest has it) and `types` includes `"vite/client"` — both were discovered missing/wrong during Task 3's review, after `tsc -b` failed on every mixed type+value import written across this plan's own task code, plus a missing ambient CSS-module declaration for `main.tsx`'s `./index.css` import. Fixed in place here so this scaffold section reflects the corrected config; see the SDD ledger for the full ruling.

`tsconfig.node.json`:
```json
{
  "compilerOptions": {
    "target": "ES2023",
    "lib": ["ES2023"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "Bundler",
    "allowImportingTsExtensions": true,
    "verbatimModuleSyntax": false,
    "moduleDetection": "force",
    "noEmit": true,
    "strict": true
  },
  "include": ["vite.config.ts"]
}
```

- [ ] **Step 4: Create `.oxlintrc.json`**

```json
{
  "$schema": "./node_modules/oxlint/configuration_schema.json",
  "categories": {
    "correctness": "error"
  }
}
```

- [ ] **Step 5: Create `index.html`**

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
    <title>Circuit Workshop</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 6: Create `public/favicon.svg`**

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <circle cx="16" cy="16" r="14" fill="#ffcc33" stroke="#1a1a1a" stroke-width="2"/>
  <circle cx="12" cy="13" r="2.5" fill="#1a1a1a"/>
  <circle cx="20" cy="13" r="2.5" fill="#1a1a1a"/>
  <path d="M10 21 Q16 26 22 21" stroke="#1a1a1a" stroke-width="2" fill="none" stroke-linecap="round"/>
</svg>
```

- [ ] **Step 7: Create `src/index.css`**

```css
:root {
  color-scheme: light;
  font-family: 'Comic Sans MS', 'Segoe Print', system-ui, sans-serif;
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  min-height: 100vh;
  background: #fef6e4;
  color: #1a1a1a;
  -webkit-tap-highlight-color: transparent;
}

#root {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}
```

- [ ] **Step 8: Create `src/App.tsx`**

```tsx
export default function App() {
  return (
    <main style={{ padding: '1rem', textAlign: 'center' }}>
      <h1>Circuit Workshop</h1>
      <p>The robot workshop is warming up&hellip;</p>
    </main>
  );
}
```

- [ ] **Step 9: Create `src/App.test.tsx`**

```tsx
import { render, screen } from '@testing-library/react';
import App from './App';

describe('App', () => {
  it('renders the Circuit Workshop heading', () => {
    render(<App />);
    expect(screen.getByRole('heading', { name: 'Circuit Workshop' })).toBeInTheDocument();
  });
});
```

- [ ] **Step 10: Create `src/main.tsx`**

```tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
```

- [ ] **Step 11: Create `src/test/setup.ts`**

```ts
import '@testing-library/jest-dom/vitest';
```

- [ ] **Step 12: Create `.github/workflows/deploy.yml`**

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [master]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: true

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npm test
      - run: npm run build
      - uses: actions/upload-pages-artifact@v3
        with:
          path: dist

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

- [ ] **Step 13: Create `.gitignore`**

```
node_modules
dist
*.local
```

- [ ] **Step 14: Create `README.md`**

```markdown
# Circuit Workshop

A cartoon circuits puzzle game: drag batteries, switches, LEDs and
wires onto a grid and watch the robot workshop light up. Teaches
open/closed circuits, switches, and series/parallel wiring.

## Develop

\`\`\`bash
npm install
npm run dev
\`\`\`

## Test

\`\`\`bash
npm test
\`\`\`

## Build

\`\`\`bash
npm run build
\`\`\`

## Progress data

All progress lives in the browser's \`localStorage\`, scoped to this
site's origin. No accounts, no ads.
```

- [ ] **Step 15: Install dependencies and run the test suite**

Run:
```bash
cd /home/rick/Documents/code/circuit-workshop && npm install && npm test
```
Expected: the `App` smoke test passes.

- [ ] **Step 16: Initialize git and commit**

```bash
cd /home/rick/Documents/code/circuit-workshop
git init
git add -A
git commit -m "chore: scaffold Circuit Workshop project"
```

---

### Task 2: Domain types and circuit solver

**Files:**
- Create: `circuit-workshop/src/domain/types.ts`
- Create: `circuit-workshop/src/domain/solveCircuit.ts`
- Test: `circuit-workshop/src/domain/solveCircuit.test.ts`

**Interfaces:**
- Consumes: nothing (pure domain layer).
- Produces:
  - `type ComponentType = 'wire' | 'switch' | 'led' | 'bulb' | 'battery'`
  - `interface PlacedComponent { type: ComponentType; closed?: boolean }`
  - `type EdgeKey = string` (format `"row,col,orientation"`, orientation is `'h'` or `'v'`)
  - `interface GridState { rows: number; cols: number; edges: Record<EdgeKey, PlacedComponent> }`
  - `function edgeKey(row: number, col: number, orientation: 'h' | 'v'): EdgeKey`
  - `function solveCircuit(grid: GridState): Set<EdgeKey>` — returns the keys of every placed component currently carrying current.

The grid is a set of junctions (`rows` × `cols` points). A placed component sits on an *edge* between two adjacent junctions: a horizontal edge at `(row, col)` connects junction `(row, col)` to `(row, col+1)`; a vertical edge at `(row, col)` connects `(row, col)` to `(row+1, col)`.

- [ ] **Step 1: Create `src/domain/types.ts`**

```ts
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
```

- [ ] **Step 2: Write the failing solver tests in `src/domain/solveCircuit.test.ts`**

```ts
import { solveCircuit } from './solveCircuit';
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
      [edgeKey(1, 1, 'v'), { type: 'wire' }],
      [edgeKey(1, 0, 'v'), { type: 'wire' }],
      [edgeKey(2, 0, 'h'), { type: 'switch', closed: false }],
      [edgeKey(1, 1, 'v'), { type: 'wire' }],
    ]);
    const live = solveCircuit(grid);
    expect(live.has(edgeKey(2, 0, 'h'))).toBe(false);
    expect(live.has(edgeKey(0, 0, 'v'))).toBe(true);
    expect(live.has(edgeKey(1, 0, 'h'))).toBe(true);
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
});
```

- [ ] **Step 3: Run tests to verify they fail**

Run: `cd /home/rick/Documents/code/circuit-workshop && npm test -- solveCircuit`
Expected: FAIL — `solveCircuit` module not found.

- [ ] **Step 4: Implement `src/domain/solveCircuit.ts`**

```ts
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
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `cd /home/rick/Documents/code/circuit-workshop && npm test -- solveCircuit`
Expected: PASS, all 5 tests green.

- [ ] **Step 6: Commit**

```bash
cd /home/rick/Documents/code/circuit-workshop
git add src/domain
git commit -m "feat: add circuit domain types and graph-based solver"
```

---

### Task 3: Level data

**Files:**
- Create: `circuit-workshop/src/domain/levels.ts`
- Test: `circuit-workshop/src/domain/levels.test.ts`

**Interfaces:**
- Consumes: `GridState`, `ComponentType`, `edgeKey`, `createEmptyGrid` from `./types` (Task 2).
- Produces:
  - `type RobotPart = 'nose' | 'eyes' | 'antenna' | 'propeller' | 'arms'`
  - `interface LevelDef { id: string; title: string; goal: string; rows: number; cols: number; fixed: GridState['edges']; tray: ComponentType[]; rewardPart: RobotPart }`
  - `const LEVELS: LevelDef[]` — ordered array, index 0 unlocked by default.

- [ ] **Step 1: Write the failing test in `src/domain/levels.test.ts`**

```ts
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

  it('assigns a distinct reward part to each of the first five levels', () => {
    const firstFive = LEVELS.slice(0, 5).map((level) => level.rewardPart);
    expect(new Set(firstFive).size).toBe(5);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd /home/rick/Documents/code/circuit-workshop && npm test -- levels`
Expected: FAIL — `./levels` module not found.

- [ ] **Step 3: Implement `src/domain/levels.ts`**

```ts
import { ComponentType, createEmptyGrid, edgeKey, GridState } from './types';

export type RobotPart = 'nose' | 'eyes' | 'antenna' | 'propeller' | 'arms';

export interface LevelDef {
  id: string;
  title: string;
  goal: string;
  rows: number;
  cols: number;
  fixed: GridState['edges'];
  tray: ComponentType[];
  rewardPart: RobotPart;
}

export const LEVELS: LevelDef[] = [
  {
    id: 'open-and-closed',
    title: 'Wake Up the Workbench Lamp',
    goal: 'Connect the battery to the bulb with wires to close the circuit.',
    rows: 2,
    cols: 2,
    fixed: {
      [edgeKey(0, 0, 'h')]: { type: 'battery' },
      [edgeKey(0, 1, 'v')]: { type: 'bulb' },
    },
    tray: ['wire', 'wire'],
    rewardPart: 'nose',
  },
  {
    id: 'switches',
    title: 'Install an On/Off Switch',
    goal: 'Add a switch to the loop, then close it to light the bulb.',
    rows: 2,
    cols: 2,
    fixed: {
      [edgeKey(0, 0, 'h')]: { type: 'battery' },
      [edgeKey(0, 1, 'v')]: { type: 'bulb' },
      [edgeKey(1, 0, 'h')]: { type: 'wire' },
    },
    tray: ['switch'],
    rewardPart: 'eyes',
  },
  {
    id: 'series',
    title: 'Wire Two Lights in a Row',
    goal: 'Wire both LEDs into a single loop so they light up together.',
    rows: 2,
    cols: 2,
    fixed: {
      [edgeKey(0, 0, 'h')]: { type: 'battery' },
      [edgeKey(0, 0, 'v')]: { type: 'led' },
      [edgeKey(1, 0, 'h')]: { type: 'led' },
    },
    tray: ['wire'],
    rewardPart: 'antenna',
  },
  {
    id: 'parallel',
    title: 'Give Each Light Its Own Path',
    goal: 'Wire two LEDs on separate parallel branches so both light together.',
    rows: 3,
    cols: 2,
    fixed: {
      [edgeKey(1, 0, 'h')]: { type: 'battery' },
      [edgeKey(0, 0, 'h')]: { type: 'led' },
      [edgeKey(2, 0, 'h')]: { type: 'led' },
    },
    tray: ['wire', 'wire', 'wire', 'wire'],
    rewardPart: 'propeller',
  },
  {
    id: 'mixed',
    title: 'Build the Big Gadget Circuit',
    goal: 'Wire two independent switch-controlled branches so each bulb has its own switch.',
    rows: 3,
    cols: 3,
    fixed: {
      [edgeKey(1, 0, 'h')]: { type: 'battery' },
      [edgeKey(0, 0, 'v')]: { type: 'bulb' },
      [edgeKey(2, 0, 'h')]: { type: 'bulb' },
    },
    tray: ['wire', 'wire', 'switch', 'switch'],
    rewardPart: 'arms',
  },
];
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd /home/rick/Documents/code/circuit-workshop && npm test -- levels`
Expected: PASS, all 4 tests green.

- [ ] **Step 5: Commit**

```bash
cd /home/rick/Documents/code/circuit-workshop
git add src/domain/levels.ts src/domain/levels.test.ts
git commit -m "feat: add ordered level definitions"
```

---

### Task 4: Progress schema and persistence

**Files:**
- Create: `circuit-workshop/src/storage/schema.ts`
- Create: `circuit-workshop/src/storage/persistence.ts`
- Test: `circuit-workshop/src/storage/persistence.test.ts`

**Interfaces:**
- Consumes: `LEVELS` from `../domain/levels` (Task 3, for `isLevelUnlocked` default-unlock logic).
- Produces:
  - `interface ProgressState { version: number; completedLevelIds: string[] }`
  - `function createDefaultProgress(): ProgressState`
  - `function loadProgress(): ProgressState`
  - `function saveProgress(state: ProgressState): void`
  - `function isLevelUnlocked(state: ProgressState, levelId: string): boolean` — level 0 always unlocked; level N unlocked iff level N-1's id is in `completedLevelIds`.
  - `function completeLevel(state: ProgressState, levelId: string): ProgressState` — pure, returns new state with `levelId` added if not already present.

- [ ] **Step 1: Write the failing tests in `src/storage/persistence.test.ts`**

```ts
import { beforeEach, describe, expect, it } from 'vitest';
import { LEVELS } from '../domain/levels';
import {
  completeLevel,
  createDefaultProgress,
  isLevelUnlocked,
  loadProgress,
  saveProgress,
} from './persistence';

describe('progress persistence', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('creates a default progress state with nothing completed', () => {
    const state = createDefaultProgress();
    expect(state.completedLevelIds).toEqual([]);
  });

  it('returns the default state when nothing is saved yet', () => {
    expect(loadProgress()).toEqual(createDefaultProgress());
  });

  it('round-trips a saved state through localStorage', () => {
    const state = completeLevel(createDefaultProgress(), LEVELS[0].id);
    saveProgress(state);
    expect(loadProgress()).toEqual(state);
  });

  it('falls back to the default state on corrupted storage', () => {
    localStorage.setItem('circuit-workshop:v1', 'not json');
    expect(loadProgress()).toEqual(createDefaultProgress());
  });

  it('does not duplicate an already-completed level', () => {
    const once = completeLevel(createDefaultProgress(), LEVELS[0].id);
    const twice = completeLevel(once, LEVELS[0].id);
    expect(twice.completedLevelIds).toEqual([LEVELS[0].id]);
  });

  it('unlocks only the first level by default', () => {
    const state = createDefaultProgress();
    expect(isLevelUnlocked(state, LEVELS[0].id)).toBe(true);
    expect(isLevelUnlocked(state, LEVELS[1].id)).toBe(false);
  });

  it('unlocks the next level once the previous one is completed', () => {
    const state = completeLevel(createDefaultProgress(), LEVELS[0].id);
    expect(isLevelUnlocked(state, LEVELS[1].id)).toBe(true);
    expect(isLevelUnlocked(state, LEVELS[2].id)).toBe(false);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd /home/rick/Documents/code/circuit-workshop && npm test -- persistence`
Expected: FAIL — `./persistence` module not found.

- [ ] **Step 3: Implement `src/storage/schema.ts`**

```ts
export const SCHEMA_VERSION = 1;
export const STORAGE_KEY = 'circuit-workshop:v1';

export interface ProgressState {
  version: number;
  completedLevelIds: string[];
}

export function createDefaultProgress(): ProgressState {
  return { version: SCHEMA_VERSION, completedLevelIds: [] };
}
```

- [ ] **Step 4: Implement `src/storage/persistence.ts`**

```ts
import { LEVELS } from '../domain/levels';
import { createDefaultProgress, ProgressState, SCHEMA_VERSION, STORAGE_KEY } from './schema';

export { createDefaultProgress };

function isValidShape(candidate: unknown): candidate is ProgressState {
  if (!candidate || typeof candidate !== 'object') return false;
  const version = (candidate as { version?: unknown }).version;
  const completed = (candidate as { completedLevelIds?: unknown }).completedLevelIds;
  return version === SCHEMA_VERSION && Array.isArray(completed);
}

export function loadProgress(): ProgressState {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return createDefaultProgress();
  try {
    const parsed = JSON.parse(raw);
    return isValidShape(parsed) ? parsed : createDefaultProgress();
  } catch {
    return createDefaultProgress();
  }
}

export function saveProgress(state: ProgressState): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function completeLevel(state: ProgressState, levelId: string): ProgressState {
  if (state.completedLevelIds.includes(levelId)) return state;
  return { ...state, completedLevelIds: [...state.completedLevelIds, levelId] };
}

export function isLevelUnlocked(state: ProgressState, levelId: string): boolean {
  const index = LEVELS.findIndex((level) => level.id === levelId);
  if (index <= 0) return true;
  const previousId = LEVELS[index - 1].id;
  return state.completedLevelIds.includes(previousId);
}
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `cd /home/rick/Documents/code/circuit-workshop && npm test -- persistence`
Expected: PASS, all 7 tests green.

- [ ] **Step 6: Commit**

```bash
cd /home/rick/Documents/code/circuit-workshop
git add src/storage
git commit -m "feat: add versioned progress schema and localStorage persistence"
```

---

### Task 5: Progress React context

**Files:**
- Create: `circuit-workshop/src/store/ProgressContext.tsx`
- Test: `circuit-workshop/src/store/ProgressContext.test.tsx`

**Interfaces:**
- Consumes: `ProgressState`, `createDefaultProgress`, `loadProgress`, `saveProgress`, `completeLevel`, `isLevelUnlocked` from `../storage/persistence` (Task 4); `LEVELS` from `../domain/levels` (Task 3).
- Produces:
  - `function ProgressProvider({ children }: { children: React.ReactNode }): JSX.Element`
  - `function useProgress(): { state: ProgressState; completeLevel: (levelId: string) => void; isLevelUnlocked: (levelId: string) => boolean }` — throws if used outside `ProgressProvider`.

- [ ] **Step 1: Write the failing test in `src/store/ProgressContext.test.tsx`**

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import { LEVELS } from '../domain/levels';
import { loadProgress } from '../storage/persistence';
import { ProgressProvider, useProgress } from './ProgressContext';

function Harness() {
  const { state, completeLevel, isLevelUnlocked } = useProgress();
  return (
    <div>
      <span data-testid="completed-count">{state.completedLevelIds.length}</span>
      <span data-testid="second-unlocked">{String(isLevelUnlocked(LEVELS[1].id))}</span>
      <button onClick={() => completeLevel(LEVELS[0].id)}>Complete first level</button>
    </div>
  );
}

describe('ProgressContext', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('starts with zero completed levels and the second level locked', () => {
    render(
      <ProgressProvider>
        <Harness />
      </ProgressProvider>,
    );
    expect(screen.getByTestId('completed-count')).toHaveTextContent('0');
    expect(screen.getByTestId('second-unlocked')).toHaveTextContent('false');
  });

  it('unlocks the second level and persists after completing the first', async () => {
    const user = userEvent.setup();
    render(
      <ProgressProvider>
        <Harness />
      </ProgressProvider>,
    );
    await user.click(screen.getByText('Complete first level'));
    expect(screen.getByTestId('completed-count')).toHaveTextContent('1');
    expect(screen.getByTestId('second-unlocked')).toHaveTextContent('true');
    expect(loadProgress().completedLevelIds).toEqual([LEVELS[0].id]);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd /home/rick/Documents/code/circuit-workshop && npm test -- ProgressContext`
Expected: FAIL — `./ProgressContext` module not found.

- [ ] **Step 3: Implement `src/store/ProgressContext.tsx`**

```tsx
import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import {
  completeLevel as completeLevelInState,
  isLevelUnlocked as isLevelUnlockedInState,
  loadProgress,
  saveProgress,
} from '../storage/persistence';
import { ProgressState } from '../storage/schema';

interface ProgressContextValue {
  state: ProgressState;
  completeLevel: (levelId: string) => void;
  isLevelUnlocked: (levelId: string) => boolean;
}

const ProgressContext = createContext<ProgressContextValue | null>(null);

export function ProgressProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<ProgressState>(() => loadProgress());

  const completeLevel = useCallback((levelId: string) => {
    setState((previous) => {
      const next = completeLevelInState(previous, levelId);
      saveProgress(next);
      return next;
    });
  }, []);

  const isLevelUnlocked = useCallback(
    (levelId: string) => isLevelUnlockedInState(state, levelId),
    [state],
  );

  const value = useMemo(
    () => ({ state, completeLevel, isLevelUnlocked }),
    [state, completeLevel, isLevelUnlocked],
  );

  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>;
}

export function useProgress(): ProgressContextValue {
  const context = useContext(ProgressContext);
  if (!context) throw new Error('useProgress must be used within a ProgressProvider');
  return context;
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd /home/rick/Documents/code/circuit-workshop && npm test -- ProgressContext`
Expected: PASS, both tests green.

- [ ] **Step 5: Commit**

```bash
cd /home/rick/Documents/code/circuit-workshop
git add src/store
git commit -m "feat: add ProgressProvider/useProgress React context"
```

---

### Task 6: CircuitGrid component

**Files:**
- Create: `circuit-workshop/src/components/CircuitGrid.tsx`
- Create: `circuit-workshop/src/components/CircuitGrid.css`
- Test: `circuit-workshop/src/components/CircuitGrid.test.tsx`

**Interfaces:**
- Consumes: `GridState`, `PlacedComponent`, `ComponentType`, `edgeKey`, `edgeJunctions` from `../domain/types` (Task 2); `solveCircuit` from `../domain/solveCircuit` (Task 2).
- Produces:
  - `interface CircuitGridProps { grid: GridState; onPlace: (key: string, type: ComponentType) => void; onToggleSwitch: (key: string) => void; pendingComponent: ComponentType | null }`
  - `function CircuitGrid(props: CircuitGridProps): JSX.Element` — renders an SVG grid; empty edge slots adjacent to any filled junction are clickable drop targets when `pendingComponent` is set (tap-to-place, chosen over freeform drag for mobile reliability — the tray selects a component, then the kid taps the target slot); placed switches are tappable to toggle; edges present in `solveCircuit(grid)` get the CSS class `live`.

Note: the original design described drag-and-drop; for touch reliability this implements it as **select-then-tap-target** (tap a tray item to arm it, tap an empty slot to place it) which is the standard mobile-friendly substitute for drag-and-drop and satisfies the same "tap-to-place" fallback considered during interaction design. This keeps the interaction fully testable with `fireEvent.click` / `userEvent.click` rather than simulated pointer-drag sequences.

- [ ] **Step 1: Write the failing tests in `src/components/CircuitGrid.test.tsx`**

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { createEmptyGrid, edgeKey } from '../domain/types';
import { CircuitGrid } from './CircuitGrid';

describe('CircuitGrid', () => {
  it('calls onPlace with the tapped empty slot when a component is pending', async () => {
    const user = userEvent.setup();
    const onPlace = vi.fn();
    render(
      <CircuitGrid
        grid={createEmptyGrid(2, 2)}
        onPlace={onPlace}
        onToggleSwitch={vi.fn()}
        pendingComponent="wire"
      />,
    );
    await user.click(screen.getByTestId(`slot-${edgeKey(0, 0, 'h')}`));
    expect(onPlace).toHaveBeenCalledWith(edgeKey(0, 0, 'h'), 'wire');
  });

  it('does not call onPlace on an occupied slot', async () => {
    const user = userEvent.setup();
    const onPlace = vi.fn();
    const grid = createEmptyGrid(2, 2);
    grid.edges[edgeKey(0, 0, 'h')] = { type: 'battery' };
    render(
      <CircuitGrid grid={grid} onPlace={onPlace} onToggleSwitch={vi.fn()} pendingComponent="wire" />,
    );
    await user.click(screen.getByTestId(`slot-${edgeKey(0, 0, 'h')}`));
    expect(onPlace).not.toHaveBeenCalled();
  });

  it('toggles a placed switch on tap', async () => {
    const user = userEvent.setup();
    const onToggleSwitch = vi.fn();
    const grid = createEmptyGrid(2, 2);
    grid.edges[edgeKey(0, 0, 'h')] = { type: 'switch', closed: false };
    render(
      <CircuitGrid grid={grid} onPlace={vi.fn()} onToggleSwitch={onToggleSwitch} pendingComponent={null} />,
    );
    await user.click(screen.getByTestId(`slot-${edgeKey(0, 0, 'h')}`));
    expect(onToggleSwitch).toHaveBeenCalledWith(edgeKey(0, 0, 'h'));
  });

  it('marks live components with the live class', () => {
    const grid = createEmptyGrid(2, 2);
    grid.edges[edgeKey(0, 0, 'h')] = { type: 'battery' };
    grid.edges[edgeKey(0, 0, 'v')] = { type: 'wire' };
    grid.edges[edgeKey(0, 1, 'v')] = { type: 'wire' };
    grid.edges[edgeKey(1, 0, 'h')] = { type: 'wire' };
    render(<CircuitGrid grid={grid} onPlace={vi.fn()} onToggleSwitch={vi.fn()} pendingComponent={null} />);
    expect(screen.getByTestId(`slot-${edgeKey(0, 0, 'v')}`)).toHaveClass('live');
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd /home/rick/Documents/code/circuit-workshop && npm test -- CircuitGrid`
Expected: FAIL — `./CircuitGrid` module not found.

- [ ] **Step 3: Implement `src/components/CircuitGrid.css`**

```css
.circuit-grid-wrap {
  display: flex;
  justify-content: center;
  padding: 1rem;
}

.circuit-grid {
  background: #f4e3c1;
  border: 4px solid #1a1a1a;
  border-radius: 18px 22px 16px 24px;
  box-shadow: 4px 4px 0 #1a1a1a;
}

.junction {
  fill: #1a1a1a;
}

.slot {
  stroke: #c9b184;
  stroke-width: 6;
  stroke-linecap: round;
  fill: none;
  cursor: pointer;
}

.slot.placeable {
  stroke: #8fbf8f;
  stroke-dasharray: 4 6;
}

.slot.occupied {
  stroke: #4a4a4a;
}

.slot.switch-open {
  stroke: #c0392b;
}

.slot.switch-closed {
  stroke: #27ae60;
}

.slot.live {
  stroke: #ffcc33;
  filter: drop-shadow(0 0 4px #ffcc33);
}
```

- [ ] **Step 4: Implement `src/components/CircuitGrid.tsx`**

```tsx
import { ComponentType, edgeJunctions, edgeKey, GridState } from '../domain/types';
import { solveCircuit } from '../domain/solveCircuit';
import './CircuitGrid.css';

export interface CircuitGridProps {
  grid: GridState;
  onPlace: (key: string, type: ComponentType) => void;
  onToggleSwitch: (key: string) => void;
  pendingComponent: ComponentType | null;
}

const CELL_SIZE = 64;
const PADDING = 24;

export function CircuitGrid({ grid, onPlace, onToggleSwitch, pendingComponent }: CircuitGridProps) {
  const live = solveCircuit(grid);
  const width = (grid.cols - 1) * CELL_SIZE + PADDING * 2;
  const height = (grid.rows - 1) * CELL_SIZE + PADDING * 2;

  const slotKeys: string[] = [];
  for (let row = 0; row < grid.rows; row += 1) {
    for (let col = 0; col < grid.cols; col += 1) {
      if (col < grid.cols - 1) slotKeys.push(edgeKey(row, col, 'h'));
      if (row < grid.rows - 1) slotKeys.push(edgeKey(row, col, 'v'));
    }
  }

  function handleSlotClick(key: string) {
    const component = grid.edges[key];
    if (component) {
      if (component.type === 'switch') onToggleSwitch(key);
      return;
    }
    if (pendingComponent) onPlace(key, pendingComponent);
  }

  return (
    <div className="circuit-grid-wrap">
      <svg className="circuit-grid" width={width} height={height} role="group" aria-label="Circuit grid">
        {slotKeys.map((key) => {
          const [a, b] = edgeJunctions(key);
          const x1 = PADDING + a.col * CELL_SIZE;
          const y1 = PADDING + a.row * CELL_SIZE;
          const x2 = PADDING + b.col * CELL_SIZE;
          const y2 = PADDING + b.row * CELL_SIZE;
          const component = grid.edges[key];
          const classes = ['slot'];
          if (!component) classes.push(pendingComponent ? 'placeable' : 'empty');
          if (component) classes.push('occupied');
          if (component?.type === 'switch') classes.push(component.closed ? 'switch-closed' : 'switch-open');
          if (live.has(key)) classes.push('live');
          return (
            <line
              key={key}
              data-testid={`slot-${key}`}
              className={classes.join(' ')}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              onClick={() => handleSlotClick(key)}
            />
          );
        })}
        {Array.from({ length: grid.rows }).map((_, row) =>
          Array.from({ length: grid.cols }).map((_, col) => (
            <circle
              key={`${row},${col}`}
              className="junction"
              cx={PADDING + col * CELL_SIZE}
              cy={PADDING + row * CELL_SIZE}
              r={4}
            />
          )),
        )}
      </svg>
    </div>
  );
}
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `cd /home/rick/Documents/code/circuit-workshop && npm test -- CircuitGrid`
Expected: PASS, all 4 tests green.

- [ ] **Step 6: Commit**

```bash
cd /home/rick/Documents/code/circuit-workshop
git add src/components/CircuitGrid.tsx src/components/CircuitGrid.css src/components/CircuitGrid.test.tsx
git commit -m "feat: add SVG CircuitGrid with tap-to-place and live-edge rendering"
```

---

### Task 7: ComponentTray and RobotSidekick

**Files:**
- Create: `circuit-workshop/src/components/ComponentTray.tsx`
- Create: `circuit-workshop/src/components/ComponentTray.css`
- Test: `circuit-workshop/src/components/ComponentTray.test.tsx`
- Create: `circuit-workshop/src/components/RobotSidekick.tsx`
- Create: `circuit-workshop/src/components/RobotSidekick.css`
- Test: `circuit-workshop/src/components/RobotSidekick.test.tsx`

**Interfaces:**
- Consumes: `ComponentType` from `../domain/types` (Task 2); `RobotPart` from `../domain/levels` (Task 3).
- Produces:
  - `interface ComponentTrayProps { items: ComponentType[]; selected: ComponentType | null; onSelect: (type: ComponentType) => void }`
  - `function ComponentTray(props: ComponentTrayProps): JSX.Element`
  - `interface RobotSidekickProps { earnedParts: RobotPart[]; celebrating: boolean }`
  - `function RobotSidekick(props: RobotSidekickProps): JSX.Element` — cartoon SVG robot; each part in `earnedParts` renders visible (nose/eyes/antenna/propeller/arms), others render as dim placeholders; `celebrating` adds a bounce animation class.

- [ ] **Step 1: Write the failing test in `src/components/ComponentTray.test.tsx`**

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ComponentTray } from './ComponentTray';

describe('ComponentTray', () => {
  it('renders one button per tray item and marks the selected one', () => {
    render(<ComponentTray items={['wire', 'switch']} selected="wire" onSelect={vi.fn()} />);
    expect(screen.getByRole('button', { name: /wire/i })).toHaveClass('selected');
    expect(screen.getByRole('button', { name: /switch/i })).not.toHaveClass('selected');
  });

  it('calls onSelect with the tapped item type', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(<ComponentTray items={['wire', 'switch']} selected={null} onSelect={onSelect} />);
    await user.click(screen.getByRole('button', { name: /switch/i }));
    expect(onSelect).toHaveBeenCalledWith('switch');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd /home/rick/Documents/code/circuit-workshop && npm test -- ComponentTray`
Expected: FAIL — `./ComponentTray` module not found.

- [ ] **Step 3: Implement `src/components/ComponentTray.css`**

```css
.component-tray {
  display: flex;
  gap: 0.75rem;
  justify-content: center;
  flex-wrap: wrap;
  padding: 0.75rem;
}

.tray-item {
  font: inherit;
  font-size: 0.85rem;
  padding: 0.6rem 1rem;
  border: 3px solid #1a1a1a;
  border-radius: 14px 18px 12px 20px;
  background: #ffe9a8;
  box-shadow: 3px 3px 0 #1a1a1a;
  cursor: pointer;
}

.tray-item.selected {
  background: #ffcc33;
  transform: translate(-2px, -2px);
  box-shadow: 5px 5px 0 #1a1a1a;
}
```

- [ ] **Step 4: Implement `src/components/ComponentTray.tsx`**

```tsx
import { ComponentType } from '../domain/types';
import './ComponentTray.css';

export interface ComponentTrayProps {
  items: ComponentType[];
  selected: ComponentType | null;
  onSelect: (type: ComponentType) => void;
}

const LABELS: Record<ComponentType, string> = {
  wire: 'Wire',
  switch: 'Switch',
  led: 'LED',
  bulb: 'Bulb',
  battery: 'Battery',
};

export function ComponentTray({ items, selected, onSelect }: ComponentTrayProps) {
  return (
    <div className="component-tray">
      {items.map((type, index) => (
        <button
          key={`${type}-${index}`}
          type="button"
          className={`tray-item${type === selected ? ' selected' : ''}`}
          onClick={() => onSelect(type)}
        >
          {LABELS[type]}
        </button>
      ))}
    </div>
  );
}
```

- [ ] **Step 5: Run ComponentTray tests to verify they pass**

Run: `cd /home/rick/Documents/code/circuit-workshop && npm test -- ComponentTray`
Expected: PASS, both tests green.

- [ ] **Step 6: Write the failing test in `src/components/RobotSidekick.test.tsx`**

```tsx
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { RobotSidekick } from './RobotSidekick';

describe('RobotSidekick', () => {
  it('marks earned parts as earned and leaves the rest dim', () => {
    render(<RobotSidekick earnedParts={['nose']} celebrating={false} />);
    expect(screen.getByTestId('part-nose')).toHaveClass('earned');
    expect(screen.getByTestId('part-eyes')).not.toHaveClass('earned');
  });

  it('adds the celebrating class when celebrating', () => {
    render(<RobotSidekick earnedParts={[]} celebrating />);
    expect(screen.getByTestId('robot-sidekick')).toHaveClass('celebrating');
  });
});
```

- [ ] **Step 7: Run test to verify it fails**

Run: `cd /home/rick/Documents/code/circuit-workshop && npm test -- RobotSidekick`
Expected: FAIL — `./RobotSidekick` module not found.

- [ ] **Step 8: Implement `src/components/RobotSidekick.css`**

```css
.robot-sidekick {
  display: block;
  margin: 0 auto;
}

.robot-sidekick.celebrating {
  animation: robot-bounce 0.6s ease-in-out infinite;
}

@keyframes robot-bounce {
  0%, 100% { transform: translateY(0) rotate(-2deg); }
  50% { transform: translateY(-10px) rotate(2deg); }
}

.robot-part {
  opacity: 0.25;
}

.robot-part.earned {
  opacity: 1;
}
```

- [ ] **Step 9: Implement `src/components/RobotSidekick.tsx`**

```tsx
import { RobotPart } from '../domain/levels';
import './RobotSidekick.css';

export interface RobotSidekickProps {
  earnedParts: RobotPart[];
  celebrating: boolean;
}

const PARTS: RobotPart[] = ['nose', 'eyes', 'antenna', 'propeller', 'arms'];

export function RobotSidekick({ earnedParts, celebrating }: RobotSidekickProps) {
  const isEarned = (part: RobotPart) => earnedParts.includes(part);

  return (
    <svg
      data-testid="robot-sidekick"
      className={`robot-sidekick${celebrating ? ' celebrating' : ''}`}
      width={160}
      height={180}
      viewBox="0 0 160 180"
      role="img"
      aria-label="Robot sidekick"
    >
      <rect x="30" y="60" width="100" height="90" rx="18" fill="#c9d6e3" stroke="#1a1a1a" strokeWidth="4" />
      <rect x="45" y="10" width="70" height="55" rx="16" fill="#e3ecf5" stroke="#1a1a1a" strokeWidth="4" />

      <g data-testid="part-antenna" className={`robot-part${isEarned('antenna') ? ' earned' : ''}`}>
        <line x1="80" y1="10" x2="80" y2="-10" stroke="#1a1a1a" strokeWidth="4" />
        <circle cx="80" cy="-14" r="6" fill="#ffcc33" stroke="#1a1a1a" strokeWidth="3" />
      </g>

      <g data-testid="part-eyes" className={`robot-part${isEarned('eyes') ? ' earned' : ''}`}>
        <circle cx="65" cy="35" r="7" fill="#27ae60" />
        <circle cx="95" cy="35" r="7" fill="#27ae60" />
      </g>

      <g data-testid="part-nose" className={`robot-part${isEarned('nose') ? ' earned' : ''}`}>
        <circle cx="80" cy="48" r="5" fill="#ff6b6b" />
      </g>

      <g data-testid="part-arms" className={`robot-part${isEarned('arms') ? ' earned' : ''}`}>
        <rect x="8" y="75" width="20" height="12" rx="6" fill="#c9d6e3" stroke="#1a1a1a" strokeWidth="3" />
        <rect x="132" y="75" width="20" height="12" rx="6" fill="#c9d6e3" stroke="#1a1a1a" strokeWidth="3" />
      </g>

      <g data-testid="part-propeller" className={`robot-part${isEarned('propeller') ? ' earned' : ''}`}>
        <line x1="50" y1="14" x2="110" y2="14" stroke="#1a1a1a" strokeWidth="4" />
      </g>
    </svg>
  );
}
```

- [ ] **Step 10: Run tests to verify they pass**

Run: `cd /home/rick/Documents/code/circuit-workshop && npm test -- RobotSidekick`
Expected: PASS, both tests green.

- [ ] **Step 11: Commit**

```bash
cd /home/rick/Documents/code/circuit-workshop
git add src/components/ComponentTray.tsx src/components/ComponentTray.css src/components/ComponentTray.test.tsx \
        src/components/RobotSidekick.tsx src/components/RobotSidekick.css src/components/RobotSidekick.test.tsx
git commit -m "feat: add ComponentTray and RobotSidekick components"
```

---

### Task 8: LevelScreen, WorkshopMap, and App wiring

**Files:**
- Create: `circuit-workshop/src/screens/LevelScreen.tsx`
- Create: `circuit-workshop/src/screens/LevelScreen.css`
- Test: `circuit-workshop/src/screens/LevelScreen.test.tsx`
- Create: `circuit-workshop/src/screens/WorkshopMap.tsx`
- Create: `circuit-workshop/src/screens/WorkshopMap.css`
- Test: `circuit-workshop/src/screens/WorkshopMap.test.tsx`
- Modify: `circuit-workshop/src/App.tsx`
- Modify: `circuit-workshop/src/App.test.tsx`

**Interfaces:**
- Consumes: `LEVELS`, `LevelDef`, `RobotPart` from `../domain/levels`; `GridState`, `ComponentType`, `createEmptyGrid` from `../domain/types`; `solveCircuit` from `../domain/solveCircuit`; `CircuitGrid` from `../components/CircuitGrid`; `ComponentTray` from `../components/ComponentTray`; `RobotSidekick` from `../components/RobotSidekick`; `useProgress`, `ProgressProvider` from `../store/ProgressContext`.
- Produces:
  - `interface LevelScreenProps { level: LevelDef; onComplete: () => void; onBack: () => void }`
  - `function LevelScreen(props: LevelScreenProps): JSX.Element` — owns local `GridState` seeded from `level.fixed`, renders `ComponentTray` + `CircuitGrid`, calls `onComplete` once (guarded so it only fires once per mount) the moment `solveCircuit` reports every non-wire/non-switch/non-battery component (`led`/`bulb`) as live.
  - `interface WorkshopMapProps { onSelectLevel: (levelId: string) => void }`
  - `function WorkshopMap(props: WorkshopMapProps): JSX.Element` — reads `useProgress()`, renders `RobotSidekick` with earned parts from completed levels, and a level list where locked levels are disabled buttons.
  - `App`: wraps everything in `ProgressProvider`, holds `activeLevelId: string | null` state, renders `WorkshopMap` when `null`, else `LevelScreen`.

- [ ] **Step 1: Write the failing test in `src/screens/LevelScreen.test.tsx`**

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { LEVELS } from '../domain/levels';
import { LevelScreen } from './LevelScreen';

describe('LevelScreen', () => {
  it('shows the level goal and tray items', () => {
    render(<LevelScreen level={LEVELS[0]} onComplete={vi.fn()} onBack={vi.fn()} />);
    expect(screen.getByText(LEVELS[0].goal)).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: /wire/i }).length).toBeGreaterThan(0);
  });

  it('calls onComplete once the fixed bulb is wired into a closed loop', async () => {
    const user = userEvent.setup();
    const onComplete = vi.fn();
    render(<LevelScreen level={LEVELS[0]} onComplete={onComplete} onBack={vi.fn()} />);

    // Level 0 grid is 2x2 with a battery on edge (0,0,'h') and a bulb on
    // (0,1,'v'); the tray has two wires to complete the loop via
    // (0,0,'v') and (1,0,'h').
    await user.click(screen.getAllByRole('button', { name: /wire/i })[0]);
    await user.click(screen.getByTestId('slot-0,0,v'));
    await user.click(screen.getAllByRole('button', { name: /wire/i })[0]);
    await user.click(screen.getByTestId('slot-1,0,h'));

    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it('calls onBack when the back button is tapped', async () => {
    const user = userEvent.setup();
    const onBack = vi.fn();
    render(<LevelScreen level={LEVELS[0]} onComplete={vi.fn()} onBack={onBack} />);
    await user.click(screen.getByRole('button', { name: /back/i }));
    expect(onBack).toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd /home/rick/Documents/code/circuit-workshop && npm test -- LevelScreen`
Expected: FAIL — `./LevelScreen` module not found.

- [ ] **Step 3: Implement `src/screens/LevelScreen.css`**

```css
.level-screen {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem;
}

.level-screen .goal {
  max-width: 420px;
  text-align: center;
  font-size: 1rem;
}

.level-screen .back-button {
  align-self: flex-start;
  font: inherit;
  border: 3px solid #1a1a1a;
  border-radius: 12px;
  background: #fff;
  padding: 0.4rem 0.9rem;
  cursor: pointer;
}
```

- [ ] **Step 4: Implement `src/screens/LevelScreen.tsx`**

```tsx
import { useRef, useState } from 'react';
import { LevelDef } from '../domain/levels';
import { solveCircuit } from '../domain/solveCircuit';
import { ComponentType, GridState } from '../domain/types';
import { CircuitGrid } from '../components/CircuitGrid';
import { ComponentTray } from '../components/ComponentTray';
import './LevelScreen.css';

export interface LevelScreenProps {
  level: LevelDef;
  onComplete: () => void;
  onBack: () => void;
}

function isSolved(level: LevelDef, grid: GridState): boolean {
  const live = solveCircuit(grid);
  return Object.entries(level.fixed)
    .filter(([, component]) => component.type === 'led' || component.type === 'bulb')
    .every(([key]) => live.has(key));
}

export function LevelScreen({ level, onComplete, onBack }: LevelScreenProps) {
  const [grid, setGrid] = useState<GridState>(() => ({
    rows: level.rows,
    cols: level.cols,
    edges: { ...level.fixed },
  }));
  const [selected, setSelected] = useState<ComponentType | null>(null);
  const completedRef = useRef(false);

  function handlePlace(key: string, type: ComponentType) {
    setGrid((previous) => {
      const next = { ...previous, edges: { ...previous.edges, [key]: { type } } };
      if (!completedRef.current && isSolved(level, next)) {
        completedRef.current = true;
        onComplete();
      }
      return next;
    });
    setSelected(null);
  }

  function handleToggleSwitch(key: string) {
    setGrid((previous) => {
      const component = previous.edges[key];
      if (!component || component.type !== 'switch') return previous;
      const next = {
        ...previous,
        edges: { ...previous.edges, [key]: { type: 'switch' as const, closed: !component.closed } },
      };
      if (!completedRef.current && isSolved(level, next)) {
        completedRef.current = true;
        onComplete();
      }
      return next;
    });
  }

  return (
    <div className="level-screen">
      <button type="button" className="back-button" onClick={onBack}>
        &larr; Back
      </button>
      <h2>{level.title}</h2>
      <p className="goal">{level.goal}</p>
      <CircuitGrid grid={grid} onPlace={handlePlace} onToggleSwitch={handleToggleSwitch} pendingComponent={selected} />
      <ComponentTray items={level.tray} selected={selected} onSelect={setSelected} />
    </div>
  );
}
```

- [ ] **Step 5: Run LevelScreen tests to verify they pass**

Run: `cd /home/rick/Documents/code/circuit-workshop && npm test -- LevelScreen`
Expected: PASS, all 3 tests green.

- [ ] **Step 6: Write the failing test in `src/screens/WorkshopMap.test.tsx`**

```tsx
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { LEVELS } from '../domain/levels';
import { ProgressProvider } from '../store/ProgressContext';
import { WorkshopMap } from './WorkshopMap';

describe('WorkshopMap', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('enables only the first level by default', () => {
    render(
      <ProgressProvider>
        <WorkshopMap onSelectLevel={vi.fn()} />
      </ProgressProvider>,
    );
    expect(screen.getByRole('button', { name: LEVELS[0].title })).toBeEnabled();
    expect(screen.getByRole('button', { name: LEVELS[1].title })).toBeDisabled();
  });
});
```

- [ ] **Step 7: Run test to verify it fails**

Run: `cd /home/rick/Documents/code/circuit-workshop && npm test -- WorkshopMap`
Expected: FAIL — `./WorkshopMap` module not found.

- [ ] **Step 8: Implement `src/screens/WorkshopMap.css`**

```css
.workshop-map {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem 1rem;
}

.level-list {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  width: 100%;
  max-width: 360px;
}

.level-list button {
  font: inherit;
  padding: 0.7rem 1rem;
  border: 3px solid #1a1a1a;
  border-radius: 14px 20px 12px 18px;
  background: #ffe9a8;
  box-shadow: 3px 3px 0 #1a1a1a;
  cursor: pointer;
}

.level-list button:disabled {
  background: #ddd;
  color: #888;
  box-shadow: none;
  cursor: not-allowed;
}
```

- [ ] **Step 9: Implement `src/screens/WorkshopMap.tsx`**

```tsx
import { LEVELS } from '../domain/levels';
import { RobotSidekick } from '../components/RobotSidekick';
import { useProgress } from '../store/ProgressContext';
import './WorkshopMap.css';

export interface WorkshopMapProps {
  onSelectLevel: (levelId: string) => void;
}

export function WorkshopMap({ onSelectLevel }: WorkshopMapProps) {
  const { state, isLevelUnlocked } = useProgress();
  const earnedParts = LEVELS.filter((level) => state.completedLevelIds.includes(level.id)).map(
    (level) => level.rewardPart,
  );

  return (
    <div className="workshop-map">
      <h1>The Robot Workshop</h1>
      <RobotSidekick earnedParts={earnedParts} celebrating={false} />
      <div className="level-list">
        {LEVELS.map((level) => (
          <button
            key={level.id}
            type="button"
            disabled={!isLevelUnlocked(level.id)}
            onClick={() => onSelectLevel(level.id)}
          >
            {level.title}
          </button>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 10: Run WorkshopMap tests to verify they pass**

Run: `cd /home/rick/Documents/code/circuit-workshop && npm test -- WorkshopMap`
Expected: PASS.

- [ ] **Step 11: Update the failing `App.test.tsx` for the new wiring**

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import { LEVELS } from './domain/levels';
import App from './App';

describe('App', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('shows the workshop map first, then the selected level on tap', async () => {
    const user = userEvent.setup();
    render(<App />);
    expect(screen.getByText('The Robot Workshop')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: LEVELS[0].title }));
    expect(screen.getByText(LEVELS[0].goal)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /back/i }));
    expect(screen.getByText('The Robot Workshop')).toBeInTheDocument();
  });
});
```

- [ ] **Step 12: Run test to verify it fails**

Run: `cd /home/rick/Documents/code/circuit-workshop && npm test -- App`
Expected: FAIL — `App` still renders the placeholder heading only.

- [ ] **Step 13: Implement `src/App.tsx`**

```tsx
import { useState } from 'react';
import { LEVELS } from './domain/levels';
import { ProgressProvider, useProgress } from './store/ProgressContext';
import { WorkshopMap } from './screens/WorkshopMap';
import { LevelScreen } from './screens/LevelScreen';

function AppShell() {
  const [activeLevelId, setActiveLevelId] = useState<string | null>(null);
  const { completeLevel } = useProgress();

  if (!activeLevelId) {
    return <WorkshopMap onSelectLevel={setActiveLevelId} />;
  }

  const level = LEVELS.find((candidate) => candidate.id === activeLevelId);
  if (!level) {
    setActiveLevelId(null);
    return null;
  }

  return (
    <LevelScreen
      level={level}
      onBack={() => setActiveLevelId(null)}
      onComplete={() => completeLevel(level.id)}
    />
  );
}

export default function App() {
  return (
    <ProgressProvider>
      <AppShell />
    </ProgressProvider>
  );
}
```

- [ ] **Step 14: Run the full test suite**

Run: `cd /home/rick/Documents/code/circuit-workshop && npm test`
Expected: PASS, every test file green.

- [ ] **Step 15: Lint and type-check**

Run: `cd /home/rick/Documents/code/circuit-workshop && npm run lint && npx tsc -b`
Expected: no errors.

- [ ] **Step 16: Manual mobile check**

Run: `cd /home/rick/Documents/code/circuit-workshop && npm run dev`
Open the printed local URL in a browser, switch dev tools to a mobile viewport (e.g. 390×844), and play through level 1: tap "Wire", tap an empty slot, repeat for the second wire, confirm the bulb's edge gets the `live` glow and the workshop map shows level 2 unlocked with the robot's nose no longer dimmed.

- [ ] **Step 17: Commit**

```bash
cd /home/rick/Documents/code/circuit-workshop
git add -A
git commit -m "feat: wire up LevelScreen, WorkshopMap, and App navigation"
```

---

## Deferred / Out of Scope

- Bespoke commissioned DOTT-style illustration assets — this plan implements the theme with hand-crafted SVG (bold outlines, bright fills, wobble animation) rather than commissioned art; swapping in richer artwork later is a drop-in replacement of the SVGs in `RobotSidekick.tsx` and `CircuitGrid.css`/`ComponentTray.css`, not a structural change.
- Sound effects — no audio in this plan; can be added later as an enhancement without touching the solver or state layers.
- GitHub repository creation/push — this plan creates a local git repo and a deploy workflow file; actually creating the remote GitHub repo and pushing (`gh repo create`, `git push`) is a manual step for Rick to confirm, not automated here.
