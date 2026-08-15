import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { playSound as PlaySound } from './sound';

class MockOscillator {
  type = '';
  frequency = { value: 0 };
  connect = vi.fn();
  start = vi.fn();
  stop = vi.fn();
}

class MockGain {
  gain = {
    setValueAtTime: vi.fn(),
    linearRampToValueAtTime: vi.fn(),
    exponentialRampToValueAtTime: vi.fn(),
  };
  connect = vi.fn();
}

class MockAudioContext {
  currentTime = 0;
  destination = {};
  createOscillator = vi.fn(() => new MockOscillator());
  createGain = vi.fn(() => new MockGain());
}

describe('playSound', () => {
  let mockCtx: MockAudioContext;
  let playSound: typeof PlaySound;

  beforeEach(async () => {
    vi.resetModules();
    mockCtx = new MockAudioContext();
    (globalThis as unknown as { AudioContext: unknown }).AudioContext = vi.fn(function AudioContext() {
      return mockCtx;
    });
    ({ playSound } = await import('./sound'));
  });

  it('plays nothing when muted', () => {
    playSound('place', true);
    expect(mockCtx.createOscillator).not.toHaveBeenCalled();
  });

  it('plays one tone for place', () => {
    playSound('place', false);
    expect(mockCtx.createOscillator).toHaveBeenCalledTimes(1);
  });

  it('plays one tone for remove, at a lower pitch than place', () => {
    playSound('remove', false);
    const oscillator = mockCtx.createOscillator.mock.results[0].value as MockOscillator;
    playSound('place', false);
    const placeOscillator = mockCtx.createOscillator.mock.results[1].value as MockOscillator;
    expect(oscillator.frequency.value).toBeLessThan(placeOscillator.frequency.value);
  });

  it('plays three ascending tones for solve', () => {
    playSound('solve', false);
    expect(mockCtx.createOscillator).toHaveBeenCalledTimes(3);
    const frequencies = mockCtx.createOscillator.mock.results.map(
      (result) => (result.value as MockOscillator).frequency.value,
    );
    expect(frequencies[0]).toBeLessThan(frequencies[1]);
    expect(frequencies[1]).toBeLessThan(frequencies[2]);
  });

  it('does nothing when AudioContext is unavailable', () => {
    (globalThis as unknown as { AudioContext: unknown }).AudioContext = undefined;
    expect(() => playSound('solve', false)).not.toThrow();
  });
});
