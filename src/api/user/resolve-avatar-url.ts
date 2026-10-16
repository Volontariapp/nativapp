interface AvatarSource {
  avatarUrl?: string;
  /** Ancien champ, encore renvoyé par la gateway pour les comptes sans avatar téléversé. */
  logoPath?: string;
}

/** URL de l'avatar à afficher : la nouvelle (avatarUrl), sinon l'ancienne (logoPath). */
export const resolveAvatarUrl = (source?: AvatarSource | null): string | undefined => {
  if (source === undefined || source === null) return undefined;
  const { avatarUrl, logoPath } = source;
  return avatarUrl !== undefined && avatarUrl !== '' ? avatarUrl : logoPath;
};
