import { act } from 'react';
import { renderHook } from '@testing-library/react-native';
import { useElapsed } from '../use-elapsed';

describe('useElapsed', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('is false until the delay has passed', () => {
    const { result } = renderHook(() => useElapsed(4000));

    expect(result.current).toBe(false);

    act(() => {
      jest.advanceTimersByTime(3999);
    });
    expect(result.current).toBe(false);

    act(() => {
      jest.advanceTimersByTime(1);
    });
    expect(result.current).toBe(true);
  });

  it('does not update after unmount', () => {
    const { unmount } = renderHook(() => useElapsed(4000));

    unmount();

    expect(jest.getTimerCount()).toBe(0);
  });
});
