import { UserRoles } from '@volontariapp/shared';
import type { EndpointDefinition } from '../types';
import type {
  GenerateUploadUrlRequest,
  GenerateUploadUrlWebResponse,
  ConfirmUploadWebResponse,
  FileMetadataWebResponse,
} from '@volontariapp/contracts';

const STORAGE_ROLES = [UserRoles.ORGANIZATION, UserRoles.VOLUNTEER, UserRoles.ADMIN];

export const STORAGE_ENDPOINTS = {
  GET_UPLOAD_URL: {
    path: '/storage/upload-url',
    method: 'POST',
    requiresAuth: true,
    roles: STORAGE_ROLES,
  } as EndpointDefinition<GenerateUploadUrlRequest, GenerateUploadUrlWebResponse>,
  CONFIRM_UPLOAD: {
    path: '/storage/files/:id/confirm',
    method: 'POST',
    requiresAuth: true,
    roles: STORAGE_ROLES,
  } as EndpointDefinition<void, ConfirmUploadWebResponse>,
  GET_FILE_METADATA: {
    path: '/storage/files/:id',
    method: 'GET',
    requiresAuth: true,
    roles: STORAGE_ROLES,
  } as EndpointDefinition<void, FileMetadataWebResponse>,
};
