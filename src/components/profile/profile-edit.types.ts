/** Données envoyées par la modale d'édition du profil. avatarFileId n'est présent que si une photo CLEAN a été choisie. */
export interface ProfileSubmitData {
  pseudo: string;
  bio?: string | undefined;
  phone?: string | undefined;
  avatarFileId?: string | undefined;
}
