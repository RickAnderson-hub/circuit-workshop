import { Badge, LEVELS, RobotMk2Part, RobotPart } from './levels';

export function earnedPartsFrom(completedLevelIds: string[]): (RobotPart | RobotMk2Part | Badge)[] {
  return LEVELS.filter((level) => completedLevelIds.includes(level.id)).map((level) => level.rewardPart);
}
