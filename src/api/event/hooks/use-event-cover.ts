import { EntityType } from '@volontariapp/contracts';
import { usePostImages } from '@/api/post/hooks/use-post-images';
import type { PostImage, PostImages } from '@/api/post/post-images.types';

export interface EventCoverState extends Omit<PostImages, 'images' | 'fileIds'> {
  /** Photo choisie, ou undefined tant qu'aucune n'a été sélectionnée. */
  cover: PostImage | undefined;
  /** Identifiant à envoyer avec l'évènement ; absent si la photo est refusée, en échec ou retirée. */
  coverFileId: string | undefined;
}

/** Photo de couverture d'un évènement : une seule image, envoyée comme EVENT_COVER. */
export const useEventCover = (): EventCoverState => {
  const { images, fileIds, ...rest } = usePostImages({
    entityType: EntityType.ENTITY_TYPE_EVENT_COVER,
    maxImages: 1,
  });
  return { ...rest, cover: images[0], coverFileId: fileIds[0] };
};
