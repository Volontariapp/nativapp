import type { ImagePickerAsset, ImagePickerResult } from 'expo-image-picker';
import type * as ImagePicker from 'expo-image-picker';
import type { uploadImage } from '@/api/storage/upload-image';

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

export {
  mockConfirmUpload,
  mockGetFileMetadata,
  mockGetUploadUrl,
  mockUploadToPresignedPost,
} from '@/api/storage/__tests__/storage-api.mock';

export const mockUploadImage = jest.fn<
  ReturnType<typeof uploadImage>,
  Parameters<typeof uploadImage>
>();

export const mockRequestPermission = jest.fn<
  ReturnType<typeof ImagePicker.requestMediaLibraryPermissionsAsync>,
  []
>();
export const mockLaunchPicker = jest.fn<
  ReturnType<typeof ImagePicker.launchImageLibraryAsync>,
  Parameters<typeof ImagePicker.launchImageLibraryAsync>
>();
