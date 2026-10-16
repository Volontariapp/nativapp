import { useMutation } from '@tanstack/react-query';
import type { EntityType } from '@volontariapp/contracts';
import type { FileUploadResult, PickedImage } from '../file-upload.types';
import { uploadImage } from '../upload-image';

/**
 * Envoie une image de la galerie pour un type d'entité : redimensionnement, URL présignée,
 * envoi, confirmation. Le résultat porte l'identifiant du fichier, son état (CLEAN, SCANNING,
 * REJECTED...) et l'URL publique quand il est propre.
 */
export const useFileUpload = (entityType: EntityType) =>
  useMutation<FileUploadResult, Error, PickedImage>({
    mutationFn: (image) => uploadImage(entityType, image),
  });
