import { ComponentType } from '../domain/types';
import './ComponentTray.css';

export interface ComponentTrayProps {
  items: ComponentType[];
  remaining: Partial<Record<ComponentType, number>>;
  selected: ComponentType | null;
  onSelect: (type: ComponentType) => void;
  onRemove?: (key: string) => void;
}

const LABELS: Record<ComponentType, string> = {
  wire: 'Wire',
  switch: 'Switch',
  led: 'LED',
  bulb: 'Bulb',
  battery: 'Battery',
  diode: 'Diode',
  buzzer: 'Buzzer',
  motor: 'Motor',
  inverter: 'Inverter',
};

const GRID_KEY_DRAG_TYPE = 'application/x-grid-key';

export function ComponentTray({ items, remaining, selected, onSelect, onRemove }: ComponentTrayProps) {
  const types = Array.from(new Set(items));

  return (
    <div
      className="component-tray"
      data-testid="component-tray"
      onDragOver={(event) => {
        if (!onRemove) return;
        event.preventDefault();
      }}
      onDrop={(event) => {
        if (!onRemove) return;
        event.preventDefault();
        const key = event.dataTransfer.getData(GRID_KEY_DRAG_TYPE);
        if (key) onRemove(key);
      }}
    >
      {types.map((type) => {
        const count = remaining[type] ?? 0;
        const exhausted = count <= 0;
        return (
          <button
            key={type}
            type="button"
            draggable={!exhausted}
            disabled={exhausted}
            className={`tray-item${type === selected ? ' selected' : ''}`}
            onClick={() => onSelect(type)}
            onDragStart={(event) => {
              event.dataTransfer.setData('application/x-component-type', type);
              event.dataTransfer.effectAllowed = 'copy';
            }}
          >
            {LABELS[type]} ×{count}
          </button>
        );
      })}
    </div>
  );
}
