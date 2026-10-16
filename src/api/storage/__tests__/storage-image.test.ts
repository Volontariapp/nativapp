import * as mockContracts from './contracts.mock';
import { prepareImageForUpload } from '../storage-image';

jest.mock('@volontariapp/contracts', () => mockContracts, { virtual: true });

const mockSaveAsync = jest.fn();
const mockRenderAsync = jest.fn();
const mockResize = jest.fn();
const mockManipulate = jest.fn<unknown, [string]>();

jest.mock('expo-image-manipulator', () => ({
  ImageManipulator: { manipulate: (uri: string) => mockManipulate(uri) },
  SaveFormat: { JPEG: 'jpeg', PNG: 'png', WEBP: 'webp' },
}));

const { EntityType } = mockContracts;
const photo = { uri: 'file:///gallery/IMG_0001.HEIC', width: 4000, height: 3000 };

describe('prepareImageForUpload', () => {
  beforeEach(() => {
    const context = { resize: mockResize, renderAsync: mockRenderAsync };
    mockManipulate.mockReturnValue(context);
    mockResize.mockReturnValue(context);
    mockRenderAsync.mockResolvedValue({ saveAsync: mockSaveAsync });
    mockSaveAsync.mockResolvedValue({ uri: 'file:///cache/resized.jpg', width: 1024, height: 768 });
    global.fetch = jest.fn().mockResolvedValue({ blob: () => Promise.resolve({ size: 150_000 }) });
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it.each([
    ['an avatar', EntityType.ENTITY_TYPE_USER_AVATAR, 1024],
    ['a badge', EntityType.ENTITY_TYPE_BADGE_ICON, 1024],
    ['a post', EntityType.ENTITY_TYPE_POST, 2048],
    ['an event cover', EntityType.ENTITY_TYPE_EVENT_COVER, 2048],
  ])('limits the longest side of %s to %i px', async (_label, entityType, maxSide) => {
    await prepareImageForUpload(photo, entityType);

    expect(mockResize).toHaveBeenCalledWith({ width: maxSide });
  });

  it('resizes by height when the picture is in portrait', async () => {
    await prepareImageForUpload(
      { uri: photo.uri, width: 3000, height: 4000 },
      EntityType.ENTITY_TYPE_USER_AVATAR,
    );

    expect(mockResize).toHaveBeenCalledWith({ height: 1024 });
  });

  it('does not enlarge a picture that is already small enough', async () => {
    await prepareImageForUpload(
      { uri: photo.uri, width: 800, height: 600 },
      EntityType.ENTITY_TYPE_USER_AVATAR,
    );

    expect(mockResize).not.toHaveBeenCalled();
  });

  it('re-encodes the picture as JPEG, whatever its source format', async () => {
    const prepared = await prepareImageForUpload(photo, EntityType.ENTITY_TYPE_USER_AVATAR);

    expect(mockSaveAsync).toHaveBeenCalledWith({ format: 'jpeg', compress: 0.8 });
    expect(prepared).toEqual({
      uri: 'file:///cache/resized.jpg',
      name: expect.stringMatching(/^upload-\d+\.jpg$/) as string,
      type: 'image/jpeg',
      sizeBytes: 150_000,
    });
  });

  it('reads the picture from the given uri', async () => {
    await prepareImageForUpload(photo, EntityType.ENTITY_TYPE_POST);

    expect(mockManipulate).toHaveBeenCalledWith(photo.uri);
  });
});
