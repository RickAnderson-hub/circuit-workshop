import { LEVELS, RobotPart } from './levels';

export function earnedPartsFrom(completedLevelIds: string[]): RobotPart[] {
  return LEVELS.filter((level) => completedLevelIds.includes(level.id)).map((level) => level.rewardPart);
}
