import React from 'react';
import { Alert } from 'react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import * as mockContracts from '@/api/storage/__tests__/contracts.mock';
import { createPickedImages } from '@/api/storage/__tests__/picked-image.factory';
import * as mockImages from '@/api/post/__tests__/post-images.mock';
import { createDeferred, createUploadResult } from '@/api/post/__tests__/post-images.factory';
import * as mockForm from './post-form-screen.mock';
import { createPostResponse } from './post-form.factory';
import { PostFormScreen } from '../PostFormScreen';

jest.mock('@volontariapp/contracts', () => mockContracts, { virtual: true });
jest.mock('@/api/storage/pick-gallery-images', () => ({
  pickGalleryImages: (...args: unknown[]) => mockImages.pickGalleryImages(...args) as unknown,
}));
jest.mock('@/api/storage/upload-image', () => ({
  uploadImage: (...args: unknown[]) => mockImages.uploadImage(...args) as unknown,
}));
jest.mock('@/api/post/post.api', () => ({
  postApi: { createPost: (...args: unknown[]) => mockForm.mockCreatePost(...args) as unknown },
}));
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ goBack: mockForm.mockGoBack }),
}));
jest.mock('@/context/AuthContext', () => ({ useAuth: () => ({ userId: 'user-1' }) }));
jest.mock('@/context/DebugContext', () => ({ useDebug: () => mockForm.mockDebug }));
jest.mock('@/components/layout/AppHeader', () => ({ __esModule: true, default: () => null }));
jest.mock('@/components/post/event-selector', () => ({ EventSelector: () => null }));
jest.mock('expo-image', () => ({ Image: 'Image' }));

const FILE_A = '11111111-1111-4111-8111-111111111111';

const renderScreen = () =>
  render(
    <QueryClientProvider
      client={new QueryClient({ defaultOptions: { mutations: { retry: false } } })}
    >
      <PostFormScreen />
    </QueryClientProvider>,
  );

const fillForm = (screen: ReturnType<typeof renderScreen>): void => {
  fireEvent.changeText(
    screen.getByPlaceholderText('Ex: Belle initiative ce matin...'),
    'Mission Maraude Paris',
  );
  fireEvent.changeText(
    screen.getByPlaceholderText(
      "Partagez votre retour d'expérience, une annonce ou des nouvelles...",
    ),
    'Besoin de 5 benevoles ce samedi',
  );
};

const addImages = async (screen: ReturnType<typeof renderScreen>, count: number) => {
  mockImages.pickGalleryImages.mockResolvedValueOnce(createPickedImages(count));
  fireEvent.press(screen.getByLabelText('Ajouter une image'));
  await waitFor(() => {
    expect(screen.getAllByLabelText(/^Retirer l'image/)).toHaveLength(count);
  });
};

const publish = (screen: ReturnType<typeof renderScreen>): void => {
  fireEvent.press(screen.getByText('Publier le post'));
};

describe('PostFormScreen images', () => {
  beforeEach(() => {
    jest.spyOn(Alert, 'alert').mockImplementation(() => undefined);
    mockForm.mockCreatePost.mockResolvedValue(createPostResponse('NONE'));
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.resetAllMocks();
  });

  it('publishes a post without image with an empty fileIds and an idempotency key', async () => {
    const screen = renderScreen();
    fillForm(screen);

    publish(screen);

    await waitFor(() => {
      expect(mockForm.mockCreatePost).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Mission Maraude Paris',
          fileIds: [],
          idempotencyKey: expect.stringMatching(/^[0-9a-f-]{36}$/) as unknown,
        }),
      );
    });
    expect(mockForm.mockGoBack).toHaveBeenCalled();
  });

  it('sends the uploaded image as the only fileId of the post', async () => {
    mockImages.uploadImage.mockResolvedValueOnce(createUploadResult({ fileId: FILE_A }));
    const screen = renderScreen();
    fillForm(screen);
    await addImages(screen, 1);
    await waitFor(() => {
      expect(screen.queryByText('Envoi...')).toBeNull();
    });

    publish(screen);

    await waitFor(() => {
      expect(mockForm.mockCreatePost).toHaveBeenCalledWith(
        expect.objectContaining({ fileIds: [FILE_A] }),
      );
    });
  });

  it('allows a single image: the add button is gone once an image is chosen', async () => {
    mockImages.uploadImage.mockResolvedValueOnce(createUploadResult({ fileId: FILE_A }));
    const screen = renderScreen();
    await addImages(screen, 1);

    expect(screen.queryByLabelText('Ajouter une image')).toBeNull();

    fireEvent.press(screen.getByLabelText("Retirer l'image 1"));

    expect(screen.getByLabelText('Ajouter une image')).toBeTruthy();
  });

  it('keeps the same idempotency key when the user retries after a failure', async () => {
    mockForm.mockCreatePost
      .mockRejectedValueOnce(new Error('network'))
      .mockResolvedValueOnce(createPostResponse('NONE'));
    const screen = renderScreen();
    fillForm(screen);

    publish(screen);
    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith('Erreur', 'Impossible de publier votre post.');
    });
    publish(screen);

    await waitFor(() => {
      expect(mockForm.mockCreatePost).toHaveBeenCalledTimes(2);
    });
    const [first, second] = mockForm.mockCreatePost.mock.calls as [{ idempotencyKey: string }][];
    expect(second?.[0].idempotencyKey).toBe(first?.[0].idempotencyKey);
  });

  it('does not publish while an image is still uploading', async () => {
    const pending = createDeferred<ReturnType<typeof createUploadResult>>();
    mockImages.uploadImage.mockReturnValueOnce(pending.promise);
    const screen = renderScreen();
    fillForm(screen);
    await addImages(screen, 1);
    await screen.findByText('Envoi...');

    publish(screen);

    expect(mockForm.mockCreatePost).not.toHaveBeenCalled();
    expect(screen.getByText('Envoi des images en cours...')).toBeTruthy();
  });

  it('blocks the publication while an image is rejected until it is removed', async () => {
    mockImages.uploadImage.mockResolvedValueOnce(
      createUploadResult({ fileId: FILE_A, state: 'REJECTED' }),
    );
    const screen = renderScreen();
    fillForm(screen);
    await addImages(screen, 1);
    await screen.findByText('Refusée');

    publish(screen);
    expect(mockForm.mockCreatePost).not.toHaveBeenCalled();

    fireEvent.press(screen.getByLabelText("Retirer l'image 1"));
    publish(screen);

    await waitFor(() => {
      expect(mockForm.mockCreatePost).toHaveBeenCalledWith(
        expect.objectContaining({ fileIds: [] }),
      );
    });
  });

  it('tells the author the post is being processed when it comes back PENDING', async () => {
    mockImages.uploadImage.mockResolvedValueOnce(
      createUploadResult({ fileId: FILE_A, state: 'SCANNING' }),
    );
    mockForm.mockCreatePost.mockResolvedValueOnce(createPostResponse('PENDING'));
    const screen = renderScreen();
    fillForm(screen);
    await addImages(screen, 1);
    await screen.findByText('Analyse en cours');

    publish(screen);

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        'Post en cours de traitement',
        expect.any(String),
        expect.any(Array),
      );
    });
    expect(mockForm.mockGoBack).not.toHaveBeenCalled();
    const [, , buttons] = jest.mocked(Alert.alert).mock.calls.at(-1) ?? [];
    buttons?.[0]?.onPress?.();
    expect(mockForm.mockGoBack).toHaveBeenCalled();
  });
});
