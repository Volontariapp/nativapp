import type { UploadState } from './storage-status';

/** Image choisie dans la galerie (ImagePickerAsset réduit à ce dont l'upload a besoin). */
export interface PickedImage {
  uri: string;
  width: number;
  height: number;
}

/** Image redimensionnée et ré-encodée en JPEG, prête à être envoyée. */
export interface PreparedImage {
  uri: string;
  name: string;
  type: string;
  sizeBytes: number;
}

export interface FileUploadResult {
  fileId: string;
  state: UploadState;
  /** Renseignée seulement quand le fichier est CLEAN. */
  publicUrl: string | undefined;
}
