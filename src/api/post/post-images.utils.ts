import type { UploadState } from '@/api/storage/storage-status';
import type { PostImage, PostImageStatus } from './post-images.types';

export const MAX_POST_IMAGES = 10;

/** Un état inconnu ou en attente d'envoi n'est jamais pris pour un fichier utilisable. */
export const toPostImageStatus = (state: UploadState): PostImageStatus => {
  switch (state) {
    case 'CLEAN':
      return 'ready';
    case 'SCANNING':
      return 'processing';
    case 'REJECTED':
      return 'rejected';
    default:
      return 'failed';
  }
};

export const selectFileIds = (images: PostImage[]): string[] =>
  images.flatMap(({ status, fileId }) =>
    (status === 'ready' || status === 'processing') && fileId !== undefined ? [fileId] : [],
  );

export const isBlocking = ({ status }: PostImage): boolean =>
  status === 'rejected' || status === 'failed';
