import { apiFetch } from '../client';
import { STORAGE_ENDPOINTS } from '../endpoints';
import type {
  GenerateUploadUrlRequest,
  GenerateUploadUrlWebResponse,
  ConfirmUploadWebResponse,
  FileMetadataWebResponse,
} from '@volontariapp/contracts';

const withFileId = (path: string, fileId: string): string => {
  const encoded = encodeURIComponent(fileId);
  return path.replace(':id', () => encoded);
};

export const storageApi = {
  getUploadUrl(request: GenerateUploadUrlRequest): Promise<GenerateUploadUrlWebResponse> {
    const { path, method, requiresAuth } = STORAGE_ENDPOINTS.GET_UPLOAD_URL;
    return apiFetch<GenerateUploadUrlWebResponse, GenerateUploadUrlRequest>(path, {
      method,
      requiresAuth,
      body: request,
    });
  },

  confirmUpload(fileId: string): Promise<ConfirmUploadWebResponse> {
    const { path, method, requiresAuth } = STORAGE_ENDPOINTS.CONFIRM_UPLOAD;
    return apiFetch<ConfirmUploadWebResponse>(withFileId(path, fileId), { method, requiresAuth });
  },

  getFileMetadata(fileId: string): Promise<FileMetadataWebResponse> {
    const { path, method, requiresAuth } = STORAGE_ENDPOINTS.GET_FILE_METADATA;
    return apiFetch<FileMetadataWebResponse>(withFileId(path, fileId), { method, requiresAuth });
  },
};
