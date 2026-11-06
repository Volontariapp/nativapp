import { renderHook } from '@testing-library/react-native';
import { useFrozenSnapshot } from '../use-frozen-snapshot';

interface Props {
  value: string;
  isReady: boolean;
  isActive: boolean;
}

const render = (initialProps: Props) =>
  renderHook(({ value, isReady, isActive }: Props) => useFrozenSnapshot(value, isReady, isActive), {
    initialProps,
  });

describe('useFrozenSnapshot', () => {
  it('has no snapshot until the value is ready', () => {
    const { result } = render({ value: 'a', isReady: false, isActive: true });

    expect(result.current).toBeNull();
  });

  it('takes the value as soon as it is ready', () => {
    const { result, rerender } = render({ value: 'a', isReady: false, isActive: true });

    rerender({ value: 'a', isReady: true, isActive: true });

    expect(result.current).toBe('a');
  });

  it('keeps the first ready value while later values come in', () => {
    const { result, rerender } = render({ value: 'a', isReady: true, isActive: true });

    rerender({ value: 'b', isReady: true, isActive: true });
    rerender({ value: 'c', isReady: true, isActive: true });

    expect(result.current).toBe('a');
  });

  it('forgets the snapshot when it is no longer active and takes a fresh one next time', () => {
    const { result, rerender } = render({ value: 'a', isReady: true, isActive: true });

    rerender({ value: 'b', isReady: true, isActive: false });
    expect(result.current).toBeNull();

    rerender({ value: 'c', isReady: true, isActive: true });
    expect(result.current).toBe('c');
  });

  it('never takes a snapshot while inactive', () => {
    const { result } = render({ value: 'a', isReady: true, isActive: false });

    expect(result.current).toBeNull();
  });
});
