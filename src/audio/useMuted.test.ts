import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { useMuted } from './useMuted';

describe('useMuted', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('starts unmuted by default', () => {
    const { result } = renderHook(() => useMuted());
    expect(result.current[0]).toBe(false);
  });

  it('toggles and persists across a fresh render', () => {
    const { result, unmount } = renderHook(() => useMuted());
    act(() => result.current[1]());
    expect(result.current[0]).toBe(true);
    unmount();

    const { result: second } = renderHook(() => useMuted());
    expect(second.current[0]).toBe(true);
  });

  it('toggles back to unmuted', () => {
    localStorage.setItem('circuit-workshop:muted', 'true');
    const { result } = renderHook(() => useMuted());
    expect(result.current[0]).toBe(true);
    act(() => result.current[1]());
    expect(result.current[0]).toBe(false);
  });
});
