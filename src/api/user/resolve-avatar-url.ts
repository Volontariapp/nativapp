interface AvatarSource {
  avatarUrl?: string;
  /** Ancien champ, encore renvoyé par la gateway pour les comptes sans avatar téléversé. */
  logoPath?: string;
}

/** URL de l'avatar à afficher : la nouvelle (avatarUrl), sinon l'ancienne (logoPath). */
export const resolveAvatarUrl = ({ avatarUrl, logoPath }: AvatarSource): string | undefined =>
  avatarUrl !== undefined && avatarUrl !== '' ? avatarUrl : logoPath;
