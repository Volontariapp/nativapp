import type { PostImage } from '../post-images.types';
import type { FileUploadResult } from '@/api/storage/file-upload.types';

export const createUploadResult = (
  overrides: Partial<FileUploadResult> = {},
): FileUploadResult => ({
  fileId: '5d0e4a3c-7f0b-4b76-9a52-0d1f4f3b9e11',
  state: 'CLEAN',
  publicUrl: undefined,
  ...overrides,
});

export interface Deferred<T> {
  promise: Promise<T>;
  resolve: (value: T) => void;
  reject: (reason: Error) => void;
}

/** Promesse résolue à la main, pour maîtriser l'ordre de fin de plusieurs envois. */
export const createDeferred = <T>(): Deferred<T> => {
  let resolve: Deferred<T>['resolve'] = () => undefined;
  let reject: Deferred<T>['reject'] = () => undefined;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
};

export const createPostImage = (overrides: Partial<PostImage> = {}): PostImage => ({
  id: 'post-image-1',
  source: { uri: 'file:///gallery/IMG_0001.HEIC', width: 4000, height: 3000 },
  status: 'ready',
  fileId: '5d0e4a3c-7f0b-4b76-9a52-0d1f4f3b9e11',
  ...overrides,
});
