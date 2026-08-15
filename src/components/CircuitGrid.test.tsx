import { fireEvent, render, screen } from '@testing-library/react';
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
        onToggleDiode={vi.fn()}
        onToggleInverter={vi.fn()}
        onRemove={vi.fn()}
        fixedKeys={new Set()}
        pendingComponent="wire"
      />,
    );
    await user.click(screen.getByTestId(`hit-${edgeKey(0, 0, 'h')}`));
    expect(onPlace).toHaveBeenCalledWith(edgeKey(0, 0, 'h'), 'wire');
  });

  it('does not call onPlace on an occupied slot', async () => {
    const user = userEvent.setup();
    const onPlace = vi.fn();
    const grid = createEmptyGrid(2, 2);
    grid.edges[edgeKey(0, 0, 'h')] = { type: 'battery' };
    render(
      <CircuitGrid
        grid={grid}
        onPlace={onPlace}
        onToggleSwitch={vi.fn()}
        onToggleDiode={vi.fn()}
        onToggleInverter={vi.fn()}
        onRemove={vi.fn()}
        fixedKeys={new Set([edgeKey(0, 0, 'h')])}
        pendingComponent="wire"
      />,
    );
    await user.click(screen.getByTestId(`hit-${edgeKey(0, 0, 'h')}`));
    expect(onPlace).not.toHaveBeenCalled();
  });

  it('toggles a placed switch on tap', async () => {
    const user = userEvent.setup();
    const onToggleSwitch = vi.fn();
    const grid = createEmptyGrid(2, 2);
    grid.edges[edgeKey(0, 0, 'h')] = { type: 'switch', closed: false };
    render(
      <CircuitGrid
        grid={grid}
        onPlace={vi.fn()}
        onToggleSwitch={onToggleSwitch}
        onToggleDiode={vi.fn()}
        onToggleInverter={vi.fn()}
        onRemove={vi.fn()}
        fixedKeys={new Set()}
        pendingComponent={null}
      />,
    );
    await user.click(screen.getByTestId(`hit-${edgeKey(0, 0, 'h')}`));
    expect(onToggleSwitch).toHaveBeenCalledWith(edgeKey(0, 0, 'h'));
  });

  it('marks live components with the live class', () => {
    const grid = createEmptyGrid(2, 2);
    grid.edges[edgeKey(0, 0, 'h')] = { type: 'battery' };
    grid.edges[edgeKey(0, 0, 'v')] = { type: 'wire' };
    grid.edges[edgeKey(0, 1, 'v')] = { type: 'wire' };
    grid.edges[edgeKey(1, 0, 'h')] = { type: 'wire' };
    render(
      <CircuitGrid
        grid={grid}
        onPlace={vi.fn()}
        onToggleSwitch={vi.fn()}
        onToggleDiode={vi.fn()}
        onToggleInverter={vi.fn()}
        onRemove={vi.fn()}
        fixedKeys={new Set([edgeKey(0, 0, 'h')])}
        pendingComponent={null}
      />,
    );
    expect(screen.getByTestId(`slot-${edgeKey(0, 0, 'v')}`)).toHaveClass('live');
  });

  it('renders a distinct icon for battery, bulb, led, and switch but not wire', () => {
    const grid = createEmptyGrid(2, 2);
    grid.edges[edgeKey(0, 0, 'h')] = { type: 'battery' };
    grid.edges[edgeKey(0, 1, 'v')] = { type: 'bulb' };
    grid.edges[edgeKey(0, 0, 'v')] = { type: 'led' };
    grid.edges[edgeKey(1, 0, 'h')] = { type: 'switch', closed: false };
    render(
      <CircuitGrid
        grid={grid}
        onPlace={vi.fn()}
        onToggleSwitch={vi.fn()}
        onToggleDiode={vi.fn()}
        onToggleInverter={vi.fn()}
        onRemove={vi.fn()}
        fixedKeys={new Set([edgeKey(0, 0, 'h'), edgeKey(0, 1, 'v')])}
        pendingComponent={null}
      />,
    );
    expect(screen.getByTestId(`icon-battery-${edgeKey(0, 0, 'h')}`)).toBeInTheDocument();
    expect(screen.getByTestId(`icon-bulb-${edgeKey(0, 1, 'v')}`)).toBeInTheDocument();
    expect(screen.getByTestId(`icon-led-${edgeKey(0, 0, 'v')}`)).toBeInTheDocument();
    expect(screen.getByTestId(`icon-switch-${edgeKey(1, 0, 'h')}`)).toBeInTheDocument();
  });

  it('drops a dragged component onto an empty slot', () => {
    const grid = createEmptyGrid(2, 2);
    const onPlace = vi.fn();
    render(
      <CircuitGrid
        grid={grid}
        onPlace={onPlace}
        onToggleSwitch={vi.fn()}
        onToggleDiode={vi.fn()}
        onToggleInverter={vi.fn()}
        onRemove={vi.fn()}
        fixedKeys={new Set()}
        pendingComponent={null}
      />,
    );
    const slot = screen.getByTestId(`hit-${edgeKey(0, 0, 'h')}`);
    const dataTransfer = {
      data: { 'application/x-component-type': 'wire' } as Record<string, string>,
      setData() {},
      getData(format: string) {
        return this.data[format] ?? '';
      },
    };
    fireEvent.dragOver(slot, { dataTransfer });
    fireEvent.drop(slot, { dataTransfer });
    expect(onPlace).toHaveBeenCalledWith(edgeKey(0, 0, 'h'), 'wire');
  });

  it('does not drop a dragged component onto an occupied slot', () => {
    const grid = createEmptyGrid(2, 2);
    grid.edges[edgeKey(0, 0, 'h')] = { type: 'battery' };
    const onPlace = vi.fn();
    render(
      <CircuitGrid
        grid={grid}
        onPlace={onPlace}
        onToggleSwitch={vi.fn()}
        onToggleDiode={vi.fn()}
        onToggleInverter={vi.fn()}
        onRemove={vi.fn()}
        fixedKeys={new Set([edgeKey(0, 0, 'h')])}
        pendingComponent={null}
      />,
    );
    const slot = screen.getByTestId(`hit-${edgeKey(0, 0, 'h')}`);
    const dataTransfer = {
      data: { 'application/x-component-type': 'wire' } as Record<string, string>,
      setData() {},
      getData(format: string) {
        return this.data[format] ?? '';
      },
    };
    fireEvent.drop(slot, { dataTransfer });
    expect(onPlace).not.toHaveBeenCalled();
  });

  it('removes a placed wire on tap', async () => {
    const user = userEvent.setup();
    const onRemove = vi.fn();
    const grid = createEmptyGrid(2, 2);
    grid.edges[edgeKey(0, 0, 'h')] = { type: 'wire' };
    render(
      <CircuitGrid
        grid={grid}
        onPlace={vi.fn()}
        onToggleSwitch={vi.fn()}
        onToggleDiode={vi.fn()}
        onToggleInverter={vi.fn()}
        onRemove={onRemove}
        fixedKeys={new Set()}
        pendingComponent={null}
      />,
    );
    await user.click(screen.getByTestId(`hit-${edgeKey(0, 0, 'h')}`));
    expect(onRemove).toHaveBeenCalledWith(edgeKey(0, 0, 'h'));
  });

  it('does not remove a fixed component on tap', async () => {
    const user = userEvent.setup();
    const onRemove = vi.fn();
    const grid = createEmptyGrid(2, 2);
    grid.edges[edgeKey(0, 0, 'h')] = { type: 'battery' };
    render(
      <CircuitGrid
        grid={grid}
        onPlace={vi.fn()}
        onToggleSwitch={vi.fn()}
        onToggleDiode={vi.fn()}
        onToggleInverter={vi.fn()}
        onRemove={onRemove}
        fixedKeys={new Set([edgeKey(0, 0, 'h')])}
        pendingComponent={null}
      />,
    );
    await user.click(screen.getByTestId(`hit-${edgeKey(0, 0, 'h')}`));
    expect(onRemove).not.toHaveBeenCalled();
  });

  it('makes a placed non-fixed component draggable back out with its grid key', () => {
    const grid = createEmptyGrid(2, 2);
    grid.edges[edgeKey(0, 0, 'h')] = { type: 'switch', closed: false };
    render(
      <CircuitGrid
        grid={grid}
        onPlace={vi.fn()}
        onToggleSwitch={vi.fn()}
        onToggleDiode={vi.fn()}
        onToggleInverter={vi.fn()}
        onRemove={vi.fn()}
        fixedKeys={new Set()}
        pendingComponent={null}
      />,
    );
    const slot = screen.getByTestId(`hit-${edgeKey(0, 0, 'h')}`);
    expect(slot).toHaveAttribute('draggable', 'true');
    const data: Record<string, string> = {};
    const dataTransfer = {
      setData: (format: string, value: string) => {
        data[format] = value;
      },
      getData: (format: string) => data[format] ?? '',
    };
    fireEvent.dragStart(slot, { dataTransfer });
    expect(data['application/x-grid-key']).toBe(edgeKey(0, 0, 'h'));
  });

  it('does not make a fixed component draggable', () => {
    const grid = createEmptyGrid(2, 2);
    grid.edges[edgeKey(0, 0, 'h')] = { type: 'battery' };
    render(
      <CircuitGrid
        grid={grid}
        onPlace={vi.fn()}
        onToggleSwitch={vi.fn()}
        onToggleDiode={vi.fn()}
        onToggleInverter={vi.fn()}
        onRemove={vi.fn()}
        fixedKeys={new Set([edgeKey(0, 0, 'h')])}
        pendingComponent={null}
      />,
    );
    expect(screen.getByTestId(`hit-${edgeKey(0, 0, 'h')}`)).toHaveAttribute('draggable', 'false');
  });

  it('removes a placed switch on a long press, without toggling it', () => {
    vi.useFakeTimers();
    const onToggleSwitch = vi.fn();
    const onRemove = vi.fn();
    const grid = createEmptyGrid(2, 2);
    grid.edges[edgeKey(0, 0, 'h')] = { type: 'switch', closed: false };
    render(
      <CircuitGrid
        grid={grid}
        onPlace={vi.fn()}
        onToggleSwitch={onToggleSwitch}
        onToggleDiode={vi.fn()}
        onToggleInverter={vi.fn()}
        onRemove={onRemove}
        fixedKeys={new Set()}
        pendingComponent={null}
      />,
    );
    const hit = screen.getByTestId(`hit-${edgeKey(0, 0, 'h')}`);
    fireEvent.pointerDown(hit);
    vi.advanceTimersByTime(600);
    fireEvent.pointerUp(hit);

    expect(onRemove).toHaveBeenCalledWith(edgeKey(0, 0, 'h'));
    expect(onToggleSwitch).not.toHaveBeenCalled();
    vi.useRealTimers();
  });

  it('does not remove a switch on a short press (still toggles)', () => {
    vi.useFakeTimers();
    const onToggleSwitch = vi.fn();
    const onRemove = vi.fn();
    const grid = createEmptyGrid(2, 2);
    grid.edges[edgeKey(0, 0, 'h')] = { type: 'switch', closed: false };
    render(
      <CircuitGrid
        grid={grid}
        onPlace={vi.fn()}
        onToggleSwitch={onToggleSwitch}
        onToggleDiode={vi.fn()}
        onToggleInverter={vi.fn()}
        onRemove={onRemove}
        fixedKeys={new Set()}
        pendingComponent={null}
      />,
    );
    const hit = screen.getByTestId(`hit-${edgeKey(0, 0, 'h')}`);
    fireEvent.pointerDown(hit);
    vi.advanceTimersByTime(100);
    fireEvent.pointerUp(hit);
    fireEvent.click(hit);

    expect(onRemove).not.toHaveBeenCalled();
    expect(onToggleSwitch).toHaveBeenCalledWith(edgeKey(0, 0, 'h'));
    vi.useRealTimers();
  });

  it('does not remove a fixed switch on a long press', () => {
    vi.useFakeTimers();
    const onRemove = vi.fn();
    const grid = createEmptyGrid(2, 2);
    grid.edges[edgeKey(0, 0, 'h')] = { type: 'switch', closed: false };
    render(
      <CircuitGrid
        grid={grid}
        onPlace={vi.fn()}
        onToggleSwitch={vi.fn()}
        onToggleDiode={vi.fn()}
        onToggleInverter={vi.fn()}
        onRemove={onRemove}
        fixedKeys={new Set([edgeKey(0, 0, 'h')])}
        pendingComponent={null}
      />,
    );
    const hit = screen.getByTestId(`hit-${edgeKey(0, 0, 'h')}`);
    fireEvent.pointerDown(hit);
    vi.advanceTimersByTime(600);
    fireEvent.pointerUp(hit);

    expect(onRemove).not.toHaveBeenCalled();
    vi.useRealTimers();
  });

  it('toggles a placed diode on tap', async () => {
    const user = userEvent.setup();
    const onToggleDiode = vi.fn();
    const grid = createEmptyGrid(2, 2);
    grid.edges[edgeKey(0, 0, 'h')] = { type: 'diode', forward: true };
    render(
      <CircuitGrid
        grid={grid}
        onPlace={vi.fn()}
        onToggleSwitch={vi.fn()}
        onToggleDiode={onToggleDiode}
        onToggleInverter={vi.fn()}
        onRemove={vi.fn()}
        fixedKeys={new Set()}
        pendingComponent={null}
      />,
    );
    await user.click(screen.getByTestId(`hit-${edgeKey(0, 0, 'h')}`));
    expect(onToggleDiode).toHaveBeenCalledWith(edgeKey(0, 0, 'h'));
  });

  it('removes a placed diode on a long press, without toggling it', () => {
    vi.useFakeTimers();
    const onToggleDiode = vi.fn();
    const onRemove = vi.fn();
    const grid = createEmptyGrid(2, 2);
    grid.edges[edgeKey(0, 0, 'h')] = { type: 'diode', forward: true };
    render(
      <CircuitGrid
        grid={grid}
        onPlace={vi.fn()}
        onToggleSwitch={vi.fn()}
        onToggleDiode={onToggleDiode}
        onToggleInverter={vi.fn()}
        onRemove={onRemove}
        fixedKeys={new Set()}
        pendingComponent={null}
      />,
    );
    const hit = screen.getByTestId(`hit-${edgeKey(0, 0, 'h')}`);
    fireEvent.pointerDown(hit);
    vi.advanceTimersByTime(600);
    fireEvent.pointerUp(hit);

    expect(onRemove).toHaveBeenCalledWith(edgeKey(0, 0, 'h'));
    expect(onToggleDiode).not.toHaveBeenCalled();
    vi.useRealTimers();
  });

  it('renders a distinct icon for diode, buzzer, and motor', () => {
    const grid = createEmptyGrid(2, 2);
    grid.edges[edgeKey(0, 0, 'h')] = { type: 'diode', forward: true };
    grid.edges[edgeKey(0, 1, 'v')] = { type: 'buzzer' };
    grid.edges[edgeKey(0, 0, 'v')] = { type: 'motor' };
    render(
      <CircuitGrid
        grid={grid}
        onPlace={vi.fn()}
        onToggleSwitch={vi.fn()}
        onToggleDiode={vi.fn()}
        onToggleInverter={vi.fn()}
        onRemove={vi.fn()}
        fixedKeys={new Set()}
        pendingComponent={null}
      />,
    );
    expect(screen.getByTestId(`icon-diode-${edgeKey(0, 0, 'h')}`)).toBeInTheDocument();
    expect(screen.getByTestId(`icon-buzzer-${edgeKey(0, 1, 'v')}`)).toBeInTheDocument();
    expect(screen.getByTestId(`icon-motor-${edgeKey(0, 0, 'v')}`)).toBeInTheDocument();
  });

  it('toggles a placed inverter on tap', async () => {
    const user = userEvent.setup();
    const onToggleInverter = vi.fn();
    const grid = createEmptyGrid(2, 2);
    grid.edges[edgeKey(0, 0, 'h')] = { type: 'inverter' };
    render(
      <CircuitGrid
        grid={grid}
        onPlace={vi.fn()}
        onToggleSwitch={vi.fn()}
        onToggleDiode={vi.fn()}
        onToggleInverter={onToggleInverter}
        onRemove={vi.fn()}
        fixedKeys={new Set()}
        pendingComponent={null}
      />,
    );
    await user.click(screen.getByTestId(`hit-${edgeKey(0, 0, 'h')}`));
    expect(onToggleInverter).toHaveBeenCalledWith(edgeKey(0, 0, 'h'));
  });

  it('removes a placed inverter on a long press, without toggling it', () => {
    vi.useFakeTimers();
    const onToggleInverter = vi.fn();
    const onRemove = vi.fn();
    const grid = createEmptyGrid(2, 2);
    grid.edges[edgeKey(0, 0, 'h')] = { type: 'inverter' };
    render(
      <CircuitGrid
        grid={grid}
        onPlace={vi.fn()}
        onToggleSwitch={vi.fn()}
        onToggleDiode={vi.fn()}
        onToggleInverter={onToggleInverter}
        onRemove={onRemove}
        fixedKeys={new Set()}
        pendingComponent={null}
      />,
    );
    const hit = screen.getByTestId(`hit-${edgeKey(0, 0, 'h')}`);
    fireEvent.pointerDown(hit);
    vi.advanceTimersByTime(600);
    fireEvent.pointerUp(hit);

    expect(onRemove).toHaveBeenCalledWith(edgeKey(0, 0, 'h'));
    expect(onToggleInverter).not.toHaveBeenCalled();
    vi.useRealTimers();
  });

  it('renders a distinct icon for inverter', () => {
    const grid = createEmptyGrid(2, 2);
    grid.edges[edgeKey(0, 0, 'h')] = { type: 'inverter' };
    render(
      <CircuitGrid
        grid={grid}
        onPlace={vi.fn()}
        onToggleSwitch={vi.fn()}
        onToggleDiode={vi.fn()}
        onToggleInverter={vi.fn()}
        onRemove={vi.fn()}
        fixedKeys={new Set()}
        pendingComponent={null}
      />,
    );
    expect(screen.getByTestId(`icon-inverter-${edgeKey(0, 0, 'h')}`)).toBeInTheDocument();
  });
});
