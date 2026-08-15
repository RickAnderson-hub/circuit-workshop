import { Badge, RobotMk2Part, RobotPart } from '../domain/levels';
import './RobotSidekick.css';

export interface RobotSidekickMk2Props {
  earnedParts: (RobotPart | RobotMk2Part | Badge)[];
  celebrating: boolean;
}

export function RobotSidekickMk2({ earnedParts, celebrating }: RobotSidekickMk2Props) {
  const isEarned = (part: RobotMk2Part) => earnedParts.includes(part);

  return (
    <svg
      data-testid="robot-sidekick-mk2"
      className={`robot-sidekick${celebrating ? ' celebrating' : ''}`}
      width={160}
      height={180}
      viewBox="0 0 160 180"
      role="img"
      aria-label="Robot sidekick, Mark 2"
    >
      {/* Angular hexagonal head */}
      <path
        d="M 55 12 L 105 12 L 118 30 L 105 48 L 55 48 L 42 30 Z"
        fill="#a8c9e0"
        stroke="#1a1a1a"
        strokeWidth="4"
        strokeLinejoin="round"
      />
      {/* Angular torso, wider at the shoulders */}
      <path
        d="M 35 58 L 125 58 L 118 152 L 42 152 Z"
        fill="#7fa8c9"
        stroke="#1a1a1a"
        strokeWidth="4"
        strokeLinejoin="round"
      />

      <circle cx="70" cy="30" r="6" fill="#27ae60" />
      <circle cx="90" cy="30" r="6" fill="#27ae60" />

      <g data-testid="part-crown" className={`robot-part${isEarned('crown') ? ' earned' : ''}`}>
        <path d="M 55 12 L 62 -2 L 72 8 L 80 -6 L 88 8 L 98 -2 L 105 12 Z" fill="#ff8c42" stroke="#1a1a1a" strokeWidth="3" strokeLinejoin="round" />
      </g>

      <g data-testid="part-radar" className={`robot-part${isEarned('radar') ? ' earned' : ''}`}>
        <line x1="112" y1="18" x2="122" y2="4" stroke="#1a1a1a" strokeWidth="3" />
        <path d="M 116 3 A 8 8 0 0 1 128 8 L 122 10 A 3 3 0 0 0 118 7 Z" fill="#c9d6e3" stroke="#1a1a1a" strokeWidth="2.5" strokeLinejoin="round" />
      </g>

      <g data-testid="part-core" className={`robot-part${isEarned('core') ? ' earned' : ''}`}>
        <circle cx="80" cy="85" r="14" fill="#ffe9a8" stroke="#1a1a1a" strokeWidth="3" />
        <circle cx="80" cy="85" r="6" fill="#ff8c42" />
      </g>

      <g data-testid="part-shield" className={`robot-part${isEarned('shield') ? ' earned' : ''}`}>
        <circle cx="80" cy="125" r="16" fill="#c9d6e3" stroke="#1a1a1a" strokeWidth="3" />
        <circle cx="80" cy="125" r="9" fill="none" stroke="#1a1a1a" strokeWidth="2" />
      </g>

      <g data-testid="part-blaster" className={`robot-part${isEarned('blaster') ? ' earned' : ''}`}>
        <rect x="4" y="70" width="14" height="34" rx="4" fill="#4a4a4a" stroke="#1a1a1a" strokeWidth="3" />
        <circle cx="11" cy="70" r="6" fill="#ff6b6b" stroke="#1a1a1a" strokeWidth="2" />
      </g>

      <g data-testid="part-claws" className={`robot-part${isEarned('claws') ? ' earned' : ''}`}>
        <path d="M 142 70 L 152 78 L 146 88 L 138 82 Z" fill="#c9d6e3" stroke="#1a1a1a" strokeWidth="3" strokeLinejoin="round" />
        <path d="M 138 92 L 150 96 L 146 106 L 136 100 Z" fill="#c9d6e3" stroke="#1a1a1a" strokeWidth="3" strokeLinejoin="round" />
      </g>

      <g data-testid="part-wings" className={`robot-part${isEarned('wings') ? ' earned' : ''}`}>
        <path d="M 35 60 L 5 50 L 12 78 L 35 80 Z" fill="#ff8c42" stroke="#1a1a1a" strokeWidth="3" strokeLinejoin="round" />
        <path d="M 125 60 L 155 50 L 148 78 L 125 80 Z" fill="#ff8c42" stroke="#1a1a1a" strokeWidth="3" strokeLinejoin="round" />
      </g>

      <g data-testid="part-boosters" className={`robot-part${isEarned('boosters') ? ' earned' : ''}`}>
        <rect x="48" y="152" width="18" height="20" rx="3" fill="#4a4a4a" stroke="#1a1a1a" strokeWidth="3" />
        <rect x="94" y="152" width="18" height="20" rx="3" fill="#4a4a4a" stroke="#1a1a1a" strokeWidth="3" />
        <path d="M 49 172 L 57 172 L 53 180 Z" fill="#ff8c42" />
        <path d="M 95 172 L 103 172 L 99 180 Z" fill="#ff8c42" />
      </g>
    </svg>
  );
}
