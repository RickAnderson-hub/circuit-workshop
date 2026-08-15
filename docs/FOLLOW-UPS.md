# Follow-ups

Backlog of things worth doing next, gathered from the build and review process. Nothing here blocks play — the game is fully working today at all 5 levels.

## Gameplay / product decisions (need Rick's call, not just engineering)

- ~~Tray inventory is unlimited.~~ Done: each level's tray is now a finite, per-type budget (`Wire ×2`, etc.) computed from how many of that type appear in `level.tray` minus how many are currently placed on non-fixed grid edges. A type's tray button disables once its count hits zero and re-enables when a placed piece of that type is removed. No level data changed — every shipped level's tray already listed exactly the pieces needed. There's still no separate "clear board" button; per-piece removal (click or drag-back-to-tray) is the only undo, which was judged sufficient.
- **Only 5 levels.** Covers open/closed → switches → series → parallel → mixed. More levels (e.g. combining 3+ components, multiple switches gating one bulb, or an early intro to resistors/brightness) are a natural next chunk of content.
- **Sound effects.** No audio at all right now — a click/buzz on placement and a chime on solve would add a lot for a kid at low implementation cost.

## Art

- **Current art is functional, not the full Day-of-the-Tentacle style.** Bold-outline SVG shapes deliver the cartoon direction cheaply, but the "goofy little characters/props instead of schematic symbols" ambition from the original design isn't fully realized — components still read as stylized wires/switches rather than characters. A real illustration pass (hand-drawn or AI-generated then cleaned up) is a drop-in replacement for the SVGs in `RobotSidekick.tsx` and the component styling — no structural changes needed.

## Testing gaps (correctness is fine; coverage has holes)

- ~~The `live` (glowing) CSS state isn't directly asserted by any test.~~ Done: `data-testid="slot-*"` now lives on the visible line (the one that actually carries `classes.join(' ')`, including `live`); the invisible tap-target line got its own `data-testid="hit-*"`, and all CircuitGrid/LevelScreen/App tests were retargeted accordingly. Verified the fix has teeth by temporarily breaking the `live`-class computation and confirming the live-class test fails.
- ~~No automated solvability check for level data.~~ Done: `src/domain/levelSolvability.ts` brute-forces tray-component placements — respecting each type's finite budget, matching in-game behavior — and `src/domain/levelSolvability.test.ts` asserts every shipped level has at least one winning arrangement.
- ~~RobotSidekick's test only exercises 1 of 5 reward parts~~ Done: a parameterized test asserts each part is earned only when present in `earnedParts` (with the rest staying dim), plus a case for all five earned at once.
- **SVG `<line>` elements have a zero-area bounding box**, which blocks Playwright and similar browser-automation tools from clicking them even though real touch/mouse clicks work fine (confirmed manually). If an automated end-to-end test suite is ever added, swap in a `<rect>` (or similar) hit-area element so it's automation-friendly too.

## Small engineering cleanups (low risk, low priority) — all done

- ~~`saveProgress` writes to localStorage from inside a React state updater rather than a `useEffect`~~ Done: `ProgressContext` now saves via a `useEffect` keyed on `state` (skipping the initial mount so the just-loaded state isn't immediately rewritten), and `completeLevel`'s updater is a pure state transform.
- ~~`LevelScreen` isn't given a `key={level.id}` in `App.tsx`~~ Done: added.
- ~~`isSolved` only checks bulbs/LEDs listed in a level's `fixed` components~~ Done: `isSolved` (in `solveCircuit.ts`) now checks every bulb/LED currently on the *grid*, not just the level's fixed ones, so a tray-supplied bulb is held to the same standard. It also now requires at least one bulb/LED present (guards against a vacuously "solved" empty grid) and dropped its now-unused `level` parameter.
- ~~Minor dead code / redundant test setup~~ Done: removed the inert `'empty'` class push in `CircuitGrid` (there was never a `.slot.empty` CSS rule), removed the dead `environmentOptions.jsdom.localStorage: true` from `vite.config.ts` (jsdom doesn't actually wire that up to `window.localStorage` in this setup — `src/test/setup.ts`'s manual mock is the one doing real work), and simplified `ComponentTray`'s list key from `` `${type}-${index}` `` to plain `index` (the tray order is static per level, so the type prefix added nothing).

## Reference

Full build history, including every hand-traced level-geometry verification and the rulings made along the way, is in the git log (`git log --oneline`) and the original plan at `docs/superpowers/plans/2026-08-14-circuit-workshop.md`.
