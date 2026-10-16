import { Alert } from 'react-native';
import * as mockImagePicker from './expo-image-picker.mock';
import { createPickedImages } from './picked-image.factory';
import { pickGalleryImages } from '../pick-gallery-images';

jest.mock('expo-image-picker', () => mockImagePicker);

describe('pickGalleryImages', () => {
  beforeEach(() => {
    mockImagePicker.requestMediaLibraryPermissionsAsync.mockResolvedValue({
      status: mockImagePicker.PermissionStatus.GRANTED,
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.resetAllMocks();
  });

  it('returns the chosen images reduced to what the upload needs', async () => {
    const images = createPickedImages(2);
    mockImagePicker.launchImageLibraryAsync.mockResolvedValue({
      canceled: false,
      assets: images.map((image) => ({ ...image, fileName: 'a.heic', fileSize: 1234 })),
    });

    await expect(pickGalleryImages({ limit: 10 })).resolves.toEqual(images);
  });

  it('opens the gallery in multiple selection mode capped by the remaining slots', async () => {
    mockImagePicker.launchImageLibraryAsync.mockResolvedValue({ canceled: true, assets: null });

    await pickGalleryImages({ limit: 3 });

    expect(mockImagePicker.launchImageLibraryAsync).toHaveBeenCalledWith(
      expect.objectContaining({ allowsMultipleSelection: true, selectionLimit: 3 }),
    );
  });

  it('returns nothing when the selection is cancelled', async () => {
    mockImagePicker.launchImageLibraryAsync.mockResolvedValue({ canceled: true, assets: null });

    await expect(pickGalleryImages({ limit: 10 })).resolves.toEqual([]);
  });

  it('warns the user and returns nothing when the permission is denied', async () => {
    const alert = jest.spyOn(Alert, 'alert').mockImplementation(() => undefined);
    mockImagePicker.requestMediaLibraryPermissionsAsync.mockResolvedValue({
      status: mockImagePicker.PermissionStatus.DENIED,
    });

    await expect(pickGalleryImages({ limit: 10 })).resolves.toEqual([]);

    expect(alert).toHaveBeenCalledWith('Permission refusée', expect.any(String));
    expect(mockImagePicker.launchImageLibraryAsync).not.toHaveBeenCalled();
  });

  it('does not open the gallery when there is no slot left', async () => {
    await expect(pickGalleryImages({ limit: 0 })).resolves.toEqual([]);

    expect(mockImagePicker.requestMediaLibraryPermissionsAsync).not.toHaveBeenCalled();
    expect(mockImagePicker.launchImageLibraryAsync).not.toHaveBeenCalled();
  });
});
