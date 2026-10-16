import type * as ImagePicker from 'expo-image-picker';
import type { uploadImage } from '@/api/storage/upload-image';

export { pickedAsset, pickerResult } from '@/screens/debug/__tests__/storage-debug.mock';

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
