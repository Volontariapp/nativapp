import * as mockContracts from './contracts.mock';
import * as mockErrors from './errors.mock';
import { mockConfirmUpload, mockGetUploadUrl, mockUploadToPresignedPost } from './storage-api.mock';
import {
  FILE_ID,
  createConfirmUploadResponse,
  createFileMetadata,
  createUploadUrlResponse,
} from './storage.factory';
import { uploadImage } from '../upload-image';

jest.mock('@volontariapp/contracts', () => mockContracts, { virtual: true });
jest.mock('@volontariapp/errors', () => mockErrors, { virtual: true });
jest.mock('../storage.api', () => ({
  storageApi: { getUploadUrl: mockGetUploadUrl, confirmUpload: mockConfirmUpload },
}));
jest.mock('../storage-upload', () => ({ uploadToPresignedPost: mockUploadToPresignedPost }));

const mockPrepare = jest.fn();
jest.mock('../storage-image', () => ({
  prepareImageForUpload: (...args: unknown[]) => mockPrepare(...args) as unknown,
}));

const { EntityType, ScanStatus } = mockContracts;
const image = { uri: 'file:///gallery/IMG_0001.HEIC', width: 4000, height: 3000 };
const prepared = {
  uri: 'file:///cache/resized.jpg',
  name: 'upload-1.jpg',
  type: 'image/jpeg',
  sizeBytes: 150_000,
};
const noWait = { retryDelayMs: 0 };

const unavailable = () => new mockErrors.InternalServerError('Service indisponible', '503');

describe('uploadImage', () => {
  beforeEach(() => {
    mockPrepare.mockResolvedValue(prepared);
    mockGetUploadUrl.mockResolvedValue(createUploadUrlResponse());
    mockUploadToPresignedPost.mockResolvedValue(undefined);
    mockConfirmUpload.mockResolvedValue({
      file: createFileMetadata({
        scanStatus: ScanStatus.SCAN_STATUS_CLEAN,
        publicUrl: 'https://s3.cyrus-ag.com/volontariapp-public/user-avatar/x.webp',
      }),
    });
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('prepares, declares, sends and confirms the picture, then reports it clean', async () => {
    const result = await uploadImage(EntityType.ENTITY_TYPE_USER_AVATAR, image, noWait);

    expect(mockPrepare).toHaveBeenCalledWith(image, EntityType.ENTITY_TYPE_USER_AVATAR);
    expect(mockGetUploadUrl).toHaveBeenCalledWith({
      mimeType: 'image/jpeg',
      sizeBytes: 150_000,
      entityType: EntityType.ENTITY_TYPE_USER_AVATAR,
    });
    expect(mockUploadToPresignedPost).toHaveBeenCalledWith(createUploadUrlResponse(), {
      uri: prepared.uri,
      name: prepared.name,
      type: 'image/jpeg',
    });
    expect(mockConfirmUpload).toHaveBeenCalledWith(FILE_ID);
    expect(result).toEqual({
      fileId: FILE_ID,
      state: 'CLEAN',
      publicUrl: 'https://s3.cyrus-ag.com/volontariapp-public/user-avatar/x.webp',
    });
  });

  it('reports a file still being scanned without a public url', async () => {
    mockConfirmUpload.mockResolvedValue(createConfirmUploadResponse());

    const result = await uploadImage(EntityType.ENTITY_TYPE_POST, image, noWait);

    expect(result).toEqual({ fileId: FILE_ID, state: 'SCANNING', publicUrl: undefined });
  });

  describe('when the storage is unavailable (503)', () => {
    it('restarts from scratch and succeeds on the next attempt', async () => {
      mockConfirmUpload.mockRejectedValueOnce(unavailable());

      const result = await uploadImage(EntityType.ENTITY_TYPE_USER_AVATAR, image, noWait);

      expect(result.state).toBe('CLEAN');
      expect(mockGetUploadUrl).toHaveBeenCalledTimes(2);
      expect(mockUploadToPresignedPost).toHaveBeenCalledTimes(2);
      expect(mockConfirmUpload).toHaveBeenCalledTimes(2);
    });

    it('resizes the picture only once', async () => {
      mockConfirmUpload.mockRejectedValueOnce(unavailable());

      await uploadImage(EntityType.ENTITY_TYPE_USER_AVATAR, image, noWait);

      expect(mockPrepare).toHaveBeenCalledTimes(1);
    });

    it('gives up after three attempts and reports the error', async () => {
      mockConfirmUpload.mockRejectedValue(unavailable());

      await expect(
        uploadImage(EntityType.ENTITY_TYPE_USER_AVATAR, image, noWait),
      ).rejects.toMatchObject({ code: '503' });
      expect(mockConfirmUpload).toHaveBeenCalledTimes(3);
    });
  });

  describe('when another error occurs', () => {
    it.each([
      [
        'a refused declaration (400)',
        () => mockGetUploadUrl.mockRejectedValue(new mockErrors.BadRequestError('type', '400')),
      ],
      [
        'a rejected file (422)',
        () =>
          mockConfirmUpload.mockRejectedValue(
            new mockErrors.UnprocessableEntityError('rejet', '422'),
          ),
      ],
      [
        'a network failure',
        () =>
          mockUploadToPresignedPost.mockRejectedValue(
            new mockErrors.InternalServerError('reseau', 'NETWORK_ERROR'),
          ),
      ],
    ])('does not retry %s', async (_label, arrange) => {
      arrange();

      await expect(
        uploadImage(EntityType.ENTITY_TYPE_USER_AVATAR, image, noWait),
      ).rejects.toBeInstanceOf(Error);
      expect(mockGetUploadUrl).toHaveBeenCalledTimes(1);
    });
  });
});
