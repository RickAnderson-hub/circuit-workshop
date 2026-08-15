import { Badge, RobotMk2Part, RobotPart } from '../domain/levels';
import './BadgeCollection.css';

export interface BadgeCollectionProps {
  earnedParts: (RobotPart | RobotMk2Part | Badge)[];
  celebrating: boolean;
}

const ALL_BADGES: Badge[] = ['gear', 'wrench', 'bolt', 'chip', 'coil', 'magnet', 'circuit', 'spark'];

const BADGE_COLORS: Record<Badge, string> = {
  gear: '#c9d6e3',
  wrench: '#8fbf8f',
  bolt: '#ffcc33',
  chip: '#7fa8c9',
  coil: '#ff8c42',
  magnet: '#ff6b6b',
  circuit: '#a8c9e0',
  spark: '#ffe9a8',
};

function BadgeIcon({ badge, earned }: { badge: Badge; earned: boolean }) {
  return (
    <g data-testid={`badge-${badge}`} className={`badge-icon${earned ? ' earned' : ''}`}>
      <path
        d="M 0 -18 L 5 -6 L 18 -6 L 8 2 L 12 15 L 0 7 L -12 15 L -8 2 L -18 -6 L -5 -6 Z"
        fill={BADGE_COLORS[badge]}
        stroke="#1a1a1a"
        strokeWidth={2.5}
        strokeLinejoin="round"
      />
    </g>
  );
}

export function BadgeCollection({ earnedParts, celebrating }: BadgeCollectionProps) {
  const isEarned = (badge: Badge) => earnedParts.includes(badge);

  return (
    <svg
      data-testid="badge-collection"
      className={`badge-collection${celebrating ? ' celebrating' : ''}`}
      width={320}
      height={80}
      viewBox="0 0 320 80"
      role="img"
      aria-label="Engineering badge collection"
    >
      {ALL_BADGES.map((badge, index) => (
        <g key={badge} transform={`translate(${20 + index * 40} 40)`}>
          <BadgeIcon badge={badge} earned={isEarned(badge)} />
        </g>
      ))}
    </svg>
  );
}
