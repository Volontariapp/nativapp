import type { storageApi } from '../storage.api';
import type { uploadToPresignedPost } from '../storage-upload';

// Fonctions autonomes (et non des methodes d'objet) : elles se referencent dans les tests
// sans declencher la regle unbound-method.
export const mockGetUploadUrl = jest.fn<
  ReturnType<typeof storageApi.getUploadUrl>,
  Parameters<typeof storageApi.getUploadUrl>
>();
export const mockConfirmUpload = jest.fn<
  ReturnType<typeof storageApi.confirmUpload>,
  Parameters<typeof storageApi.confirmUpload>
>();
export const mockGetFileMetadata = jest.fn<
  ReturnType<typeof storageApi.getFileMetadata>,
  Parameters<typeof storageApi.getFileMetadata>
>();
export const mockUploadToPresignedPost = jest.fn<
  ReturnType<typeof uploadToPresignedPost>,
  Parameters<typeof uploadToPresignedPost>
>();
