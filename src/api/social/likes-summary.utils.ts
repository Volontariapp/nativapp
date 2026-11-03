/** Plafond d'ids par appel (MAX_LIKE_SUMMARY_POST_IDS cote gateway, 1 a 100, sans doublon). */
export const LIKES_SUMMARY_MAX_IDS = 100;

/** Retire les doublons en gardant l'ordre de premiere apparition. */
export const uniquePostIds = (postIds: readonly string[]): string[] => [...new Set(postIds)];

/** Decoupe en lots de 100 ids uniques maximum, dans l'ordre. Aucun lot si la liste est vide. */
export const chunkPostIds = (postIds: readonly string[]): string[][] => {
  const unique = uniquePostIds(postIds);
  const chunks: string[][] = [];
  for (let start = 0; start < unique.length; start += LIKES_SUMMARY_MAX_IDS) {
    chunks.push(unique.slice(start, start + LIKES_SUMMARY_MAX_IDS));
  }
  return chunks;
};
