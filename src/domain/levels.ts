import { ComponentType, edgeKey, GridState } from './types';

export type RobotPart = 'nose' | 'eyes' | 'antenna' | 'propeller' | 'arms' | 'legs' | 'jetpack' | 'visor';

export type RobotMk2Part = 'core' | 'blaster' | 'wings' | 'shield' | 'radar' | 'boosters' | 'claws' | 'crown';

/** Stage 3's rewards are a small badge collection rather than a third robot. */
export type Badge = 'gear' | 'wrench' | 'bolt' | 'chip' | 'coil' | 'magnet' | 'circuit' | 'spark';

export interface LevelDef {
  id: string;
  title: string;
  goal: string;
  /**
   * Which stage this level belongs to. Later stages are appended after
   * all earlier ones in this array, so the existing purely-sequential
   * unlock rule (each level requires the one before it) already implies
   * "stage N+1 unlocks once every stage N level is done" — `stage` exists
   * for presentation (grouping on the map, picking which reward gets the
   * earned part/badge), not as a separate gate.
   */
  stage: 1 | 2 | 3;
  rows: number;
  cols: number;
  fixed: GridState['edges'];
  tray: ComponentType[];
  rewardPart: RobotPart | RobotMk2Part | Badge;
}

export const LEVELS: LevelDef[] = [
  {
    id: 'open-and-closed',
    stage: 1,
    title: 'Wake Up the Workbench Lamp',
    goal: 'A circuit is a loop electricity can travel around, from the battery, through the bulb, and back again — with no gaps! Connect the battery to the bulb using wires so the loop is completely closed, and the bulb will light up.',
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
    stage: 1,
    title: 'Install an On/Off Switch',
    goal: 'A switch is a spot in the circuit you can open or close on purpose, like a little gate. Closed, it lets electricity pass and the bulb lights up; open, it blocks the path and the bulb goes dark. Add a switch to the loop, then close it to turn the light on.',
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
    stage: 1,
    title: 'Wire Two Lights in a Row',
    goal: "When two lights are chained together, one after another on the same loop, that's called wiring them in series — the electricity has to flow through both to make it all the way around. Wire both LEDs into a single loop so they light up together.",
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
    stage: 1,
    title: 'Give Each Light Its Own Path',
    goal: "Give each light its own separate road back to the battery instead of sharing one loop — that's called wiring them in parallel. Build two paths so both LEDs can shine at the same time, each on its own road.",
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
    stage: 1,
    title: 'Build the Big Gadget Circuit',
    goal: 'Build two separate loops, each with its own bulb and its own switch, so you can turn each light on or off all by itself. Wire both loops and close both switches to light up the whole gadget.',
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
  {
    id: 'switch-gate',
    stage: 1,
    title: 'Wire Two Switches Into One Gate',
    goal: "Put both switches on the very same loop, one after the other. Electricity can't jump over an open switch, so both switches have to be closed at the same time before the bulb will light up.",
    rows: 2,
    cols: 2,
    fixed: {
      [edgeKey(0, 0, 'h')]: { type: 'battery' },
      [edgeKey(0, 1, 'v')]: { type: 'bulb' },
    },
    tray: ['switch', 'switch'],
    rewardPart: 'legs',
  },
  {
    id: 'combo',
    stage: 1,
    title: 'Power the Whole Workshop',
    goal: 'This circuit mixes it all together: two LEDs chained together in series on one loop, plus a third LED on its own separate path. Wire the whole thing up so all three lights get their turn to shine at once.',
    rows: 3,
    cols: 3,
    fixed: {
      [edgeKey(1, 0, 'h')]: { type: 'battery' },
      [edgeKey(0, 0, 'v')]: { type: 'led' },
      [edgeKey(0, 1, 'v')]: { type: 'led' },
      [edgeKey(2, 0, 'h')]: { type: 'led' },
    },
    tray: ['wire', 'wire', 'wire'],
    rewardPart: 'jetpack',
  },
  {
    id: 'grand-finale',
    stage: 1,
    title: 'Bring the Whole Workshop to Life',
    goal: 'The biggest circuit yet! It has a bulb guarded by two switches (both must be closed), two LEDs chained together in series, and a bonus bulb tucked onto its own extra path. Wire it all up and close both switches to light every single one.',
    rows: 4,
    cols: 2,
    fixed: {
      [edgeKey(0, 0, 'h')]: { type: 'bulb' },
      [edgeKey(1, 0, 'h')]: { type: 'battery' },
      [edgeKey(1, 0, 'v')]: { type: 'led' },
      [edgeKey(1, 1, 'v')]: { type: 'led' },
      [edgeKey(3, 0, 'h')]: { type: 'bulb' },
    },
    tray: ['switch', 'switch', 'wire', 'wire', 'wire'],
    rewardPart: 'visor',
  },
  {
    id: 'diode-intro',
    stage: 2,
    title: 'Wire In a One-Way Door',
    goal: "A diode is like a one-way door for electricity — current can only pass through it in ONE direction, not the other. Place the diode in the gap. If the bulb doesn't light up, tap the diode to flip which way its door swings open!",
    rows: 2,
    cols: 2,
    fixed: {
      [edgeKey(0, 0, 'h')]: { type: 'battery' },
      [edgeKey(0, 0, 'v')]: { type: 'bulb' },
      [edgeKey(1, 0, 'h')]: { type: 'wire' },
    },
    tray: ['diode'],
    rewardPart: 'core',
  },
  {
    id: 'buzzer-intro',
    stage: 2,
    title: 'Add a Warning Buzzer',
    goal: "Circuits don't just power lights — they can power sound too! A buzzer needs the same complete, unbroken loop as a bulb to make noise. Connect the battery to the buzzer with wires to close the circuit and hear it buzz.",
    rows: 2,
    cols: 2,
    fixed: {
      [edgeKey(0, 0, 'h')]: { type: 'battery' },
      [edgeKey(0, 1, 'v')]: { type: 'buzzer' },
    },
    tray: ['wire', 'wire'],
    rewardPart: 'blaster',
  },
  {
    id: 'motor-series',
    stage: 2,
    title: 'Power Up the Cooling Fan',
    goal: 'Motors spin when electricity flows through them, just like bulbs glow and buzzers buzz. Wire the motor and the LED into the same loop, one after another, so both come alive together.',
    rows: 2,
    cols: 2,
    fixed: {
      [edgeKey(0, 0, 'h')]: { type: 'battery' },
      [edgeKey(0, 0, 'v')]: { type: 'motor' },
      [edgeKey(1, 0, 'h')]: { type: 'led' },
    },
    tray: ['wire'],
    rewardPart: 'wings',
  },
  {
    id: 'double-diode',
    stage: 2,
    title: 'Two One-Way Doors',
    goal: "This loop needs TWO one-way doors instead of one. Place both diodes anywhere along the gaps, then flip each one (tap to flip!) until electricity can make it all the way around and light the bulb.",
    rows: 2,
    cols: 3,
    fixed: {
      [edgeKey(0, 0, 'h')]: { type: 'battery' },
      [edgeKey(1, 0, 'h')]: { type: 'bulb' },
    },
    tray: ['diode', 'diode', 'wire', 'wire'],
    rewardPart: 'shield',
  },
  {
    id: 'switch-diode-combo',
    stage: 2,
    title: 'Switch and Diode Together',
    goal: 'A switch and a diode can share the same loop: the switch must be closed AND the diode must be pointing the right way before the bulb will light. Get both right at the same time!',
    rows: 2,
    cols: 2,
    fixed: {
      [edgeKey(0, 0, 'h')]: { type: 'battery' },
      [edgeKey(0, 1, 'v')]: { type: 'bulb' },
    },
    tray: ['switch', 'diode'],
    rewardPart: 'radar',
  },
  {
    id: 'parallel-outputs',
    stage: 2,
    title: 'Give Sound and Spin Their Own Paths',
    goal: 'Give the buzzer and the motor their own separate paths back to the battery, just like you did with lights before — so both the sound and the spin happen at the same time, each on its own road.',
    rows: 3,
    cols: 2,
    fixed: {
      [edgeKey(1, 0, 'h')]: { type: 'battery' },
      [edgeKey(0, 0, 'h')]: { type: 'buzzer' },
      [edgeKey(2, 0, 'h')]: { type: 'motor' },
    },
    tray: ['wire', 'wire', 'wire', 'wire'],
    rewardPart: 'boosters',
  },
  {
    id: 'advanced-combo',
    stage: 2,
    title: 'The Advanced Workshop Circuit',
    goal: 'An even bigger circuit: a switch-gated bulb, two LEDs chained in series, and a motor guarded by a one-way diode — all wired into a single advanced gadget. Get every piece right to bring it fully to life.',
    rows: 4,
    cols: 2,
    fixed: {
      [edgeKey(0, 0, 'h')]: { type: 'bulb' },
      [edgeKey(1, 0, 'h')]: { type: 'battery' },
      [edgeKey(1, 0, 'v')]: { type: 'led' },
      [edgeKey(1, 1, 'v')]: { type: 'led' },
      [edgeKey(3, 0, 'h')]: { type: 'motor' },
    },
    tray: ['switch', 'switch', 'wire', 'wire', 'diode'],
    rewardPart: 'claws',
  },
  {
    id: 'stage2-finale',
    stage: 2,
    title: 'Power the Whole Advanced Workshop',
    goal: "The ultimate challenge! This circuit combines a switch-gated bulb, series LEDs, a diode-guarded motor, and a buzzer on its own path — everything you've learned, all at once. Wire it all up to power every single part of the advanced workshop.",
    rows: 4,
    cols: 3,
    fixed: {
      [edgeKey(0, 0, 'h')]: { type: 'bulb' },
      [edgeKey(1, 0, 'h')]: { type: 'battery' },
      [edgeKey(1, 0, 'v')]: { type: 'led' },
      [edgeKey(1, 1, 'v')]: { type: 'led' },
      [edgeKey(3, 0, 'h')]: { type: 'motor' },
      [edgeKey(0, 2, 'v')]: { type: 'buzzer' },
    },
    tray: ['switch', 'switch', 'wire', 'wire', 'diode', 'wire', 'wire'],
    rewardPart: 'crown',
  },
  {
    id: 'inverter-intro',
    stage: 3,
    title: 'Install a Backwards Switch',
    goal: "An inverter is a backwards switch — a NOT gate. It lets electricity through when you leave it ALONE, and BLOCKS it when you tap it closed, the opposite of a normal switch. Place the inverter and watch the bulb light up right away. Then tap it to see what 'off' looks like for this one!",
    rows: 2,
    cols: 2,
    fixed: {
      [edgeKey(0, 0, 'h')]: { type: 'battery' },
      [edgeKey(0, 1, 'v')]: { type: 'bulb' },
      [edgeKey(1, 0, 'h')]: { type: 'wire' },
    },
    tray: ['inverter'],
    rewardPart: 'gear',
  },
  {
    id: 'inverter-switch-combo',
    stage: 3,
    title: 'Mix a Switch and Its Opposite',
    goal: 'A switch and an inverter can share the same loop, but they want opposite treatment: close the switch, and leave the inverter alone. Get both right at once to light the bulb.',
    rows: 2,
    cols: 2,
    fixed: {
      [edgeKey(0, 0, 'h')]: { type: 'battery' },
      [edgeKey(0, 1, 'v')]: { type: 'bulb' },
    },
    tray: ['switch', 'inverter'],
    rewardPart: 'wrench',
  },
  {
    id: 'inverter-diode-combo',
    stage: 3,
    title: 'A Backwards Switch and a One-Way Door',
    goal: 'Now combine a one-way diode with a backwards inverter on the same loop. Figure out which way the diode should point, and remember: leave the inverter alone unless you want it to block.',
    rows: 2,
    cols: 2,
    fixed: {
      [edgeKey(0, 0, 'h')]: { type: 'battery' },
      [edgeKey(0, 1, 'v')]: { type: 'bulb' },
    },
    tray: ['diode', 'inverter'],
    rewardPart: 'bolt',
  },
  {
    id: 'triple-logic-combo',
    stage: 3,
    title: 'Three Kinds of Gate in One Loop',
    goal: "A switch, a one-way diode, and a backwards inverter, all on the same loop: close the switch, point the diode the right way, and leave the inverter untouched. Every piece has its own rule — get them all right together.",
    rows: 2,
    cols: 3,
    fixed: {
      [edgeKey(0, 0, 'h')]: { type: 'battery' },
      [edgeKey(1, 0, 'h')]: { type: 'bulb' },
    },
    tray: ['switch', 'diode', 'inverter', 'wire'],
    rewardPart: 'chip',
  },
  {
    id: 'or-intro',
    stage: 3,
    title: 'Give the Bulb Two Ways to Turn On',
    goal: "So far, every switch has needed to be closed for the bulb to light — that's called AND. This circuit is different: it has two separate switch-gated paths back to the battery, and closing EITHER one alone (not both) will light the bulb. That's called OR — the electricity just takes whichever path is open.",
    rows: 3,
    cols: 3,
    fixed: {
      [edgeKey(1, 0, 'h')]: { type: 'battery' },
      [edgeKey(1, 1, 'h')]: { type: 'bulb' },
    },
    tray: ['switch', 'switch', 'wire', 'wire', 'wire', 'wire', 'wire', 'wire'],
    rewardPart: 'coil',
  },
  {
    id: 'buzzer-inverter',
    stage: 3,
    title: 'A Backwards Switch for the Buzzer',
    goal: 'Inverters work the same way no matter what they power. Place the inverter to complete the loop and hear the buzzer sound right away — tap it if you want to silence it the backwards way.',
    rows: 2,
    cols: 2,
    fixed: {
      [edgeKey(0, 0, 'h')]: { type: 'battery' },
      [edgeKey(0, 1, 'v')]: { type: 'buzzer' },
      [edgeKey(1, 0, 'h')]: { type: 'wire' },
    },
    tray: ['inverter'],
    rewardPart: 'magnet',
  },
  {
    id: 'motor-or-diode',
    stage: 3,
    title: 'Two One-Way Paths to the Same Motor',
    goal: "OR works with diodes too, not just switches: this motor has two separate diode-gated paths back to the battery. Get EITHER diode pointing the right way (with its wires in place) and the motor spins — you don't need both.",
    rows: 3,
    cols: 3,
    fixed: {
      [edgeKey(1, 0, 'h')]: { type: 'battery' },
      [edgeKey(1, 1, 'h')]: { type: 'motor' },
    },
    tray: ['diode', 'diode', 'wire', 'wire', 'wire', 'wire', 'wire', 'wire'],
    rewardPart: 'circuit',
  },
  {
    id: 'stage3-finale',
    stage: 3,
    title: 'The Ultimate Logic Circuit',
    goal: "Everything you've learned, all in one big circuit: a switch-gated bulb, series LEDs, a diode-guarded motor, a buzzer, and now a backwards inverter too. Wire it all up, get every gate into the right state, and bring the whole advanced workshop to life.",
    rows: 4,
    cols: 3,
    fixed: {
      [edgeKey(0, 0, 'h')]: { type: 'bulb' },
      [edgeKey(1, 0, 'h')]: { type: 'battery' },
      [edgeKey(1, 0, 'v')]: { type: 'led' },
      [edgeKey(1, 1, 'v')]: { type: 'led' },
      [edgeKey(3, 0, 'h')]: { type: 'motor' },
      [edgeKey(0, 2, 'v')]: { type: 'buzzer' },
    },
    tray: ['switch', 'switch', 'wire', 'wire', 'diode', 'inverter', 'wire'],
    rewardPart: 'spark',
  },
];
