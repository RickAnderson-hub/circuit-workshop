import { render, screen } from '@testing-library/react';
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
});
