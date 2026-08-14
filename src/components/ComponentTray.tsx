import { ComponentType } from '../domain/types';
import './ComponentTray.css';

export interface ComponentTrayProps {
  items: ComponentType[];
  selected: ComponentType | null;
  onSelect: (type: ComponentType) => void;
}

const LABELS: Record<ComponentType, string> = {
  wire: 'Wire',
  switch: 'Switch',
  led: 'LED',
  bulb: 'Bulb',
  battery: 'Battery',
};

export function ComponentTray({ items, selected, onSelect }: ComponentTrayProps) {
  return (
    <div className="component-tray">
      {items.map((type, index) => (
        <button
          key={`${type}-${index}`}
          type="button"
          className={`tray-item${type === selected ? ' selected' : ''}`}
          onClick={() => onSelect(type)}
        >
          {LABELS[type]}
        </button>
      ))}
    </div>
  );
}
