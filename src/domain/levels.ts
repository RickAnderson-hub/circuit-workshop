import { ComponentType, edgeKey, GridState } from './types';

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
