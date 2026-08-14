import { ComponentType, edgeJunctions, edgeKey, GridState } from '../domain/types';
import { solveCircuit } from '../domain/solveCircuit';
import './CircuitGrid.css';

export interface CircuitGridProps {
  grid: GridState;
  onPlace: (key: string, type: ComponentType) => void;
  onToggleSwitch: (key: string) => void;
  pendingComponent: ComponentType | null;
}

const CELL_SIZE = 64;
const PADDING = 24;

export function CircuitGrid({ grid, onPlace, onToggleSwitch, pendingComponent }: CircuitGridProps) {
  const live = solveCircuit(grid);
  const width = (grid.cols - 1) * CELL_SIZE + PADDING * 2;
  const height = (grid.rows - 1) * CELL_SIZE + PADDING * 2;

  const slotKeys: string[] = [];
  for (let row = 0; row < grid.rows; row += 1) {
    for (let col = 0; col < grid.cols; col += 1) {
      if (col < grid.cols - 1) slotKeys.push(edgeKey(row, col, 'h'));
      if (row < grid.rows - 1) slotKeys.push(edgeKey(row, col, 'v'));
    }
  }

  function handleSlotClick(key: string) {
    const component = grid.edges[key];
    if (component) {
      if (component.type === 'switch') onToggleSwitch(key);
      return;
    }
    if (pendingComponent) onPlace(key, pendingComponent);
  }

  return (
    <div className="circuit-grid-wrap">
      <svg className="circuit-grid" width={width} height={height} role="group" aria-label="Circuit grid">
        {slotKeys.map((key) => {
          const [a, b] = edgeJunctions(key);
          const x1 = PADDING + a.col * CELL_SIZE;
          const y1 = PADDING + a.row * CELL_SIZE;
          const x2 = PADDING + b.col * CELL_SIZE;
          const y2 = PADDING + b.row * CELL_SIZE;
          const component = grid.edges[key];
          const classes = ['slot'];
          if (!component) classes.push(pendingComponent ? 'placeable' : 'empty');
          if (component) classes.push('occupied');
          if (component?.type === 'switch') classes.push(component.closed ? 'switch-closed' : 'switch-open');
          if (live.has(key)) classes.push('live');
          return (
            <g key={key}>
              {/* Visible line with styling */}
              <line
                className={classes.join(' ')}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
              />
              {/* Invisible hit-target line for mobile tap reliability (28px wide) */}
              <line
                data-testid={`slot-${key}`}
                className={live.has(key) ? 'live' : ''}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="transparent"
                strokeWidth={28}
                strokeLinecap="round"
                onClick={() => handleSlotClick(key)}
                style={{ cursor: 'pointer' }}
              />
            </g>
          );
        })}
        {Array.from({ length: grid.rows }).map((_, row) =>
          Array.from({ length: grid.cols }).map((_, col) => (
            <circle
              key={`${row},${col}`}
              className="junction"
              cx={PADDING + col * CELL_SIZE}
              cy={PADDING + row * CELL_SIZE}
              r={4}
            />
          )),
        )}
      </svg>
    </div>
  );
}
