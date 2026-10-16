import type { PickedImage } from '../file-upload.types';

export const createPickedImage = (overrides: Partial<PickedImage> = {}): PickedImage => ({
  uri: 'file:///gallery/IMG_0001.HEIC',
  width: 4000,
  height: 3000,
  ...overrides,
});

export const createPickedImages = (count: number): PickedImage[] =>
  Array.from({ length: count }, (_, index) =>
    createPickedImage({ uri: `file:///gallery/IMG_${String(index + 1).padStart(4, '0')}.HEIC` }),
  );
