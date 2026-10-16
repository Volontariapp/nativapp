import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import type { MediaLibraryPermissionResponse } from 'expo-image-picker';
// Les mocks doivent etre charges avant le composant, qui importe les modules mockes ci-dessous
import * as mockContracts from '@/api/storage/__tests__/contracts.mock';
import {
  mockLaunchPicker,
  mockRequestPermission,
  mockUploadImage,
  pickedAsset,
  pickerResult,
} from './profile-edit-modal.mock';
import { FILE_ID } from '@/api/storage/__tests__/storage.factory';
import { createProfile } from './profile.factory';
import { ProfileEditModal } from '../ProfileEditModal';
import type { ProfileSubmitData } from '../profile-edit.types';

jest.mock('@volontariapp/contracts', () => mockContracts, { virtual: true });
jest.mock('expo-image-picker', () => ({
  requestMediaLibraryPermissionsAsync: mockRequestPermission,
  launchImageLibraryAsync: mockLaunchPicker,
  PermissionStatus: { GRANTED: 'granted', DENIED: 'denied' },
}));
jest.mock('expo-image', () => ({ Image: 'Image' }));
jest.mock('@/api/storage/upload-image', () => ({ uploadImage: mockUploadImage }));

const PUBLIC_URL = `https://cdn.test/user-avatar/${FILE_ID}.webp`;
const granted = { status: 'granted' } as MediaLibraryPermissionResponse;

const renderModal = (onSubmit = jest.fn<undefined, [ProfileSubmitData]>()) => {
  const screen = render(
    <QueryClientProvider
      client={new QueryClient({ defaultOptions: { mutations: { retry: false } } })}
    >
      <ProfileEditModal visible onClose={jest.fn()} onSubmit={onSubmit} profile={createProfile()} />
    </QueryClientProvider>,
  );
  return { ...screen, onSubmit };
};

const pickPhoto = async (screen: ReturnType<typeof renderModal>) => {
  fireEvent.press(screen.getByText('Choisir une image'));
  await waitFor(() => {
    expect(mockLaunchPicker).toHaveBeenCalled();
  });
};

describe('ProfileEditModal avatar upload', () => {
  beforeEach(() => {
    mockRequestPermission.mockResolvedValue(granted);
    mockLaunchPicker.mockResolvedValue(pickerResult([pickedAsset]));
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('while the photo is uploading', () => {
    it('tells the user and does not save', async () => {
      mockUploadImage.mockReturnValue(new Promise(() => undefined));
      const screen = renderModal();

      await pickPhoto(screen);

      expect(await screen.findByText('Envoi de la photo...')).toBeTruthy();
      expect(screen.getByTestId('avatar-upload-spinner')).toBeTruthy();
      fireEvent.press(screen.getByText('Enregistrer'));
      await waitFor(() => {
        expect(screen.onSubmit).not.toHaveBeenCalled();
      });
    });
  });

  describe('the upload spinner', () => {
    it('is not shown before a photo is chosen', () => {
      const screen = renderModal();

      expect(screen.queryByTestId('avatar-upload-spinner')).toBeNull();
    });

    it('goes away once the photo is uploaded', async () => {
      mockUploadImage.mockResolvedValue({ fileId: FILE_ID, state: 'CLEAN', publicUrl: PUBLIC_URL });
      const screen = renderModal();

      await pickPhoto(screen);
      await screen.findByTestId('avatar-preview');

      expect(screen.queryByTestId('avatar-upload-spinner')).toBeNull();
    });

    it('goes away when the upload fails', async () => {
      mockUploadImage.mockRejectedValue(new Error('network'));
      const screen = renderModal();

      await pickPhoto(screen);
      await screen.findByText("L'envoi de la photo a échoué. Réessaie.");

      expect(screen.queryByTestId('avatar-upload-spinner')).toBeNull();
    });
  });

  describe('when the photo is clean', () => {
    it('previews the new photo from its public URL', async () => {
      mockUploadImage.mockResolvedValue({ fileId: FILE_ID, state: 'CLEAN', publicUrl: PUBLIC_URL });
      const screen = renderModal();

      await pickPhoto(screen);

      const preview = await screen.findByTestId('avatar-preview');
      expect(preview.props.source).toEqual({ uri: PUBLIC_URL });
    });

    it('sends the avatar file id with the form on save', async () => {
      mockUploadImage.mockResolvedValue({ fileId: FILE_ID, state: 'CLEAN', publicUrl: PUBLIC_URL });
      const screen = renderModal();
      await pickPhoto(screen);
      await screen.findByTestId('avatar-preview');

      fireEvent.press(screen.getByText('Enregistrer'));

      await waitFor(() => {
        expect(screen.onSubmit).toHaveBeenCalledWith(
          expect.objectContaining({ pseudo: 'john_doe', avatarFileId: FILE_ID }),
        );
      });
    });
  });

  describe('when no photo was chosen', () => {
    it('saves the form without an avatar file id', async () => {
      const screen = renderModal();

      fireEvent.press(screen.getByText('Enregistrer'));

      await waitFor(() => {
        expect(screen.onSubmit).toHaveBeenCalledTimes(1);
      });
      expect(screen.onSubmit.mock.calls[0]?.[0]).not.toHaveProperty('avatarFileId');
    });
  });

  describe('when the upload fails', () => {
    it('shows an error and uploads the same photo again on retry', async () => {
      mockUploadImage
        .mockRejectedValueOnce(new Error('network'))
        .mockResolvedValueOnce({ fileId: FILE_ID, state: 'CLEAN', publicUrl: PUBLIC_URL });
      const screen = renderModal();
      await pickPhoto(screen);

      expect(await screen.findByText("L'envoi de la photo a échoué. Réessaie.")).toBeTruthy();
      fireEvent.press(screen.getByText('Réessayer'));

      expect(await screen.findByTestId('avatar-preview')).toBeTruthy();
      expect(mockUploadImage).toHaveBeenCalledTimes(2);
      expect(mockUploadImage.mock.calls[1]?.[1]).toEqual(mockUploadImage.mock.calls[0]?.[1]);
    });

    it('explains that photo storage is unavailable on a 503', async () => {
      mockUploadImage.mockRejectedValue(
        Object.assign(new Error('Service Unavailable'), { code: '503' }),
      );
      const screen = renderModal();

      await pickPhoto(screen);

      expect(
        await screen.findByText(
          'Le stockage des photos est indisponible pour le moment. Réessaie plus tard.',
        ),
      ).toBeTruthy();
    });

    it('asks for another photo when the image is rejected, and does not send it', async () => {
      mockUploadImage.mockResolvedValue({
        fileId: FILE_ID,
        state: 'REJECTED',
        publicUrl: undefined,
      });
      const screen = renderModal();
      await pickPhoto(screen);

      expect(
        await screen.findByText('Cette photo a été refusée. Choisis-en une autre.'),
      ).toBeTruthy();
      fireEvent.press(screen.getByText('Enregistrer'));

      await waitFor(() => {
        expect(screen.onSubmit).toHaveBeenCalledTimes(1);
      });
      expect(screen.onSubmit.mock.calls[0]?.[0]).not.toHaveProperty('avatarFileId');
    });

    it('asks to retry when the photo could not be verified, and does not send it', async () => {
      mockUploadImage.mockResolvedValue({
        fileId: FILE_ID,
        state: 'SCANNING',
        publicUrl: undefined,
      });
      const screen = renderModal();
      await pickPhoto(screen);

      expect(
        await screen.findByText("La vérification de la photo n'a pas abouti. Réessaie."),
      ).toBeTruthy();
      expect(screen.getByText('Réessayer')).toBeTruthy();
      fireEvent.press(screen.getByText('Enregistrer'));

      await waitFor(() => {
        expect(screen.onSubmit).toHaveBeenCalledTimes(1);
      });
      expect(screen.onSubmit.mock.calls[0]?.[0]).not.toHaveProperty('avatarFileId');
    });
  });
});
