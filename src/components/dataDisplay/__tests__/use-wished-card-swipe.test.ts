import { renderHook } from '@testing-library/react-native';
import { useWishedCardSwipe } from '../use-wished-card-swipe';

describe('useWishedCardSwipe', () => {
  it('commits only once per card', async () => {
    const onCommit = jest.fn().mockResolvedValue(undefined);
    const { result } = renderHook(() => useWishedCardSwipe(onCommit));

    await result.current.commit('right');
    await result.current.commit('left');

    expect(onCommit).toHaveBeenCalledTimes(1);
    expect(onCommit).toHaveBeenCalledWith('right');
  });

  it('closes the card and allows a retry when the action fails', async () => {
    const onCommit = jest
      .fn()
      .mockRejectedValueOnce(new Error('boom'))
      .mockResolvedValue(undefined);
    const close = jest.fn();
    const { result } = renderHook(() => useWishedCardSwipe(onCommit));
    result.current.swipeRef.current = { close } as never;

    await result.current.commit('left');
    expect(close).toHaveBeenCalledTimes(1);

    await result.current.commit('left');
    expect(onCommit).toHaveBeenCalledTimes(2);
  });
});
