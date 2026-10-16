import * as ImagePicker from 'expo-image-picker';
import type { PickedImage } from './file-upload.types';
import { ensureGalleryPermission } from './gallery-permission';

interface PickGalleryImageOptions {
  /** Recadrage imposé (ex. [1, 1] pour un avatar) ; sans valeur, l'image est prise telle quelle. */
  aspect?: [number, number];
}

/**
 * Ouvre la galerie et renvoie l'image choisie, réduite à ce dont l'upload a besoin.
 * Renvoie undefined si la permission est refusée (un message est affiché) ou si la sélection est annulée.
 */
export const pickGalleryImage = async ({ aspect }: PickGalleryImageOptions = {}): Promise<
  PickedImage | undefined
> => {
  if (!(await ensureGalleryPermission())) {
    return undefined;
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsEditing: aspect !== undefined,
    aspect,
    quality: 0.8,
  });

  const asset = result.canceled ? undefined : result.assets[0];
  return asset === undefined
    ? undefined
    : { uri: asset.uri, width: asset.width, height: asset.height };
};
