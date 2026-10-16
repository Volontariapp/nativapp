import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import type { MediaLibraryPermissionResponse } from 'expo-image-picker';
// Les mocks doivent etre charges avant l'ecran, qui importe les modules mockes ci-dessous
import * as mockContracts from '@/api/storage/__tests__/contracts.mock';
import {
  mockConfirmUpload,
  mockGetFileMetadata,
  mockGetUploadUrl,
  mockLaunchPicker,
  mockRequestPermission,
  mockUploadToPresignedPost,
  pickedAsset,
  pickerResult,
} from './storage-debug.mock';
import {
  FILE_ID,
  createConfirmUploadResponse,
  createFileMetadataResponse,
  createUploadUrlResponse,
} from '@/api/storage/__tests__/storage.factory';
import { StorageDebugScreen } from '../storage-debug-screen';

jest.mock('@volontariapp/contracts', () => mockContracts, { virtual: true });
jest.mock('expo-image-picker', () => ({
  requestMediaLibraryPermissionsAsync: mockRequestPermission,
  launchImageLibraryAsync: mockLaunchPicker,
  PermissionStatus: { GRANTED: 'granted', DENIED: 'denied' },
}));
jest.mock('expo-image', () => ({ Image: 'Image' }));
jest.mock('@/api/storage/storage.api', () => ({
  storageApi: {
    getUploadUrl: mockGetUploadUrl,
    confirmUpload: mockConfirmUpload,
    getFileMetadata: mockGetFileMetadata,
  },
}));
jest.mock('@/api/storage/storage-upload', () => ({
  uploadToPresignedPost: mockUploadToPresignedPost,
}));

const mockGoBack = jest.fn();
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ goBack: mockGoBack }),
}));

const granted = { status: 'granted' } as MediaLibraryPermissionResponse;
const denied = { status: 'denied' } as MediaLibraryPermissionResponse;

const renderWithImage = async () => {
  const screen = render(<StorageDebugScreen />);
  fireEvent.press(screen.getByText('Choisir une image'));
  await screen.findByText('Type : image/jpeg');
  return screen;
};

describe('StorageDebugScreen', () => {
  beforeEach(() => {
    mockRequestPermission.mockResolvedValue(granted);
    mockLaunchPicker.mockResolvedValue(pickerResult([pickedAsset]));
    mockGetUploadUrl.mockResolvedValue(createUploadUrlResponse());
    mockConfirmUpload.mockResolvedValue(createConfirmUploadResponse());
    mockGetFileMetadata.mockResolvedValue(createFileMetadataResponse());
    mockUploadToPresignedPost.mockResolvedValue(undefined);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('layout', () => {
    it('shows the title and the available actions', () => {
      const { getByText } = render(<StorageDebugScreen />);

      expect(getByText('Test du stockage')).toBeTruthy();
      expect(getByText('Choisir une image')).toBeTruthy();
      expect(getByText('Tout enchaîner')).toBeTruthy();
      expect(getByText('Aucune image choisie.')).toBeTruthy();
    });

    it('goes back from the top bar', () => {
      const { getByLabelText } = render(<StorageDebugScreen />);

      fireEvent.press(getByLabelText('Retour'));

      expect(mockGoBack).toHaveBeenCalledTimes(1);
    });
  });

  describe('choosing an image', () => {
    it('shows the chosen image with its type', async () => {
      const { getByText } = await renderWithImage();

      expect(getByText('avatar.jpg (20 Ko)')).toBeTruthy();
    });

    it('keeps the empty state when the picker is cancelled', async () => {
      mockLaunchPicker.mockResolvedValue(pickerResult(null));
      const { getByText } = render(<StorageDebugScreen />);

      fireEvent.press(getByText('Choisir une image'));

      await waitFor(() => {
        expect(mockLaunchPicker).toHaveBeenCalledTimes(1);
      });
      expect(getByText('Aucune image choisie.')).toBeTruthy();
    });

    it('reports a denied permission without opening the picker', async () => {
      mockRequestPermission.mockResolvedValue(denied);
      const { getByText, findByText } = render(<StorageDebugScreen />);

      fireEvent.press(getByText('Choisir une image'));

      expect(await findByText('Permission photos refusée')).toBeTruthy();
      expect(mockLaunchPicker).not.toHaveBeenCalled();
    });
  });

  describe('steps', () => {
    it('does not call the API before an image is chosen', () => {
      const { getByText } = render(<StorageDebugScreen />);

      fireEvent.press(getByText('Tout enchaîner'));
      fireEvent.press(getByText('1. URL présignée'));

      expect(mockGetUploadUrl).not.toHaveBeenCalled();
    });

    it('declares the image for the entity type selected with the chips', async () => {
      const { getByText } = render(<StorageDebugScreen />);

      fireEvent.press(getByText('Post'));
      fireEvent.press(getByText('Choisir une image'));
      await waitFor(() => {
        expect(getByText('Type : image/jpeg')).toBeTruthy();
      });
      fireEvent.press(getByText('1. URL présignée'));

      await waitFor(() => {
        expect(mockGetUploadUrl).toHaveBeenCalledWith({
          mimeType: 'image/jpeg',
          sizeBytes: 20_480,
          entityType: mockContracts.EntityType.ENTITY_TYPE_POST,
        });
      });
    });

    it('cannot send the file before a presigned url exists', async () => {
      const { getByText } = await renderWithImage();

      fireEvent.press(getByText('2. Envoyer vers S3'));

      expect(mockUploadToPresignedPost).not.toHaveBeenCalled();
    });

    it('shows the failure of a step in the journal', async () => {
      mockGetUploadUrl.mockRejectedValue(new Error('400 type non autorisé'));
      const { getByText, findByText } = await renderWithImage();

      fireEvent.press(getByText('1. URL présignée'));

      expect(await findByText('400 type non autorisé')).toBeTruthy();
    });
  });

  describe('whole flow', () => {
    it('chains the four steps for the chosen image and shows the clean result', async () => {
      const { getByText, findAllByText } = await renderWithImage();

      fireEvent.press(getByText('Tout enchaîner'));

      // visible dans la fiche du fichier et dans le journal
      expect(await findAllByText(/scan CLEAN/, {}, { timeout: 2000 })).toHaveLength(2);
      expect(mockUploadToPresignedPost).toHaveBeenCalledWith(createUploadUrlResponse(), {
        uri: pickedAsset.uri,
        name: 'avatar.jpg',
        type: 'image/jpeg',
      });
      expect(mockConfirmUpload).toHaveBeenCalledWith(FILE_ID);
      expect(mockGetFileMetadata).toHaveBeenCalledWith(FILE_ID);
    });

    it('reads enums sent by the gateway as names, not only as numbers', async () => {
      // La gateway serialise les enums en noms (loader gRPC `enums: String`), alors que
      // les types de contracts les declarent numeriques.
      const wireFile = Object.assign(createFileMetadataResponse().file, {
        scanStatus: 'SCAN_STATUS_CLEAN',
        validationMode: 'VALIDATION_MODE_SYNC',
      });
      mockConfirmUpload.mockResolvedValue({ file: wireFile });
      mockGetFileMetadata.mockResolvedValue({ file: wireFile });
      const { getByText, findAllByText } = await renderWithImage();

      fireEvent.press(getByText('Tout enchaîner'));

      // fiche du fichier + journal de la confirmation + journal des metadonnees
      expect(await findAllByText('scan CLEAN, mode SYNC, URL publique absente')).toHaveLength(3);
    });

    it('stops at the first failing step', async () => {
      mockUploadToPresignedPost.mockRejectedValue(new Error('403'));
      const { getByText, findByText } = await renderWithImage();

      fireEvent.press(getByText('Tout enchaîner'));

      expect(await findByText('403')).toBeTruthy();
      expect(mockConfirmUpload).not.toHaveBeenCalled();
      expect(mockGetFileMetadata).not.toHaveBeenCalled();
    });
  });
});
