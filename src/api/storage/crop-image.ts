import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import type { CropRect } from '@/components/event/event-cover-crop';
import type { PickedImage } from './file-upload.types';

const CROP_JPEG_QUALITY = 0.9;

/**
 * Recadre une image et l'enregistre en JPEG. L'envoi qui suit la redimensionne et la ré-encode
 * une dernière fois (`prepareImageForUpload`).
 */
export const cropImage = async (image: PickedImage, rect: CropRect): Promise<PickedImage> => {
  const rendered = await ImageManipulator.manipulate(image.uri).crop(rect).renderAsync();
  const saved = await rendered.saveAsync({ format: SaveFormat.JPEG, compress: CROP_JPEG_QUALITY });
  return { uri: saved.uri, width: saved.width, height: saved.height };
};
