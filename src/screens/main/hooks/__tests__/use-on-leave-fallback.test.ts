import { renderHook } from '@testing-library/react-native';
import { useOnLeaveFallback } from '../use-on-leave-fallback';

describe('useOnLeaveFallback', () => {
  it('does not fire on the first render', () => {
    const onLeave = jest.fn();

    renderHook(({ isFallback }) => {
      useOnLeaveFallback(isFallback, onLeave);
    }, { initialProps: { isFallback: false } });

    expect(onLeave).not.toHaveBeenCalled();
  });

  it('fires once when the ranking list takes over from the fallback list', () => {
    const onLeave = jest.fn();
    const { rerender } = renderHook(
      ({ isFallback }) => {
        useOnLeaveFallback(isFallback, onLeave);
      },
      { initialProps: { isFallback: true } },
    );

    rerender({ isFallback: false });

    expect(onLeave).toHaveBeenCalledTimes(1);
  });

  it('does not fire when entering the fallback', () => {
    const onLeave = jest.fn();
    const { rerender } = renderHook(
      ({ isFallback }) => {
        useOnLeaveFallback(isFallback, onLeave);
      },
      { initialProps: { isFallback: false } },
    );

    rerender({ isFallback: true });

    expect(onLeave).not.toHaveBeenCalled();
  });

  it('does not fire again while the ranking list stays in place', () => {
    const onLeave = jest.fn();
    const { rerender } = renderHook(
      ({ isFallback }) => {
        useOnLeaveFallback(isFallback, onLeave);
      },
      { initialProps: { isFallback: true } },
    );

    rerender({ isFallback: false });
    rerender({ isFallback: false });

    expect(onLeave).toHaveBeenCalledTimes(1);
  });

  it('uses the latest callback without re-firing', () => {
    const first = jest.fn();
    const second = jest.fn();
    const { rerender } = renderHook(
      ({ isFallback, onLeave }) => {
        useOnLeaveFallback(isFallback, onLeave);
      },
      { initialProps: { isFallback: true, onLeave: first } },
    );

    rerender({ isFallback: true, onLeave: second });
    rerender({ isFallback: false, onLeave: second });

    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledTimes(1);
  });
});
