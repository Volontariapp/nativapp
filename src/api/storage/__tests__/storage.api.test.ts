import * as mockContracts from './contracts.mock';
import { EntityType } from '@volontariapp/contracts';
import { apiFetch } from '../../client';
import { storageApi } from '../storage.api';
import {
  FILE_ID,
  createConfirmUploadResponse,
  createFileMetadataResponse,
  createUploadUrlResponse,
} from './storage.factory';

jest.mock('@volontariapp/contracts', () => mockContracts, { virtual: true });
jest.mock('../../client', () => ({ apiFetch: jest.fn() }));

const apiFetchMock = jest.mocked(apiFetch);

describe('storageApi', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('getUploadUrl', () => {
    it('declares the file on the gateway and returns the presigned upload', async () => {
      const response = createUploadUrlResponse();
      apiFetchMock.mockResolvedValue(response);
      const request = {
        mimeType: 'image/jpeg',
        sizeBytes: 2048,
        entityType: EntityType.ENTITY_TYPE_USER_AVATAR,
      };

      const result = await storageApi.getUploadUrl(request);

      expect(apiFetchMock).toHaveBeenCalledWith('/storage/upload-url', {
        method: 'POST',
        requiresAuth: true,
        body: request,
      });
      expect(result).toEqual(response);
    });
  });

  describe('confirmUpload', () => {
    it('confirms the upload of the given file and returns its state', async () => {
      const response = createConfirmUploadResponse();
      apiFetchMock.mockResolvedValue(response);

      const result = await storageApi.confirmUpload(FILE_ID);

      expect(apiFetchMock).toHaveBeenCalledWith(`/storage/files/${FILE_ID}/confirm`, {
        method: 'POST',
        requiresAuth: true,
      });
      expect(result).toEqual(response);
    });

    it('encodes the file id so it cannot alter the route', async () => {
      apiFetchMock.mockResolvedValue(createConfirmUploadResponse());

      await storageApi.confirmUpload('../../users/me');

      expect(apiFetchMock).toHaveBeenCalledWith(
        '/storage/files/..%2F..%2Fusers%2Fme/confirm',
        expect.objectContaining({ method: 'POST' }),
      );
    });
  });

  describe('getFileMetadata', () => {
    it('reads the metadata of the given file', async () => {
      const response = createFileMetadataResponse();
      apiFetchMock.mockResolvedValue(response);

      const result = await storageApi.getFileMetadata(FILE_ID);

      expect(apiFetchMock).toHaveBeenCalledWith(`/storage/files/${FILE_ID}`, {
        method: 'GET',
        requiresAuth: true,
      });
      expect(result).toEqual(response);
    });
  });

  it('lets API errors reach the caller', async () => {
    const error = new Error('404');
    apiFetchMock.mockRejectedValue(error);

    await expect(storageApi.getFileMetadata(FILE_ID)).rejects.toBe(error);
  });
});
