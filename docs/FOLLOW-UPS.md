# Follow-ups

Backlog of things worth doing next, gathered from the build and review process. Nothing here blocks play — the game is fully working today at all 5 levels.

## Gameplay / product decisions (need Rick's call, not just engineering)

- **Tray inventory is unlimited.** Components in the tray aren't consumed when placed, and there's no undo/reset button — a kid can spam every slot to brute-force a level, which blunts the puzzle. Options: give each level a fixed budget of pieces, or add a "clear board" button, or leave as-is (forgiving is arguably good for a 9-year-old's first exposure).
- **Only 5 levels.** Covers open/closed → switches → series → parallel → mixed. More levels (e.g. combining 3+ components, multiple switches gating one bulb, or an early intro to resistors/brightness) are a natural next chunk of content.
- **Sound effects.** No audio at all right now — a click/buzz on placement and a chime on solve would add a lot for a kid at low implementation cost.

## Art

- **Current art is functional, not the full Day-of-the-Tentacle style.** Bold-outline SVG shapes deliver the cartoon direction cheaply, but the "goofy little characters/props instead of schematic symbols" ambition from the original design isn't fully realized — components still read as stylized wires/switches rather than characters. A real illustration pass (hand-drawn or AI-generated then cleaned up) is a drop-in replacement for the SVGs in `RobotSidekick.tsx` and the component styling — no structural changes needed.

## Testing gaps (correctness is fine; coverage has holes)

- **The `live` (glowing) CSS state isn't directly asserted by any test.** The `data-testid` used in tests sits on the invisible tap-target line, not the visible line that actually gets the `live` class — the assertion passes for a reason unrelated to what it's meant to prove. Fix: move `data-testid` to the visible line, give the tap-target its own `data-testid`, retarget the CircuitGrid tests.
- **No automated solvability check for level data.** Every level's solvability has been verified by hand (twice — the 'parallel' level slipped through once and was caught by the final review). A test that brute-forces tray-component placements and asserts every level has at least one winning arrangement would catch this class of bug automatically instead of relying on manual tracing. This is the single highest-leverage test to add.
- **RobotSidekick's test only exercises 1 of 5 reward parts** (earned vs. dim), not the full part matrix.
- **SVG `<line>` elements have a zero-area bounding box**, which blocks Playwright and similar browser-automation tools from clicking them even though real touch/mouse clicks work fine (confirmed manually). If an automated end-to-end test suite is ever added, swap in a `<rect>` (or similar) hit-area element so it's automation-friendly too.

## Small engineering cleanups (low risk, low priority)

- `saveProgress` writes to localStorage from inside a React state updater rather than a `useEffect`; harmless today but not the idiomatic place for a side effect (StrictMode double-invokes updaters in dev).
- `LevelScreen` isn't given a `key={level.id}` in `App.tsx` — unreachable today since the app always routes back through the level list between levels, but would matter if a "Next Level" button is ever added directly.
- `isSolved` only checks bulbs/LEDs listed in a level's `fixed` components — a level that supplied a bulb via the tray instead would be ignored by the win check. No level does this currently.
- Minor dead code / redundant test setup: an inert `.slot.empty` CSS class, a duplicated localStorage mock mechanism in tests, a `ComponentTray` list key that's more specific than it needs to be.

## Reference

Full build history, including every hand-traced level-geometry verification and the rulings made along the way, is in the git log (`git log --oneline`) and the original plan at `docs/superpowers/plans/2026-08-14-circuit-workshop.md`.
