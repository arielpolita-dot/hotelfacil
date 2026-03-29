import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useIsMobile } from '../use-mobile';

describe('useIsMobile', () => {
  let listeners = [];
  let mockMql;

  beforeEach(() => {
    listeners = [];
    mockMql = {
      addEventListener: vi.fn((event, handler) => listeners.push(handler)),
      removeEventListener: vi.fn(),
    };
    window.matchMedia = vi.fn().mockReturnValue(mockMql);
  });

  it('returns false when window width >= 768', () => {
    Object.defineProperty(window, 'innerWidth', { value: 1024, writable: true });
    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(false);
  });

  it('returns true when window width < 768', () => {
    Object.defineProperty(window, 'innerWidth', { value: 400, writable: true });
    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(true);
  });

  it('updates on media query change', () => {
    Object.defineProperty(window, 'innerWidth', { value: 1024, writable: true });
    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(false);

    // Simulate resize to mobile
    Object.defineProperty(window, 'innerWidth', { value: 400, writable: true });
    act(() => { listeners.forEach(fn => fn()); });
    expect(result.current).toBe(true);
  });

  it('cleans up listener on unmount', () => {
    Object.defineProperty(window, 'innerWidth', { value: 1024, writable: true });
    const { unmount } = renderHook(() => useIsMobile());
    unmount();
    expect(mockMql.removeEventListener).toHaveBeenCalled();
  });
});
