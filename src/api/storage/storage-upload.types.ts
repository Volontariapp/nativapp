/** Fichier local tel que le comprend FormData en React Native. */
export interface UploadableFile {
  uri: string;
  name: string;
  type: string;
}

declare global {
  interface FormData {
    /**
     * React Native serialise {uri, name, type} en partie de fichier multipart
     * (avec son nom de fichier, requis par S3 pour distinguer le fichier d'un champ).
     */
    append(name: string, value: UploadableFile): void;
  }
}
