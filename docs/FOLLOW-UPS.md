# Follow-ups

Backlog of things worth doing next, gathered from the build and review process. Nothing here blocks play — the game is fully working today at all 8 levels.

## Session: harder level, better descriptions, Next button, switch-removal bug

- **Bug fixed: a placed switch could never be removed by tap.** `CircuitGrid.handleSlotClick` always toggled a placed switch, never removed it — dragging it back to the tray worked, but that's not a reliable interaction on touch devices, which this game is built for. Fixed with a press-and-hold (~500ms) to remove, leaving a quick tap to toggle as before. Verified with fake timers in tests and a real ~700ms hold in a live browser.
- **Added a Next Level button.** Solving a level now shows an inline completion banner (celebrating `RobotSidekick` + Back/Next buttons) without leaving the level screen; Next jumps straight into the next level, skipping the map. The map's own celebration animation still plays if the player hits Back instead. `earnedPartsFrom()` (`src/domain/rewards.ts`) was extracted so both `WorkshopMap` and `LevelScreen` compute the robot's earned parts the same way.
- **Rewrote every level's goal text** to teach the underlying circuit concept in plain language (what a circuit/loop is, why it has to close, what a switch does, series vs. parallel) rather than just describing the mechanical task.
- **Added an 8th, hardest level** (`grand-finale` — "Bring the Whole Workshop to Life"): a 4×2 grid using every single edge, four lights total (a switch-gated AND bulb, two series LEDs, and a nested-branch bulb), tray of 2 switches + 3 wires. Rewards a new `visor` robot part. Verified via `isLevelSolvable` and interactively in the browser, not just hand-traced.

## Gameplay / product decisions (need Rick's call, not just engineering) — all done

- ~~Tray inventory is unlimited.~~ Done: each level's tray is now a finite, per-type budget (`Wire ×2`, etc.) computed from how many of that type appear in `level.tray` minus how many are currently placed on non-fixed grid edges. A type's tray button disables once its count hits zero and re-enables when a placed piece of that type is removed. No level data changed — every shipped level's tray already listed exactly the pieces needed. There's still no separate "clear board" button; per-piece removal (click or drag-back-to-tray) is the only undo, which was judged sufficient.
- ~~Only 5 levels.~~ Done: added `switch-gate` (two switches in series gating one bulb — a logical-AND, distinct from `mixed`'s two *independent* switch branches) and `combo` (a bigger 3×3 circuit combining a series LED pair with a separate parallel LED branch, 3 fixed LEDs total). Both reward new robot parts (`legs`, `jetpack`) added to `RobotSidekick.tsx` in the same bold-outline SVG style as the original five. Verified via `isLevelSolvable` (not just hand-traced, given the 'parallel' level history) and interactively in the browser — including confirming `switch-gate` truly requires *both* switches closed, not either one.
- ~~Sound effects.~~ Done: `src/audio/sound.ts` synthesizes short tones with the Web Audio API (no asset files) — a blip on placing a component, a lower blip on removing one, and a rising 3-note chime on solving a level. `src/audio/useMuted.ts` is a small `localStorage`-backed hook (own key, independent of the progress schema); a 🔊/🔇 toggle button was added to both `WorkshopMap` and `LevelScreen`. Verified in a real browser by patching `AudioContext.prototype.createOscillator` to capture actual oscillator frequencies — confirmed place/remove/solve tones fire with the right pitches, and that muting genuinely suppresses them without affecting gameplay.

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
