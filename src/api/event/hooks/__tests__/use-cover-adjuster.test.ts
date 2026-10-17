import { act } from 'react';
import { renderHook } from '@testing-library/react-native';
import { createPickedImage } from '@/api/storage/__tests__/picked-image.factory';
import { useCoverAdjuster } from '../use-cover-adjuster';

describe('useCoverAdjuster', () => {
  it('has nothing to adjust at first', () => {
    const { result } = renderHook(() => useCoverAdjuster());

    expect(result.current.pendingImage).toBeUndefined();
  });

  it('exposes the image being adjusted and resolves with the adjusted one', async () => {
    const original = createPickedImage({ uri: 'file:///gallery/original.jpg' });
    const cropped = createPickedImage({ uri: 'file:///cache/cropped.jpg' });
    const { result } = renderHook(() => useCoverAdjuster());

    let outcome: Promise<unknown> = Promise.resolve();
    act(() => {
      outcome = result.current.adjustImage(original);
    });
    expect(result.current.pendingImage).toEqual(original);

    act(() => {
      result.current.settle(cropped);
    });

    await expect(outcome).resolves.toEqual(cropped);
    expect(result.current.pendingImage).toBeUndefined();
  });

  it('resolves with undefined when the user cancels', async () => {
    const { result } = renderHook(() => useCoverAdjuster());

    let outcome: Promise<unknown> = Promise.resolve();
    act(() => {
      outcome = result.current.adjustImage(createPickedImage());
    });
    act(() => {
      result.current.settle(undefined);
    });

    await expect(outcome).resolves.toBeUndefined();
    expect(result.current.pendingImage).toBeUndefined();
  });
});
