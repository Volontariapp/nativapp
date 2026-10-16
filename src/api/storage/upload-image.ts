import type { EntityType } from '@volontariapp/contracts';
import type { FileUploadResult, PickedImage, PreparedImage } from './file-upload.types';
import { storageApi } from './storage.api';
import { prepareImageForUpload } from './storage-image';
import { toUploadState } from './storage-status';
import { uploadToPresignedPost } from './storage-upload';

const DEFAULT_MAX_ATTEMPTS = 3;
const DEFAULT_RETRY_DELAY_MS = 1000;

export interface UploadImageOptions {
  maxAttempts?: number;
  retryDelayMs?: number;
}

/** 503 : ms-storage indisponible pendant le traitement synchrone d'un avatar ou d'un badge. */
const isUnavailable = (error: unknown): boolean =>
  error instanceof Error && 'code' in error && error.code === '503';

const wait = (ms: number): Promise<void> =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

const uploadOnce = async (
  entityType: EntityType,
  prepared: PreparedImage,
): Promise<FileUploadResult> => {
  const upload = await storageApi.getUploadUrl({
    mimeType: prepared.type,
    sizeBytes: prepared.sizeBytes,
    entityType,
  });
  await uploadToPresignedPost(upload, {
    uri: prepared.uri,
    name: prepared.name,
    type: prepared.type,
  });
  const { file } = await storageApi.confirmUpload(upload.fileId);

  return {
    fileId: upload.fileId,
    state: toUploadState(file.scanStatus),
    publicUrl: file.publicUrl,
  };
};

/**
 * Redimensionne l'image, puis enchaîne URL présignée, envoi et confirmation.
 * Sur un 503 le réessai repart de zéro (nouvelle URL), comme le prévoit la doc 03 ;
 * l'image n'est redimensionnée qu'une fois. Les autres erreurs ne sont pas rejouées.
 */
export const uploadImage = async (
  entityType: EntityType,
  image: PickedImage,
  options: UploadImageOptions = {},
): Promise<FileUploadResult> => {
  const maxAttempts = options.maxAttempts ?? DEFAULT_MAX_ATTEMPTS;
  const retryDelayMs = options.retryDelayMs ?? DEFAULT_RETRY_DELAY_MS;
  const prepared = await prepareImageForUpload(image, entityType);

  for (let attempt = 1; ; attempt += 1) {
    try {
      return await uploadOnce(entityType, prepared);
    } catch (error) {
      if (!isUnavailable(error) || attempt >= maxAttempts) {
        throw error;
      }
      await wait(retryDelayMs * attempt);
    }
  }
};
