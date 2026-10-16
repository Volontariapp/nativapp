import React, { act } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react-native';
import * as mockContracts from '@/api/storage/__tests__/contracts.mock';
import {
  createPickedImage,
  createPickedImages,
} from '@/api/storage/__tests__/picked-image.factory';
import * as mockDeps from './post-images.mock';
import { createDeferred, createUploadResult } from './post-images.factory';
import { MAX_POST_IMAGES, usePostImages } from '../hooks/use-post-images';

jest.mock('@volontariapp/contracts', () => mockContracts, { virtual: true });
jest.mock('@/api/storage/pick-gallery-images', () => ({
  pickGalleryImages: (...args: unknown[]) => mockDeps.pickGalleryImages(...args) as unknown,
}));
jest.mock('@/api/storage/upload-image', () => ({
  uploadImage: (...args: unknown[]) => mockDeps.uploadImage(...args) as unknown,
}));

const FILE_A = '11111111-1111-4111-8111-111111111111';
const FILE_B = '22222222-2222-4222-8222-222222222222';

const renderPostImages = () => {
  const client = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  const wrapper = ({ children }: { children: React.ReactNode }): React.JSX.Element => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
  return renderHook(() => usePostImages(), { wrapper });
};

describe('usePostImages', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it('uploads the picked images for a post and exposes their file ids', async () => {
    mockDeps.pickGalleryImages.mockResolvedValue(createPickedImages(1));
    mockDeps.uploadImage.mockResolvedValue(createUploadResult({ fileId: FILE_A }));
    const { result } = renderPostImages();

    await act(async () => {
      await result.current.addImages();
    });

    await waitFor(() => {
      expect(result.current.images.map((image) => image.status)).toEqual(['ready']);
    });
    expect(result.current.fileIds).toEqual([FILE_A]);
    expect(mockDeps.uploadImage).toHaveBeenCalledWith(
      mockContracts.EntityType.ENTITY_TYPE_POST,
      createPickedImages(1)[0],
    );
  });

  it('keeps the selection order even when a later image finishes first', async () => {
    const first = createDeferred<ReturnType<typeof createUploadResult>>();
    const second = createDeferred<ReturnType<typeof createUploadResult>>();
    mockDeps.pickGalleryImages.mockResolvedValue(createPickedImages(2));
    mockDeps.uploadImage.mockReturnValueOnce(first.promise).mockReturnValueOnce(second.promise);
    const { result } = renderPostImages();

    act(() => {
      void result.current.addImages();
    });
    await waitFor(() => {
      expect(result.current.images).toHaveLength(2);
    });
    expect(result.current.isUploading).toBe(true);
    await act(async () => {
      second.resolve(createUploadResult({ fileId: FILE_B }));
      await second.promise;
    });
    await act(async () => {
      first.resolve(createUploadResult({ fileId: FILE_A }));
      await first.promise;
    });

    await waitFor(() => {
      expect(result.current.isUploading).toBe(false);
    });
    expect(result.current.fileIds).toEqual([FILE_A, FILE_B]);
  });

  it('keeps an image still being scanned and flags it as processing', async () => {
    mockDeps.pickGalleryImages.mockResolvedValue(createPickedImages(1));
    mockDeps.uploadImage.mockResolvedValue(
      createUploadResult({ fileId: FILE_A, state: 'SCANNING' }),
    );
    const { result } = renderPostImages();

    await act(async () => {
      await result.current.addImages();
    });

    await waitFor(() => {
      expect(result.current.images[0]?.status).toBe('processing');
    });
    expect(result.current.fileIds).toEqual([FILE_A]);
    expect(result.current.hasBlockingImage).toBe(false);
  });

  it('excludes a rejected image from the file ids and blocks publication', async () => {
    mockDeps.pickGalleryImages.mockResolvedValue(createPickedImages(1));
    mockDeps.uploadImage.mockResolvedValue(
      createUploadResult({ fileId: FILE_A, state: 'REJECTED' }),
    );
    const { result } = renderPostImages();

    await act(async () => {
      await result.current.addImages();
    });

    await waitFor(() => {
      expect(result.current.images[0]?.status).toBe('rejected');
    });
    expect(result.current.fileIds).toEqual([]);
    expect(result.current.hasBlockingImage).toBe(true);
  });

  it('flags a failed upload and uploads it again on retry', async () => {
    mockDeps.pickGalleryImages.mockResolvedValue(createPickedImages(1));
    mockDeps.uploadImage
      .mockRejectedValueOnce(new Error('network'))
      .mockResolvedValueOnce(createUploadResult({ fileId: FILE_A }));
    const { result } = renderPostImages();

    await act(async () => {
      await result.current.addImages();
    });
    await waitFor(() => {
      expect(result.current.images[0]?.status).toBe('failed');
    });
    expect(result.current.hasBlockingImage).toBe(true);

    const failedId = result.current.images[0]?.id ?? '';
    act(() => {
      result.current.retryImage(failedId);
    });

    await waitFor(() => {
      expect(result.current.images[0]?.status).toBe('ready');
    });
    expect(result.current.fileIds).toEqual([FILE_A]);
    expect(result.current.hasBlockingImage).toBe(false);
  });

  it('removes an image and frees its slot for the next selection', async () => {
    mockDeps.pickGalleryImages.mockResolvedValueOnce(createPickedImages(4));
    mockDeps.uploadImage.mockResolvedValue(createUploadResult({ fileId: FILE_A }));
    const { result } = renderPostImages();
    await act(async () => {
      await result.current.addImages();
    });
    await waitFor(() => {
      expect(result.current.isUploading).toBe(false);
    });

    act(() => {
      result.current.removeImage(result.current.images[0]?.id ?? '');
    });

    expect(result.current.images).toHaveLength(3);
    expect(result.current.remainingSlots).toBe(MAX_POST_IMAGES - 3);
    mockDeps.pickGalleryImages.mockResolvedValueOnce([createPickedImage()]);
    await act(async () => {
      await result.current.addImages();
    });
    expect(mockDeps.pickGalleryImages).toHaveBeenLastCalledWith({ limit: MAX_POST_IMAGES - 3 });
  });
});
