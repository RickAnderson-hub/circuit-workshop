import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Badge } from '../domain/levels';
import { BadgeCollection } from './BadgeCollection';

const ALL_BADGES: Badge[] = ['gear', 'wrench', 'bolt', 'chip', 'coil', 'magnet', 'circuit', 'spark'];

describe('BadgeCollection', () => {
  it.each(ALL_BADGES)('marks %s as earned only when it is in earnedParts, leaving the rest dim', (earnedBadge) => {
    render(<BadgeCollection earnedParts={[earnedBadge]} celebrating={false} />);
    for (const badge of ALL_BADGES) {
      if (badge === earnedBadge) expect(screen.getByTestId(`badge-${badge}`)).toHaveClass('earned');
      else expect(screen.getByTestId(`badge-${badge}`)).not.toHaveClass('earned');
    }
  });

  it('marks every badge as earned once all badges have been earned', () => {
    render(<BadgeCollection earnedParts={ALL_BADGES} celebrating={false} />);
    for (const badge of ALL_BADGES) {
      expect(screen.getByTestId(`badge-${badge}`)).toHaveClass('earned');
    }
  });

  it('ignores robot reward parts mixed into earnedParts', () => {
    render(<BadgeCollection earnedParts={['nose', 'core', 'gear']} celebrating={false} />);
    expect(screen.getByTestId('badge-gear')).toHaveClass('earned');
  });

  it('adds the celebrating class when celebrating', () => {
    render(<BadgeCollection earnedParts={[]} celebrating />);
    expect(screen.getByTestId('badge-collection')).toHaveClass('celebrating');
  });
});
