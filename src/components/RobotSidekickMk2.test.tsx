import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { RobotMk2Part } from '../domain/levels';
import { RobotSidekickMk2 } from './RobotSidekickMk2';

const ALL_PARTS: RobotMk2Part[] = ['core', 'blaster', 'wings', 'shield', 'radar', 'boosters', 'claws', 'crown'];

describe('RobotSidekickMk2', () => {
  it.each(ALL_PARTS)('marks %s as earned only when it is in earnedParts, leaving the rest dim', (earnedPart) => {
    render(<RobotSidekickMk2 earnedParts={[earnedPart]} celebrating={false} />);
    for (const part of ALL_PARTS) {
      if (part === earnedPart) expect(screen.getByTestId(`part-${part}`)).toHaveClass('earned');
      else expect(screen.getByTestId(`part-${part}`)).not.toHaveClass('earned');
    }
  });

  it('marks every part as earned once all parts have been earned', () => {
    render(<RobotSidekickMk2 earnedParts={ALL_PARTS} celebrating={false} />);
    for (const part of ALL_PARTS) {
      expect(screen.getByTestId(`part-${part}`)).toHaveClass('earned');
    }
  });

  it('ignores stage 1 reward parts mixed into earnedParts', () => {
    render(<RobotSidekickMk2 earnedParts={['nose', 'eyes', 'core']} celebrating={false} />);
    expect(screen.getByTestId('part-core')).toHaveClass('earned');
  });

  it('adds the celebrating class when celebrating', () => {
    render(<RobotSidekickMk2 earnedParts={[]} celebrating />);
    expect(screen.getByTestId('robot-sidekick-mk2')).toHaveClass('celebrating');
  });
});
