import { ComponentType } from '../domain/types';
import './ComponentTray.css';

export interface ComponentTrayProps {
  items: ComponentType[];
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
};

const GRID_KEY_DRAG_TYPE = 'application/x-grid-key';

export function ComponentTray({ items, selected, onSelect, onRemove }: ComponentTrayProps) {
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
      {items.map((type, index) => (
        <button
          key={index}
          type="button"
          draggable
          className={`tray-item${type === selected ? ' selected' : ''}`}
          onClick={() => onSelect(type)}
          onDragStart={(event) => {
            event.dataTransfer.setData('application/x-component-type', type);
            event.dataTransfer.effectAllowed = 'copy';
          }}
        >
          {LABELS[type]}
        </button>
      ))}
    </div>
  );
}
