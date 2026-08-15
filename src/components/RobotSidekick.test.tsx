import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { RobotPart } from '../domain/levels';
import { RobotSidekick } from './RobotSidekick';

const ALL_PARTS: RobotPart[] = ['nose', 'eyes', 'antenna', 'propeller', 'arms', 'legs', 'jetpack', 'visor'];

describe('RobotSidekick', () => {
  it.each(ALL_PARTS)('marks %s as earned only when it is in earnedParts, leaving the rest dim', (earnedPart) => {
    render(<RobotSidekick earnedParts={[earnedPart]} celebrating={false} />);
    for (const part of ALL_PARTS) {
      if (part === earnedPart) expect(screen.getByTestId(`part-${part}`)).toHaveClass('earned');
      else expect(screen.getByTestId(`part-${part}`)).not.toHaveClass('earned');
    }
  });

  it('marks every part as earned once all parts have been earned', () => {
    render(<RobotSidekick earnedParts={ALL_PARTS} celebrating={false} />);
    for (const part of ALL_PARTS) {
      expect(screen.getByTestId(`part-${part}`)).toHaveClass('earned');
    }
  });

  it('adds the celebrating class when celebrating', () => {
    render(<RobotSidekick earnedParts={[]} celebrating />);
    expect(screen.getByTestId('robot-sidekick')).toHaveClass('celebrating');
  });
});
