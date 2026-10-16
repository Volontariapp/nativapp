import React from 'react';
import { Pressable, Text } from 'react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render } from '@testing-library/react-native';
import * as mockContracts from './contracts.mock';
import * as mockErrors from './errors.mock';
import { FILE_ID } from './storage.factory';
import { useFileUpload } from '../hooks/use-file-upload';

jest.mock('@volontariapp/contracts', () => mockContracts, { virtual: true });
jest.mock('@volontariapp/errors', () => mockErrors, { virtual: true });

const mockUploadImage = jest.fn();
jest.mock('../upload-image', () => ({
  uploadImage: (...args: unknown[]) => mockUploadImage(...args) as unknown,
}));

const { EntityType } = mockContracts;
const image = { uri: 'file:///gallery/IMG_0001.HEIC', width: 4000, height: 3000 };

function Harness(): React.JSX.Element {
  const upload = useFileUpload(EntityType.ENTITY_TYPE_USER_AVATAR);
  return (
    <>
      <Pressable
        onPress={() => {
          upload.mutate(image);
        }}
      >
        <Text>Envoyer</Text>
      </Pressable>
      {upload.isPending && <Text>En cours</Text>}
      {upload.data !== undefined && (
        <Text>{`${upload.data.fileId} ${upload.data.state} ${upload.data.publicUrl ?? '-'}`}</Text>
      )}
      {upload.error !== null && <Text>{`Erreur : ${upload.error.message}`}</Text>}
    </>
  );
}

const renderHarness = () =>
  render(
    <QueryClientProvider
      client={new QueryClient({ defaultOptions: { mutations: { retry: false } } })}
    >
      <Harness />
    </QueryClientProvider>,
  );

describe('useFileUpload', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it('uploads the picked image for its entity type and exposes the result', async () => {
    mockUploadImage.mockResolvedValue({
      fileId: FILE_ID,
      state: 'CLEAN',
      publicUrl: 'https://cdn/x.webp',
    });
    const { getByText, findByText } = renderHarness();

    fireEvent.press(getByText('Envoyer'));

    expect(await findByText(`${FILE_ID} CLEAN https://cdn/x.webp`)).toBeTruthy();
    expect(mockUploadImage).toHaveBeenCalledWith(EntityType.ENTITY_TYPE_USER_AVATAR, image);
  });

  it('exposes the error of a failed upload', async () => {
    mockUploadImage.mockRejectedValue(new Error('Fichier rejeté'));
    const { getByText, findByText } = renderHarness();

    fireEvent.press(getByText('Envoyer'));

    expect(await findByText('Erreur : Fichier rejeté')).toBeTruthy();
  });
});
