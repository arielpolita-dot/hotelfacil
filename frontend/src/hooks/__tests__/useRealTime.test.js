import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';

const mockSocket = {
  on: vi.fn(),
  emit: vi.fn(),
  disconnect: vi.fn(),
};

vi.mock('socket.io-client', () => ({
  io: vi.fn(() => mockSocket),
}));

import { io } from 'socket.io-client';

describe('useRealTime', () => {
  let useRealTime;

  beforeEach(() => {
    vi.clearAllMocks();
    mockSocket.on.mockReset();
    mockSocket.emit.mockReset();
    mockSocket.disconnect.mockReset();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('does nothing when empresaId is null', async () => {
    vi.resetModules();
    vi.stubEnv('VITE_USE_API', 'true');
    const mod = await import('../useRealTime');
    useRealTime = mod.useRealTime;

    const onEvent = vi.fn();
    renderHook(() => useRealTime(null, onEvent));
    expect(io).not.toHaveBeenCalled();
  });

  it('does nothing when VITE_USE_API is not true', async () => {
    vi.resetModules();
    vi.stubEnv('VITE_USE_API', 'false');
    const mod = await import('../useRealTime');
    useRealTime = mod.useRealTime;

    const onEvent = vi.fn();
    renderHook(() => useRealTime('emp-1', onEvent));
    expect(io).not.toHaveBeenCalled();
  });

  it('connects and subscribes when empresaId provided and API enabled', async () => {
    vi.resetModules();
    vi.stubEnv('VITE_USE_API', 'true');
    const mod = await import('../useRealTime');
    useRealTime = mod.useRealTime;

    const onEvent = vi.fn();
    renderHook(() => useRealTime('emp-1', onEvent));

    expect(io).toHaveBeenCalled();
    // Should register connect + 8 event listeners
    expect(mockSocket.on).toHaveBeenCalled();
    const connectCall = mockSocket.on.mock.calls.find(c => c[0] === 'connect');
    expect(connectCall).toBeDefined();
  });

  it('emits join-empresa on connect', async () => {
    vi.resetModules();
    vi.stubEnv('VITE_USE_API', 'true');
    const mod = await import('../useRealTime');
    useRealTime = mod.useRealTime;

    const onEvent = vi.fn();
    renderHook(() => useRealTime('emp-1', onEvent));

    const connectCall = mockSocket.on.mock.calls.find(c => c[0] === 'connect');
    connectCall[1](); // trigger connect callback
    expect(mockSocket.emit).toHaveBeenCalledWith('join-empresa', 'emp-1');
  });

  it('forwards events to onEvent callback', async () => {
    vi.resetModules();
    vi.stubEnv('VITE_USE_API', 'true');
    const mod = await import('../useRealTime');
    useRealTime = mod.useRealTime;

    const onEvent = vi.fn();
    renderHook(() => useRealTime('emp-1', onEvent));

    const quartosCall = mockSocket.on.mock.calls.find(c => c[0] === 'quartos:changed');
    expect(quartosCall).toBeDefined();
    quartosCall[1]({ some: 'data' });
    expect(onEvent).toHaveBeenCalledWith('quartos:changed', { some: 'data' });
  });

  it('disconnects on unmount', async () => {
    vi.resetModules();
    vi.stubEnv('VITE_USE_API', 'true');
    const mod = await import('../useRealTime');
    useRealTime = mod.useRealTime;

    const onEvent = vi.fn();
    const { unmount } = renderHook(() => useRealTime('emp-1', onEvent));
    unmount();
    expect(mockSocket.disconnect).toHaveBeenCalled();
  });
});
