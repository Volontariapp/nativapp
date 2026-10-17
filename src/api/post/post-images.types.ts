import type { EntityType } from '@volontariapp/contracts';
import type { PickedImage } from '@/api/storage/file-upload.types';

/**
 * uploading : envoi en cours ; ready : fichier propre ; processing : encore en analyse, le post
 * sera PENDING ; rejected : refusé par l'analyse ; failed : l'envoi n'a pas abouti.
 */
export type PostImageStatus = 'uploading' | 'ready' | 'processing' | 'rejected' | 'failed';

export interface PostImage {
  id: string;
  source: PickedImage;
  status: PostImageStatus;
  /** Renseigné quand l'envoi a abouti (ready, processing ou rejected). */
  fileId: string | undefined;
}

export interface UsePostImagesOptions {
  /** Nombre maximal d'images du post ; vaut MAX_POST_IMAGES par défaut. */
  maxImages?: number;
  /** Type d'entité des fichiers envoyés ; ENTITY_TYPE_POST par défaut (la photo d'un évènement passe EVENT_COVER). */
  entityType?: EntityType;
}

export interface PostImages {
  images: PostImage[];
  remainingSlots: number;
  isUploading: boolean;
  /** Une image refusée ou en échec empêche la publication tant qu'elle n'est pas retirée ou renvoyée. */
  hasBlockingImage: boolean;
  /** Identifiants à envoyer avec le post, dans l'ordre de sélection. */
  fileIds: string[];
  addImages: () => Promise<void>;
  retryImage: (id: string) => void;
  removeImage: (id: string) => void;
}
