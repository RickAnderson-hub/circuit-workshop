import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { createEmptyGrid, edgeKey } from '../domain/types';
import { CircuitGrid } from './CircuitGrid';

describe('CircuitGrid', () => {
  it('calls onPlace with the tapped empty slot when a component is pending', async () => {
    const user = userEvent.setup();
    const onPlace = vi.fn();
    render(
      <CircuitGrid
        grid={createEmptyGrid(2, 2)}
        onPlace={onPlace}
        onToggleSwitch={vi.fn()}
        pendingComponent="wire"
      />,
    );
    await user.click(screen.getByTestId(`slot-${edgeKey(0, 0, 'h')}`));
    expect(onPlace).toHaveBeenCalledWith(edgeKey(0, 0, 'h'), 'wire');
  });

  it('does not call onPlace on an occupied slot', async () => {
    const user = userEvent.setup();
    const onPlace = vi.fn();
    const grid = createEmptyGrid(2, 2);
    grid.edges[edgeKey(0, 0, 'h')] = { type: 'battery' };
    render(
      <CircuitGrid grid={grid} onPlace={onPlace} onToggleSwitch={vi.fn()} pendingComponent="wire" />,
    );
    await user.click(screen.getByTestId(`slot-${edgeKey(0, 0, 'h')}`));
    expect(onPlace).not.toHaveBeenCalled();
  });

  it('toggles a placed switch on tap', async () => {
    const user = userEvent.setup();
    const onToggleSwitch = vi.fn();
    const grid = createEmptyGrid(2, 2);
    grid.edges[edgeKey(0, 0, 'h')] = { type: 'switch', closed: false };
    render(
      <CircuitGrid grid={grid} onPlace={vi.fn()} onToggleSwitch={onToggleSwitch} pendingComponent={null} />,
    );
    await user.click(screen.getByTestId(`slot-${edgeKey(0, 0, 'h')}`));
    expect(onToggleSwitch).toHaveBeenCalledWith(edgeKey(0, 0, 'h'));
  });

  it('marks live components with the live class', () => {
    const grid = createEmptyGrid(2, 2);
    grid.edges[edgeKey(0, 0, 'h')] = { type: 'battery' };
    grid.edges[edgeKey(0, 0, 'v')] = { type: 'wire' };
    grid.edges[edgeKey(0, 1, 'v')] = { type: 'wire' };
    grid.edges[edgeKey(1, 0, 'h')] = { type: 'wire' };
    render(<CircuitGrid grid={grid} onPlace={vi.fn()} onToggleSwitch={vi.fn()} pendingComponent={null} />);
    expect(screen.getByTestId(`slot-${edgeKey(0, 0, 'v')}`)).toHaveClass('live');
  });
});
