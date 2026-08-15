import { ComponentType, edgeKey, GridState } from './types';

export type RobotPart = 'nose' | 'eyes' | 'antenna' | 'propeller' | 'arms' | 'legs' | 'jetpack' | 'visor';

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
];
