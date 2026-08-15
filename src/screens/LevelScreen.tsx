import { useEffect, useMemo, useRef, useState } from 'react';
import { LevelDef } from '../domain/levels';
import { isSolved } from '../domain/solveCircuit';
import { ComponentType, GridState } from '../domain/types';
import { CircuitGrid } from '../components/CircuitGrid';
import { ComponentTray } from '../components/ComponentTray';
import './LevelScreen.css';

export interface LevelScreenProps {
  level: LevelDef;
  onComplete: () => void;
  onBack: () => void;
}

export function LevelScreen({ level, onComplete, onBack }: LevelScreenProps) {
  const [grid, setGrid] = useState<GridState>(() => ({
    rows: level.rows,
    cols: level.cols,
    edges: { ...level.fixed },
  }));
  const [selected, setSelected] = useState<ComponentType | null>(null);
  const completedRef = useRef(false);
  const fixedKeys = useMemo(() => new Set(Object.keys(level.fixed)), [level]);

  const totalCounts = useMemo(() => {
    const counts: Partial<Record<ComponentType, number>> = {};
    for (const type of level.tray) counts[type] = (counts[type] ?? 0) + 1;
    return counts;
  }, [level]);

  const remaining = useMemo(() => {
    const placedCounts: Partial<Record<ComponentType, number>> = {};
    for (const [key, component] of Object.entries(grid.edges)) {
      if (fixedKeys.has(key)) continue;
      placedCounts[component.type] = (placedCounts[component.type] ?? 0) + 1;
    }
    const result: Partial<Record<ComponentType, number>> = {};
    for (const type of Object.keys(totalCounts) as ComponentType[]) {
      result[type] = (totalCounts[type] ?? 0) - (placedCounts[type] ?? 0);
    }
    return result;
  }, [grid, fixedKeys, totalCounts]);

  useEffect(() => {
    if (!completedRef.current && isSolved(grid)) {
      completedRef.current = true;
      onComplete();
    }
  }, [grid, level, onComplete]);

  function handlePlace(key: string, type: ComponentType) {
    if ((remaining[type] ?? 0) <= 0) return;
    setGrid((previous) => ({ ...previous, edges: { ...previous.edges, [key]: { type } } }));
    setSelected(null);
  }

  function handleRemove(key: string) {
    if (fixedKeys.has(key)) return;
    setGrid((previous) => {
      const edges = { ...previous.edges };
      delete edges[key];
      return { ...previous, edges };
    });
  }

  function handleToggleSwitch(key: string) {
    setGrid((previous) => {
      const component = previous.edges[key];
      if (!component || component.type !== 'switch') return previous;
      return {
        ...previous,
        edges: { ...previous.edges, [key]: { type: 'switch' as const, closed: !component.closed } },
      };
    });
  }

  return (
    <div className="level-screen">
      <button type="button" className="back-button" onClick={onBack}>
        &larr; Back
      </button>
      <h2>{level.title}</h2>
      <p className="goal">{level.goal}</p>
      <CircuitGrid
        grid={grid}
        onPlace={handlePlace}
        onToggleSwitch={handleToggleSwitch}
        onRemove={handleRemove}
        fixedKeys={fixedKeys}
        pendingComponent={selected}
      />
      <ComponentTray
        items={level.tray}
        remaining={remaining}
        selected={selected}
        onSelect={setSelected}
        onRemove={handleRemove}
      />
    </div>
  );
}
