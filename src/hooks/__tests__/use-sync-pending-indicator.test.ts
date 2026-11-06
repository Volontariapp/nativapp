jest.mock('@volontariapp/errors', () => ({}), { virtual: true });
jest.mock('@volontariapp/messaging', () => ({}), { virtual: true });

import { act } from 'react';
import { renderHook } from '@testing-library/react-native';
import { authExpiredBus, syncPendingBus } from '../../services/event-bus.service';
import { useSyncPendingIndicator } from '../use-sync-pending-indicator';

describe('useSyncPendingIndicator', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  it('is off by default', () => {
    const { result } = renderHook(() => useSyncPendingIndicator());

    expect(result.current).toBe(false);
  });

  it('turns on when a degraded response is signalled and off when the sync event arrives', () => {
    const { result } = renderHook(() => useSyncPendingIndicator());

    act(() => {
      syncPendingBus.emit(true);
    });
    expect(result.current).toBe(true);

    act(() => {
      syncPendingBus.emit(false);
    });
    expect(result.current).toBe(false);
  });

  it('turns itself off when the sync event never arrives', () => {
    const { result } = renderHook(() => useSyncPendingIndicator());

    act(() => {
      syncPendingBus.emit(true);
    });
    act(() => {
      jest.advanceTimersByTime(20_000 - 1);
    });
    expect(result.current).toBe(true);

    act(() => {
      jest.advanceTimersByTime(1);
    });
    expect(result.current).toBe(false);
  });

  it('restarts the countdown when a new degraded response comes in', () => {
    const { result } = renderHook(() => useSyncPendingIndicator());

    act(() => {
      syncPendingBus.emit(true);
    });
    act(() => {
      jest.advanceTimersByTime(15_000);
    });
    act(() => {
      syncPendingBus.emit(true);
    });
    act(() => {
      jest.advanceTimersByTime(15_000);
    });

    expect(result.current).toBe(true);
  });

  it('turns off when the session expires', () => {
    const { result } = renderHook(() => useSyncPendingIndicator());

    act(() => {
      syncPendingBus.emit(true);
    });
    act(() => {
      authExpiredBus.emit();
    });

    expect(result.current).toBe(false);
  });
});
