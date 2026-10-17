import React, { act } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react-native';
import * as mockContracts from '@/api/storage/__tests__/contracts.mock';
import { createPickedImages } from '@/api/storage/__tests__/picked-image.factory';
import * as mockDeps from '@/api/post/__tests__/post-images.mock';
import { createUploadResult } from '@/api/post/__tests__/post-images.factory';
import { useEventCover } from '../use-event-cover';

jest.mock('@volontariapp/contracts', () => mockContracts, { virtual: true });
jest.mock('@/api/storage/pick-gallery-images', () => ({
  pickGalleryImages: (...args: unknown[]) => mockDeps.pickGalleryImages(...args) as unknown,
}));
jest.mock('@/api/storage/upload-image', () => ({
  uploadImage: (...args: unknown[]) => mockDeps.uploadImage(...args) as unknown,
}));

const FILE_ID = '11111111-1111-4111-8111-111111111111';

const renderEventCover = (options?: Parameters<typeof useEventCover>[0]) => {
  const client = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  const wrapper = ({ children }: { children: React.ReactNode }): React.JSX.Element => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
  return renderHook(() => useEventCover(options), { wrapper });
};

describe('useEventCover', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it('has no cover before a photo is picked', () => {
    const { result } = renderEventCover();

    expect(result.current.cover).toBeUndefined();
    expect(result.current.coverFileId).toBeUndefined();
    expect(result.current.remainingSlots).toBe(1);
  });

  it('uploads the photo as an EVENT_COVER and exposes its file id', async () => {
    mockDeps.pickGalleryImages.mockResolvedValue(createPickedImages(2));
    mockDeps.uploadImage.mockResolvedValue(createUploadResult({ fileId: FILE_ID }));
    const { result } = renderEventCover();

    await act(async () => {
      await result.current.addImages();
    });

    await waitFor(() => {
      expect(result.current.cover?.status).toBe('ready');
    });
    expect(mockDeps.pickGalleryImages).toHaveBeenCalledWith({ limit: 1 });
    expect(mockDeps.uploadImage).toHaveBeenCalledTimes(1);
    expect(mockDeps.uploadImage).toHaveBeenCalledWith(
      mockContracts.EntityType.ENTITY_TYPE_EVENT_COVER,
      createPickedImages(1)[0],
    );
    expect(result.current.coverFileId).toBe(FILE_ID);
    expect(result.current.remainingSlots).toBe(0);
  });

  it('sends no file id for a rejected photo and blocks publication', async () => {
    mockDeps.pickGalleryImages.mockResolvedValue(createPickedImages(1));
    mockDeps.uploadImage.mockResolvedValue(
      createUploadResult({ fileId: FILE_ID, state: 'REJECTED' }),
    );
    const { result } = renderEventCover();

    await act(async () => {
      await result.current.addImages();
    });

    await waitFor(() => {
      expect(result.current.cover?.status).toBe('rejected');
    });
    expect(result.current.coverFileId).toBeUndefined();
    expect(result.current.hasBlockingImage).toBe(true);
  });

  it('frees the slot when the photo is removed', async () => {
    mockDeps.pickGalleryImages.mockResolvedValue(createPickedImages(1));
    mockDeps.uploadImage.mockResolvedValue(createUploadResult({ fileId: FILE_ID }));
    const { result } = renderEventCover();
    await act(async () => {
      await result.current.addImages();
    });
    await waitFor(() => {
      expect(result.current.cover?.status).toBe('ready');
    });

    act(() => {
      result.current.removeImage(result.current.cover?.id ?? '');
    });

    expect(result.current.cover).toBeUndefined();
    expect(result.current.coverFileId).toBeUndefined();
    expect(result.current.remainingSlots).toBe(1);
  });

  it('uploads the adjusted photo instead of the picked one', async () => {
    const adjusted = createPickedImages(1)[0];
    const picked = createPickedImages(2)[1];
    mockDeps.pickGalleryImages.mockResolvedValue([picked]);
    mockDeps.uploadImage.mockResolvedValue(createUploadResult({ fileId: FILE_ID }));
    const adjustImage = jest.fn().mockResolvedValue(adjusted);
    const { result } = renderEventCover({ adjustImage });

    await act(async () => {
      await result.current.addImages();
    });

    await waitFor(() => {
      expect(result.current.cover?.status).toBe('ready');
    });
    expect(adjustImage).toHaveBeenCalledWith(picked);
    expect(mockDeps.uploadImage).toHaveBeenCalledWith(
      mockContracts.EntityType.ENTITY_TYPE_EVENT_COVER,
      adjusted,
    );
  });

  it('drops the photo when the adjustment is cancelled', async () => {
    mockDeps.pickGalleryImages.mockResolvedValue(createPickedImages(1));
    const adjustImage = jest.fn().mockResolvedValue(undefined);
    const { result } = renderEventCover({ adjustImage });

    await act(async () => {
      await result.current.addImages();
    });

    expect(result.current.cover).toBeUndefined();
    expect(mockDeps.uploadImage).not.toHaveBeenCalled();
    expect(result.current.remainingSlots).toBe(1);
  });
});
