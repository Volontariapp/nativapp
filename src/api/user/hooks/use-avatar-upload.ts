import { EntityType } from '@volontariapp/contracts';
import { useFileUpload } from '@/api/storage/hooks/use-file-upload';
import { pickGalleryImage } from '@/api/storage/pick-gallery-image';
import type { UploadState } from '@/api/storage/storage-status';

const AVATAR_ASPECT: [number, number] = [1, 1];

export const AVATAR_UPLOAD_MESSAGES = {
  failed: "L'envoi de la photo a échoué. Réessaie.",
  unavailable: 'Le stockage des photos est indisponible pour le moment. Réessaie plus tard.',
  rejected: 'Cette photo a été refusée. Choisis-en une autre.',
  notVerified: "La vérification de la photo n'a pas abouti. Réessaie.",
} as const;

/** 503 : ms-storage indisponible, après les réessais automatiques de l'upload. */
const isUnavailable = (error: Error): boolean => 'code' in error && error.code === '503';

const describeFailure = (
  error: Error | null,
  state: UploadState | undefined,
): string | undefined => {
  if (error !== null) {
    return isUnavailable(error)
      ? AVATAR_UPLOAD_MESSAGES.unavailable
      : AVATAR_UPLOAD_MESSAGES.failed;
  }
  if (state === undefined || state === 'CLEAN') return undefined;
  return state === 'REJECTED'
    ? AVATAR_UPLOAD_MESSAGES.rejected
    : AVATAR_UPLOAD_MESSAGES.notVerified;
};

export interface AvatarUpload {
  isUploading: boolean;
  /** Renseigné seulement quand la photo est CLEAN : c'est la seule qui peut être rattachée au profil. */
  avatarFileId: string | undefined;
  /** URL publique de la nouvelle photo, quand elle est CLEAN. */
  previewUri: string | undefined;
  message: string | undefined;
  canRetry: boolean;
  choosePhoto: () => Promise<void>;
  retry: () => void;
  reset: () => void;
}

/** Choix de la photo, envoi et état affichable pour l'avatar du profil. */
export const useAvatarUpload = (): AvatarUpload => {
  const upload = useFileUpload(EntityType.ENTITY_TYPE_USER_AVATAR);
  const result = upload.data;
  const isClean = result?.state === 'CLEAN';

  const choosePhoto = async (): Promise<void> => {
    const image = await pickGalleryImage({ aspect: AVATAR_ASPECT });
    if (image !== undefined) {
      upload.mutate(image);
    }
  };

  const retry = (): void => {
    if (upload.variables !== undefined) {
      upload.mutate(upload.variables);
    }
  };

  return {
    isUploading: upload.isPending,
    avatarFileId: isClean ? result.fileId : undefined,
    previewUri: isClean ? result.publicUrl : undefined,
    message: describeFailure(upload.error, result?.state),
    canRetry:
      upload.error !== null || (result !== undefined && !isClean && result.state !== 'REJECTED'),
    choosePhoto,
    retry,
    reset: upload.reset,
  };
};
