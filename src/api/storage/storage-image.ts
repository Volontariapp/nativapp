import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import { EntityType } from '@volontariapp/contracts';
import type { PickedImage, PreparedImage } from './file-upload.types';

const JPEG_QUALITY = 0.8;
const MAX_SIDE_AVATAR_PX = 1024;
const MAX_SIDE_DEFAULT_PX = 2048;

/** Côté le plus long autorisé (doc 02, section 3) : 1024 px avatar et badge, 2048 px sinon. */
const maxSideFor = (entityType: EntityType): number =>
  entityType === EntityType.ENTITY_TYPE_USER_AVATAR ||
  entityType === EntityType.ENTITY_TYPE_BADGE_ICON
    ? MAX_SIDE_AVATAR_PX
    : MAX_SIDE_DEFAULT_PX;

/**
 * Redimensionne (sans jamais agrandir) puis ré-encode en JPEG : les photos de galerie,
 * HEIC sur iOS compris, passent ainsi sous le seuil de traitement synchrone.
 */
export const prepareImageForUpload = async (
  image: PickedImage,
  entityType: EntityType,
): Promise<PreparedImage> => {
  const maxSide = maxSideFor(entityType);
  const context = ImageManipulator.manipulate(image.uri);
  if (Math.max(image.width, image.height) > maxSide) {
    context.resize(image.width >= image.height ? { width: maxSide } : { height: maxSide });
  }
  const rendered = await context.renderAsync();
  const saved = await rendered.saveAsync({ format: SaveFormat.JPEG, compress: JPEG_QUALITY });
  const savedResponse = await fetch(saved.uri);
  if (savedResponse.status >= 400) {
    throw new Error(`Lecture de l'image préparée impossible (${String(savedResponse.status)})`);
  }
  const sizeBytes = (await savedResponse.blob()).size;

  return {
    uri: saved.uri,
    name: `upload-${String(Date.now())}.jpg`,
    type: 'image/jpeg',
    sizeBytes,
  };
};
