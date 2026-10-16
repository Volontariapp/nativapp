import * as ImagePicker from 'expo-image-picker';
import type { PickedImage } from './file-upload.types';
import { ensureGalleryPermission } from './gallery-permission';

interface PickGalleryImagesOptions {
  /** Nombre maximal d'images que l'utilisateur peut encore ajouter. */
  limit: number;
}

/**
 * Ouvre la galerie en sélection multiple et renvoie les images choisies, réduites à ce dont
 * l'upload a besoin. Renvoie une liste vide si plus aucune place n'est disponible, si la
 * permission est refusée (un message est affiché) ou si la sélection est annulée.
 */
export const pickGalleryImages = async ({
  limit,
}: PickGalleryImagesOptions): Promise<PickedImage[]> => {
  if (limit <= 0 || !(await ensureGalleryPermission())) {
    return [];
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsMultipleSelection: true,
    selectionLimit: limit,
    quality: 0.8,
  });

  if (result.canceled) {
    return [];
  }
  return result.assets
    .slice(0, limit)
    .map(({ uri, width, height }): PickedImage => ({ uri, width, height }));
};
