import type { PostWeb } from '@volontariapp/contracts';

/**
 * URL de l'image d'un post, ou undefined tant qu'il n'y en a pas : la gateway n'expose
 * `media[].url` que lorsque le post est READY. Un post n'a qu'une image ; en cas de plusieurs,
 * la première par position gagne.
 */
export const resolvePostImageUrl = (post: Pick<PostWeb, 'media'>): string | undefined =>
  [...(post.media ?? [])]
    .sort((a, b) => a.position - b.position)
    .find((media) => media.url !== undefined && media.url !== '')?.url;
