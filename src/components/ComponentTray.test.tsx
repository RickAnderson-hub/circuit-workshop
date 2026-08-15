import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ComponentTray } from './ComponentTray';

describe('ComponentTray', () => {
  it('renders one button per tray item and marks the selected one', () => {
    render(<ComponentTray items={['wire', 'switch']} selected="wire" onSelect={vi.fn()} />);
    expect(screen.getByRole('button', { name: /wire/i })).toHaveClass('selected');
    expect(screen.getByRole('button', { name: /switch/i })).not.toHaveClass('selected');
  });

  it('calls onSelect with the tapped item type', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(<ComponentTray items={['wire', 'switch']} selected={null} onSelect={onSelect} />);
    await user.click(screen.getByRole('button', { name: /switch/i }));
    expect(onSelect).toHaveBeenCalledWith('switch');
  });

  it('makes each tray item draggable and puts its type on the dataTransfer', () => {
    render(<ComponentTray items={['wire']} selected={null} onSelect={vi.fn()} />);
    const item = screen.getByRole('button', { name: /wire/i });
    expect(item).toHaveAttribute('draggable', 'true');
    const data: Record<string, string> = {};
    const dataTransfer = {
      setData: (format: string, value: string) => {
        data[format] = value;
      },
      getData: (format: string) => data[format] ?? '',
    };
    fireEvent.dragStart(item, { dataTransfer });
    expect(data['application/x-component-type']).toBe('wire');
  });

  it('calls onRemove with the grid key when a placed component is dropped on it', () => {
    const onRemove = vi.fn();
    render(<ComponentTray items={['wire']} selected={null} onSelect={vi.fn()} onRemove={onRemove} />);
    const tray = screen.getByTestId('component-tray');
    const dataTransfer = {
      data: { 'application/x-grid-key': '0,0,h' } as Record<string, string>,
      getData(format: string) {
        return this.data[format] ?? '';
      },
    };
    fireEvent.dragOver(tray, { dataTransfer });
    fireEvent.drop(tray, { dataTransfer });
    expect(onRemove).toHaveBeenCalledWith('0,0,h');
  });
});
