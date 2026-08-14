import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { RobotSidekick } from './RobotSidekick';

describe('RobotSidekick', () => {
  it('marks earned parts as earned and leaves the rest dim', () => {
    render(<RobotSidekick earnedParts={['nose']} celebrating={false} />);
    expect(screen.getByTestId('part-nose')).toHaveClass('earned');
    expect(screen.getByTestId('part-eyes')).not.toHaveClass('earned');
  });

  it('adds the celebrating class when celebrating', () => {
    render(<RobotSidekick earnedParts={[]} celebrating />);
    expect(screen.getByTestId('robot-sidekick')).toHaveClass('celebrating');
  });
});
