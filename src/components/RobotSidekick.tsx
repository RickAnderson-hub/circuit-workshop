import { RobotMk2Part, RobotPart } from '../domain/levels';
import './RobotSidekick.css';

export interface RobotSidekickProps {
  // Accepts the wider union since callers pass every earned part regardless
  // of stage — this component only looks for the ones it recognizes.
  earnedParts: (RobotPart | RobotMk2Part)[];
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
      <path
        d="M 122.2 78.4 L 116.0 72.6 L 81.2 76.4 L 62.2 76.2 L 48.7 73.6 L 35.6 75.1 L 34.1 88.2 L 40.4 138.2 L 40.6 136.6 L 43.9 136.7 L 44.8 145.8 L 55.7 149.9 L 102.3 149.9 L 115.2 147.0 L 119.4 135.6 L 125.2 99.3 L 125.9 87.2 Z"
        fill="#c9d6e3"
        stroke="#1a1a1a"
        strokeWidth="4"
        strokeLinejoin="round"
      />
      <path
        d="M 112.9 17.7 L 110.0 17.7 L 109.9 14.3 L 107.5 12.3 L 100.2 10.3 L 59.6 11.0 L 44.7 13.3 L 42.2 21.2 L 41.6 44.3 L 42.5 58.9 L 44.8 66.1 L 49.1 70.0 L 52.1 70.0 L 52.6 71.8 L 62.4 73.0 L 90.1 72.7 L 114.0 69.7 L 116.5 55.5 L 116.8 25.0 Z"
        fill="#e3ecf5"
        stroke="#1a1a1a"
        strokeWidth="4"
        strokeLinejoin="round"
      />

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

      <g data-testid="part-visor" className={`robot-part${isEarned('visor') ? ' earned' : ''}`}>
        <rect x="44" y="18" width="70" height="14" rx="7" fill="#8fd8ff" stroke="#1a1a1a" strokeWidth="3" opacity="0.85" />
      </g>
    </svg>
  );
}
