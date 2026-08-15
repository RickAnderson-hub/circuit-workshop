import { useRef, useState } from 'react';
import { ComponentType, edgeJunctions, edgeKey, GridState } from '../domain/types';
import { solveCircuit } from '../domain/solveCircuit';
import './CircuitGrid.css';

export interface CircuitGridProps {
  grid: GridState;
  onPlace: (key: string, type: ComponentType) => void;
  onToggleSwitch: (key: string) => void;
  onToggleDiode: (key: string) => void;
  onToggleInverter: (key: string) => void;
  onRemove: (key: string) => void;
  fixedKeys: Set<string>;
  pendingComponent: ComponentType | null;
}

const CELL_SIZE = 64;
const PADDING = 24;
const DRAG_TYPE = 'application/x-component-type';
const GRID_KEY_DRAG_TYPE = 'application/x-grid-key';
const LONG_PRESS_MS = 500;

function BatteryIcon({ testId }: { testId: string }) {
  return (
    <g data-testid={testId} className="component-icon battery-icon">
      <rect x={-15} y={-9} width={22} height={18} rx={3} fill="#4a4a4a" stroke="#1a1a1a" strokeWidth={2.5} />
      <rect x={7} y={-5} width={6} height={10} rx={1.5} fill="#4a4a4a" stroke="#1a1a1a" strokeWidth={2.5} />
      <g stroke="#ffe9a8" strokeWidth={2} strokeLinecap="round">
        <line x1={-8} y1={-4} x2={-8} y2={4} />
        <line x1={-12} y1={0} x2={-4} y2={0} />
        <line x1={1} y1={0} x2={7} y2={0} />
      </g>
    </g>
  );
}

function BulbIcon({ testId, live }: { testId: string; live: boolean }) {
  return (
    <g data-testid={testId} className={`component-icon bulb-icon${live ? ' live' : ''}`}>
      <circle cx={0} cy={-3} r={15} fill={live ? '#ffcc33' : '#f4e3c1'} stroke="#1a1a1a" strokeWidth={3} />
      <path
        d="M -6 1 C -4 -7, -1 7, 0 -1 C 1 -7, 4 7, 6 1"
        fill="none"
        stroke="#1a1a1a"
        strokeWidth={1.6}
        strokeLinecap="round"
      />
      <rect x={-6} y={11} width={12} height={7} rx={1.5} fill="#c9b184" stroke="#1a1a1a" strokeWidth={2} />
      <line x1={-5} y1={14} x2={5} y2={14} stroke="#1a1a1a" strokeWidth={1} />
      <line x1={-5} y1={16.5} x2={5} y2={16.5} stroke="#1a1a1a" strokeWidth={1} />
    </g>
  );
}

function LedIcon({ testId, live }: { testId: string; live: boolean }) {
  return (
    <g data-testid={testId} className={`component-icon led-icon${live ? ' live' : ''}`}>
      <path
        d="M -9 8 L -9 -4 A 9 9 0 0 1 9 -4 L 9 8 Z"
        fill={live ? '#ff6b6b' : '#f4e3c1'}
        stroke="#1a1a1a"
        strokeWidth={3}
      />
      <line x1={-9} y1={8} x2={9} y2={8} stroke="#1a1a1a" strokeWidth={3} />
      {live && (
        <g stroke="#ff6b6b" strokeWidth={2} strokeLinecap="round">
          <line x1={12} y1={-10} x2={18} y2={-16} />
          <line x1={16} y1={-10} x2={16} y2={-17} />
          <line x1={18} y1={-6} x2={24} y2={-9} />
        </g>
      )}
    </g>
  );
}

function SwitchIcon({
  testId,
  x1,
  y1,
  x2,
  y2,
  closed,
}: {
  testId: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  closed: boolean;
}) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.hypot(dx, dy) || 1;
  const ux = dx / len;
  const uy = dy / len;
  const px = -uy;
  const py = ux;
  const pivotX = x1 + ux * 10;
  const pivotY = y1 + uy * 10;
  const contactX = x1 + ux * (len - 10);
  const contactY = y1 + uy * (len - 10);
  const tipX = closed ? contactX : pivotX + ux * (len - 20) * 0.5 + px * 14;
  const tipY = closed ? contactY : pivotY + uy * (len - 20) * 0.5 + py * 14;
  const color = closed ? '#27ae60' : '#c0392b';
  return (
    <g data-testid={testId} className={`component-icon switch-icon${closed ? ' closed' : ' open'}`}>
      <line x1={pivotX} y1={pivotY} x2={tipX} y2={tipY} stroke={color} strokeWidth={4} strokeLinecap="round" />
      <circle cx={pivotX} cy={pivotY} r={4} fill="#1a1a1a" />
      <circle cx={contactX} cy={contactY} r={4} fill="#1a1a1a" />
    </g>
  );
}

function DiodeIcon({ testId, forward }: { testId: string; forward: boolean }) {
  return (
    <g data-testid={testId} className="component-icon diode-icon" transform={forward ? undefined : 'rotate(180)'}>
      <path d="M -8 -8 L -8 8 L 8 0 Z" fill="#c9d6e3" stroke="#1a1a1a" strokeWidth={2.5} strokeLinejoin="round" />
      <line x1={8} y1={-9} x2={8} y2={9} stroke="#1a1a1a" strokeWidth={2.5} />
    </g>
  );
}

function BuzzerIcon({ testId, live }: { testId: string; live: boolean }) {
  return (
    <g data-testid={testId} className={`component-icon buzzer-icon${live ? ' live' : ''}`}>
      <path
        d="M -10 -6 L -3 -6 L 6 -13 L 6 13 L -3 6 L -10 6 Z"
        fill={live ? '#ffcc33' : '#f4e3c1'}
        stroke="#1a1a1a"
        strokeWidth={2.5}
        strokeLinejoin="round"
      />
      {live && (
        <g stroke="#ffcc33" strokeWidth={2} strokeLinecap="round" fill="none">
          <path d="M 11 -6 Q 15 0 11 6" />
          <path d="M 15 -10 Q 21 0 15 10" />
        </g>
      )}
    </g>
  );
}

function InverterIcon({
  testId,
  x1,
  y1,
  x2,
  y2,
  closed,
}: {
  testId: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  closed: boolean;
}) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.hypot(dx, dy) || 1;
  const ux = dx / len;
  const uy = dy / len;
  const px = -uy;
  const py = ux;
  const pivotX = x1 + ux * 10;
  const pivotY = y1 + uy * 10;
  const contactX = x1 + ux * (len - 10);
  const contactY = y1 + uy * (len - 10);
  // Inverted from SwitchIcon: it rests against the contact (conducting) by
  // default, and swings away (blocking) once closed — the opposite of a
  // switch, and colored the opposite way too (green=open, red=closed) as a
  // visual cue that it behaves backwards.
  const tipX = !closed ? contactX : pivotX + ux * (len - 20) * 0.5 + px * 14;
  const tipY = !closed ? contactY : pivotY + uy * (len - 20) * 0.5 + py * 14;
  const color = !closed ? '#27ae60' : '#c0392b';
  const midX = (x1 + x2) / 2;
  const midY = (y1 + y2) / 2;
  return (
    <g data-testid={testId} className={`component-icon inverter-icon${closed ? ' closed' : ' open'}`}>
      <line x1={pivotX} y1={pivotY} x2={tipX} y2={tipY} stroke={color} strokeWidth={4} strokeLinecap="round" />
      <circle cx={pivotX} cy={pivotY} r={4} fill="#1a1a1a" />
      <circle cx={contactX} cy={contactY} r={4} fill="#1a1a1a" />
      <circle cx={midX} cy={midY} r={6} fill="none" stroke="#1a1a1a" strokeWidth={2} />
    </g>
  );
}

function MotorIcon({ testId, live }: { testId: string; live: boolean }) {
  return (
    <g data-testid={testId} className={`component-icon motor-icon${live ? ' live' : ''}`}>
      <circle cx={0} cy={0} r={12} fill={live ? '#8fbf8f' : '#f4e3c1'} stroke="#1a1a1a" strokeWidth={2.5} />
      <g className="motor-blades" stroke="#1a1a1a" strokeWidth={2} strokeLinecap="round">
        <line x1={0} y1={-8} x2={0} y2={8} />
        <line x1={-8} y1={0} x2={8} y2={0} />
      </g>
    </g>
  );
}

export function CircuitGrid({
  grid,
  onPlace,
  onToggleSwitch,
  onToggleDiode,
  onToggleInverter,
  onRemove,
  fixedKeys,
  pendingComponent,
}: CircuitGridProps) {
  const live = solveCircuit(grid);
  const width = (grid.cols - 1) * CELL_SIZE + PADDING * 2;
  const height = (grid.rows - 1) * CELL_SIZE + PADDING * 2;
  const [dragOverKey, setDragOverKey] = useState<string | null>(null);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const longPressFired = useRef(false);

  const slotKeys: string[] = [];
  for (let row = 0; row < grid.rows; row += 1) {
    for (let col = 0; col < grid.cols; col += 1) {
      if (col < grid.cols - 1) slotKeys.push(edgeKey(row, col, 'h'));
      if (row < grid.rows - 1) slotKeys.push(edgeKey(row, col, 'v'));
    }
  }

  function handleSlotClick(key: string) {
    if (longPressFired.current) {
      longPressFired.current = false;
      return;
    }
    const component = grid.edges[key];
    if (component) {
      if (fixedKeys.has(key)) return;
      if (component.type === 'switch') onToggleSwitch(key);
      else if (component.type === 'diode') onToggleDiode(key);
      else if (component.type === 'inverter') onToggleInverter(key);
      else onRemove(key);
      return;
    }
    if (pendingComponent) onPlace(key, pendingComponent);
  }

  function clearLongPressTimer() {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  }

  function handleTogglePointerDown(key: string) {
    const component = grid.edges[key];
    const isToggleable =
      component?.type === 'switch' || component?.type === 'diode' || component?.type === 'inverter';
    if (!isToggleable || fixedKeys.has(key)) return;
    longPressFired.current = false;
    longPressTimer.current = setTimeout(() => {
      longPressFired.current = true;
      onRemove(key);
    }, LONG_PRESS_MS);
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
          const midX = (x1 + x2) / 2;
          const midY = (y1 + y2) / 2;
          const orientation = key.endsWith(',h') ? 'h' : 'v';
          const component = grid.edges[key];
          const isLive = live.has(key);
          const classes = ['slot'];
          if (!component && pendingComponent) classes.push('placeable');
          if (component) classes.push('occupied');
          if (component?.type === 'switch') classes.push(component.closed ? 'switch-closed' : 'switch-open');
          if (component?.type === 'inverter') classes.push(component.closed ? 'inverter-closed' : 'inverter-open');
          if (isLive) classes.push('live');
          if (dragOverKey === key && !component) classes.push('drag-over');

          function handleDragOver(event: React.DragEvent<SVGLineElement>) {
            if (component) return;
            event.preventDefault();
            setDragOverKey(key);
          }

          function handleDragLeave() {
            setDragOverKey((current) => (current === key ? null : current));
          }

          function handleDrop(event: React.DragEvent<SVGLineElement>) {
            event.preventDefault();
            setDragOverKey(null);
            if (component) return;
            const type = event.dataTransfer.getData(DRAG_TYPE) as ComponentType;
            if (type) onPlace(key, type);
          }

          const removable = !!component && !fixedKeys.has(key);

          function handleDragStart(event: React.DragEvent<SVGLineElement>) {
            if (!removable) {
              event.preventDefault();
              return;
            }
            event.dataTransfer.setData(GRID_KEY_DRAG_TYPE, key);
            event.dataTransfer.effectAllowed = 'move';
          }

          return (
            <g key={key}>
              {/* Visible line with styling */}
              <line data-testid={`slot-${key}`} className={classes.join(' ')} x1={x1} y1={y1} x2={x2} y2={y2} />
              {/* Invisible hit-target line for mobile tap reliability (28px wide) and drag/drop target */}
              <line
                data-testid={`hit-${key}`}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="transparent"
                strokeWidth={28}
                strokeLinecap="round"
                onClick={() => handleSlotClick(key)}
                onPointerDown={() => handleTogglePointerDown(key)}
                onPointerUp={clearLongPressTimer}
                onPointerLeave={clearLongPressTimer}
                onPointerCancel={clearLongPressTimer}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                style={{ cursor: 'pointer' }}
                {...{ draggable: removable }}
              />
              {component?.type === 'battery' && (
                <g transform={`translate(${midX} ${midY}) rotate(${orientation === 'v' ? 90 : 0})`}>
                  <BatteryIcon testId={`icon-battery-${key}`} />
                </g>
              )}
              {component?.type === 'bulb' && (
                <g transform={`translate(${midX} ${midY})`}>
                  <BulbIcon testId={`icon-bulb-${key}`} live={isLive} />
                </g>
              )}
              {component?.type === 'led' && (
                <g transform={`translate(${midX} ${midY})`}>
                  <LedIcon testId={`icon-led-${key}`} live={isLive} />
                </g>
              )}
              {component?.type === 'switch' && (
                <SwitchIcon testId={`icon-switch-${key}`} x1={x1} y1={y1} x2={x2} y2={y2} closed={!!component.closed} />
              )}
              {component?.type === 'diode' && (
                <g transform={`translate(${midX} ${midY}) rotate(${orientation === 'v' ? 90 : 0})`}>
                  <DiodeIcon testId={`icon-diode-${key}`} forward={component.forward !== false} />
                </g>
              )}
              {component?.type === 'buzzer' && (
                <g transform={`translate(${midX} ${midY})`}>
                  <BuzzerIcon testId={`icon-buzzer-${key}`} live={isLive} />
                </g>
              )}
              {component?.type === 'motor' && (
                <g transform={`translate(${midX} ${midY})`}>
                  <MotorIcon testId={`icon-motor-${key}`} live={isLive} />
                </g>
              )}
              {component?.type === 'inverter' && (
                <InverterIcon
                  testId={`icon-inverter-${key}`}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  closed={!!component.closed}
                />
              )}
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
