import { useCallback, useRef, useState } from 'react';
import { EntityType } from '@volontariapp/contracts';
import { useFileUpload } from '@/api/storage/hooks/use-file-upload';
import { pickGalleryImages } from '@/api/storage/pick-gallery-images';
import type { PickedImage } from '@/api/storage/file-upload.types';
import type { PostImage, PostImages, UsePostImagesOptions } from '../post-images.types';
import {
  MAX_POST_IMAGES,
  isBlocking,
  selectFileIds,
  toPostImageStatus,
} from '../post-images.utils';

export { MAX_POST_IMAGES } from '../post-images.utils';

/**
 * Fait passer chaque image par l'étape d'ajustement, l'une après l'autre ; une annulation l'écarte.
 * Les ajustements ne sont pas indépendants : ils partagent une seule fenêtre de cadrage, qui ne
 * peut montrer qu'une image à la fois.
 */
const adjustEach = (
  images: PickedImage[],
  adjust: (image: PickedImage) => Promise<PickedImage | undefined>,
): Promise<PickedImage[]> =>
  images.reduce<Promise<PickedImage[]>>(
    (previous, image) =>
      previous.then(async (adjusted) => {
        const result = await adjust(image);
        return result === undefined ? adjusted : [...adjusted, result];
      }),
    Promise.resolve([]),
  );

/** Choix des images d'un post et envoi de chacune, avec un état par image. */
export const usePostImages = ({
  maxImages = MAX_POST_IMAGES,
  entityType = EntityType.ENTITY_TYPE_POST,
  adjustImage,
}: UsePostImagesOptions = {}): PostImages => {
  const { mutateAsync: uploadFile } = useFileUpload(entityType);
  const [images, setImages] = useState<PostImage[]>([]);
  const nextId = useRef(0);

  const patchImage = useCallback((id: string, patch: Partial<PostImage>): void => {
    setImages((current) =>
      current.map((image) => (image.id === id ? { ...image, ...patch } : image)),
    );
  }, []);

  const startUpload = useCallback(
    async (id: string, source: PickedImage): Promise<void> => {
      patchImage(id, { status: 'uploading', fileId: undefined });
      try {
        const result = await uploadFile(source);
        patchImage(id, { status: toPostImageStatus(result.state), fileId: result.fileId });
      } catch {
        patchImage(id, { status: 'failed', fileId: undefined });
      }
    },
    [patchImage, uploadFile],
  );

  const remainingSlots = maxImages - images.length;

  const addImages = useCallback(async (): Promise<void> => {
    const pickedFromGallery = await pickGalleryImages({ limit: remainingSlots });
    const picked =
      adjustImage === undefined
        ? pickedFromGallery
        : await adjustEach(pickedFromGallery, adjustImage);
    const added = picked.slice(0, remainingSlots).map((source): PostImage => {
      nextId.current += 1;
      return {
        id: `post-image-${String(nextId.current)}`,
        source,
        status: 'uploading',
        fileId: undefined,
      };
    });
    setImages((current) => [...current, ...added]);
    await Promise.all(added.map((image) => startUpload(image.id, image.source)));
  }, [adjustImage, remainingSlots, startUpload]);

  const retryImage = useCallback(
    (id: string): void => {
      const image = images.find((candidate) => candidate.id === id);
      if (image !== undefined && isBlocking(image)) {
        void startUpload(id, image.source);
      }
    },
    [images, startUpload],
  );

  const removeImage = useCallback((id: string): void => {
    setImages((current) => current.filter((image) => image.id !== id));
  }, []);

  return {
    images,
    remainingSlots,
    isUploading: images.some(({ status }) => status === 'uploading'),
    hasBlockingImage: images.some(isBlocking),
    fileIds: selectFileIds(images),
    addImages,
    retryImage,
    removeImage,
  };
};
