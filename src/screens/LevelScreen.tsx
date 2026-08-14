import { useRef, useState } from 'react';
import { LevelDef } from '../domain/levels';
import { solveCircuit } from '../domain/solveCircuit';
import { ComponentType, GridState } from '../domain/types';
import { CircuitGrid } from '../components/CircuitGrid';
import { ComponentTray } from '../components/ComponentTray';
import './LevelScreen.css';

export interface LevelScreenProps {
  level: LevelDef;
  onComplete: () => void;
  onBack: () => void;
}

function isSolved(level: LevelDef, grid: GridState): boolean {
  const live = solveCircuit(grid);
  return Object.entries(level.fixed)
    .filter(([, component]) => component.type === 'led' || component.type === 'bulb')
    .every(([key]) => live.has(key));
}

export function LevelScreen({ level, onComplete, onBack }: LevelScreenProps) {
  const [grid, setGrid] = useState<GridState>(() => ({
    rows: level.rows,
    cols: level.cols,
    edges: { ...level.fixed },
  }));
  const [selected, setSelected] = useState<ComponentType | null>(null);
  const completedRef = useRef(false);

  function handlePlace(key: string, type: ComponentType) {
    setGrid((previous) => {
      const next = { ...previous, edges: { ...previous.edges, [key]: { type } } };
      if (!completedRef.current && isSolved(level, next)) {
        completedRef.current = true;
        onComplete();
      }
      return next;
    });
    setSelected(null);
  }

  function handleToggleSwitch(key: string) {
    setGrid((previous) => {
      const component = previous.edges[key];
      if (!component || component.type !== 'switch') return previous;
      const next = {
        ...previous,
        edges: { ...previous.edges, [key]: { type: 'switch' as const, closed: !component.closed } },
      };
      if (!completedRef.current && isSolved(level, next)) {
        completedRef.current = true;
        onComplete();
      }
      return next;
    });
  }

  return (
    <div className="level-screen">
      <button type="button" className="back-button" onClick={onBack}>
        &larr; Back
      </button>
      <h2>{level.title}</h2>
      <p className="goal">{level.goal}</p>
      <CircuitGrid grid={grid} onPlace={handlePlace} onToggleSwitch={handleToggleSwitch} pendingComponent={selected} />
      <ComponentTray items={level.tray} selected={selected} onSelect={setSelected} />
    </div>
  );
}
