/**
 * Espaces de cles React Query pour les profils.
 * Deux racines distinctes pour qu'une invalidation par prefixe du profil
 * de l'utilisateur connecte ne rafraichisse pas les profils publics.
 */
export const PROFILE_QUERY_KEY = ['profile', 'me'] as const;

export const PUBLIC_PROFILE_QUERY_KEY = ['public-profile'] as const;

export const publicProfileQueryKey = (userId?: string) =>
  [...PUBLIC_PROFILE_QUERY_KEY, userId] as const;

/**
 * Progression de l'utilisateur connecte vers chaque badge. Racine distincte du profil : elle change
 * a chaque like, voeu ou evenement termine, bien avant qu'un badge soit debloque.
 */
export const BADGE_PROGRESS_QUERY_KEY = ['badge-progress', 'me'] as const;
