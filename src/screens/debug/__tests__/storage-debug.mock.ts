import type { ImagePickerAsset, ImagePickerResult } from 'expo-image-picker';
import type * as ImagePicker from 'expo-image-picker';
import type { storageApi } from '@/api/storage/storage.api';
import type { uploadToPresignedPost } from '@/api/storage/storage-upload';

export const pickedAsset = {
  uri: 'file:///cache/ImagePicker/avatar.jpg',
  fileName: 'avatar.jpg',
  mimeType: 'image/jpeg',
  fileSize: 20_480,
  width: 256,
  height: 256,
} as ImagePickerAsset;

export const pickerResult = (assets: ImagePickerAsset[] | null): ImagePickerResult =>
  assets === null ? { canceled: true, assets: null } : { canceled: false, assets };

// Fonctions autonomes (et non des methodes d'objet) : elles se referencent dans les tests
// sans declencher la regle unbound-method.
export const mockGetUploadUrl = jest.fn<
  ReturnType<typeof storageApi.getUploadUrl>,
  Parameters<typeof storageApi.getUploadUrl>
>();
export const mockConfirmUpload = jest.fn<
  ReturnType<typeof storageApi.confirmUpload>,
  Parameters<typeof storageApi.confirmUpload>
>();
export const mockGetFileMetadata = jest.fn<
  ReturnType<typeof storageApi.getFileMetadata>,
  Parameters<typeof storageApi.getFileMetadata>
>();
export const mockUploadToPresignedPost = jest.fn<
  ReturnType<typeof uploadToPresignedPost>,
  Parameters<typeof uploadToPresignedPost>
>();
export const mockRequestPermission = jest.fn<
  ReturnType<typeof ImagePicker.requestMediaLibraryPermissionsAsync>,
  []
>();
export const mockLaunchPicker = jest.fn<
  ReturnType<typeof ImagePicker.launchImageLibraryAsync>,
  Parameters<typeof ImagePicker.launchImageLibraryAsync>
>();
