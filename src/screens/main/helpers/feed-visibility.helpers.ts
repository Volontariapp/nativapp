interface FeedPostIdentity {
  id: string;
  authorId: string;
}

/** Retire les posts de l'utilisateur et ceux qu'il a deja likes ou commentes. */
export const withoutHandledPosts = <T extends FeedPostIdentity>(
  posts: readonly T[],
  handledIds: ReadonlySet<string>,
  userId: string | null,
): T[] => posts.filter((post) => post.authorId !== userId && !handledIds.has(post.id));

/** Met en tete les posts jamais affiches, sans changer l'ordre a l'interieur de chaque groupe. */
export const unseenFirst = <T extends { id: string }>(
  posts: readonly T[],
  seenIds: ReadonlySet<string>,
): T[] => {
  const unseen = posts.filter((post) => !seenIds.has(post.id));
  const seen = posts.filter((post) => seenIds.has(post.id));
  return [...unseen, ...seen];
};

/**
 * Applique un ordre fige : les posts connus suivent `orderedIds`, ceux charges ensuite gardent leur
 * ordre apres eux. L'ordre ne bouge donc plus quand une page s'ajoute.
 */
export const applyPinnedOrder = <T extends { id: string }>(
  posts: readonly T[],
  orderedIds: readonly string[],
): T[] => {
  if (orderedIds.length === 0) return [...posts];
  const byId = new Map(posts.map((post) => [post.id, post]));
  const pinned = orderedIds.flatMap((id) => {
    const post = byId.get(id);
    return post ? [post] : [];
  });
  const pinnedIds = new Set(pinned.map((post) => post.id));
  return [...pinned, ...posts.filter((post) => !pinnedIds.has(post.id))];
};
