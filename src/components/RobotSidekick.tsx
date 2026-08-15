import { RobotPart } from '../domain/levels';
import './RobotSidekick.css';

export interface RobotSidekickProps {
  earnedParts: RobotPart[];
  celebrating: boolean;
}

export function RobotSidekick({ earnedParts, celebrating }: RobotSidekickProps) {
  const isEarned = (part: RobotPart) => earnedParts.includes(part);

  return (
    <svg
      data-testid="robot-sidekick"
      className={`robot-sidekick${celebrating ? ' celebrating' : ''}`}
      width={160}
      height={180}
      viewBox="0 0 160 180"
      role="img"
      aria-label="Robot sidekick"
    >
      <rect x="30" y="60" width="100" height="90" rx="18" fill="#c9d6e3" stroke="#1a1a1a" strokeWidth="4" />
      <rect x="45" y="10" width="70" height="55" rx="16" fill="#e3ecf5" stroke="#1a1a1a" strokeWidth="4" />

      <g data-testid="part-antenna" className={`robot-part${isEarned('antenna') ? ' earned' : ''}`}>
        <line x1="80" y1="10" x2="80" y2="-10" stroke="#1a1a1a" strokeWidth="4" />
        <circle cx="80" cy="-14" r="6" fill="#ffcc33" stroke="#1a1a1a" strokeWidth="3" />
      </g>

      <g data-testid="part-eyes" className={`robot-part${isEarned('eyes') ? ' earned' : ''}`}>
        <circle cx="65" cy="35" r="7" fill="#27ae60" />
        <circle cx="95" cy="35" r="7" fill="#27ae60" />
      </g>

      <g data-testid="part-nose" className={`robot-part${isEarned('nose') ? ' earned' : ''}`}>
        <circle cx="80" cy="48" r="5" fill="#ff6b6b" />
      </g>

      <g data-testid="part-arms" className={`robot-part${isEarned('arms') ? ' earned' : ''}`}>
        <rect x="8" y="75" width="20" height="12" rx="6" fill="#c9d6e3" stroke="#1a1a1a" strokeWidth="3" />
        <rect x="132" y="75" width="20" height="12" rx="6" fill="#c9d6e3" stroke="#1a1a1a" strokeWidth="3" />
      </g>

      <g data-testid="part-propeller" className={`robot-part${isEarned('propeller') ? ' earned' : ''}`}>
        <line x1="50" y1="14" x2="110" y2="14" stroke="#1a1a1a" strokeWidth="4" />
      </g>

      <g data-testid="part-legs" className={`robot-part${isEarned('legs') ? ' earned' : ''}`}>
        <rect x="55" y="150" width="15" height="22" rx="4" fill="#7a5a34" stroke="#1a1a1a" strokeWidth="3" />
        <rect x="90" y="150" width="15" height="22" rx="4" fill="#7a5a34" stroke="#1a1a1a" strokeWidth="3" />
      </g>

      <g data-testid="part-jetpack" className={`robot-part${isEarned('jetpack') ? ' earned' : ''}`}>
        <rect x="8" y="95" width="14" height="40" rx="4" fill="#c9d6e3" stroke="#1a1a1a" strokeWidth="3" />
        <rect x="138" y="95" width="14" height="40" rx="4" fill="#c9d6e3" stroke="#1a1a1a" strokeWidth="3" />
        <path d="M 9 135 L 15 150 L 21 135 L 15 143 Z" fill="#ff6b6b" />
        <path d="M 139 135 L 145 150 L 151 135 L 145 143 Z" fill="#ff6b6b" />
      </g>
    </svg>
  );
}
