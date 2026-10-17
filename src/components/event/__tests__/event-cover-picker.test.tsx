import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import { createPostImage } from '@/api/post/__tests__/post-images.factory';
import { EventCoverPicker } from '../event-cover-picker';

jest.mock('expo-image', () => ({ Image: 'Image' }));

const mockOnAdd = jest.fn();
const mockOnRetry = jest.fn();
const mockOnRemove = jest.fn();

const renderPicker = (cover: Parameters<typeof EventCoverPicker>[0]['cover']) =>
  render(
    <EventCoverPicker
      cover={cover}
      onAdd={mockOnAdd}
      onRetry={mockOnRetry}
      onRemove={mockOnRemove}
    />,
  );

describe('EventCoverPicker', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it('offers to add a photo when none is picked', () => {
    const { getByLabelText } = renderPicker(undefined);

    fireEvent.press(getByLabelText('Ajouter une photo'));

    expect(mockOnAdd).toHaveBeenCalledTimes(1);
  });

  it('shows the chosen photo and lets the user remove it', () => {
    const cover = createPostImage({ id: 'cover-1', status: 'ready' });
    const { getByLabelText, queryByText } = renderPicker(cover);

    fireEvent.press(getByLabelText('Retirer la photo'));

    expect(mockOnRemove).toHaveBeenCalledWith('cover-1');
    expect(queryByText('Envoi...')).toBeNull();
  });

  it('shows the upload and analysis states', () => {
    expect(
      renderPicker(createPostImage({ status: 'uploading' })).getByText('Envoi...'),
    ).toBeTruthy();
    expect(
      renderPicker(createPostImage({ status: 'processing' })).getByText('Analyse en cours'),
    ).toBeTruthy();
  });

  it('flags a rejected photo without a retry', () => {
    const { getByText, queryByLabelText } = renderPicker(createPostImage({ status: 'rejected' }));

    expect(getByText('Photo refusée')).toBeTruthy();
    expect(queryByLabelText('Renvoyer la photo')).toBeNull();
  });

  it('lets the user retry a failed upload', () => {
    const { getByLabelText } = renderPicker(createPostImage({ id: 'cover-2', status: 'failed' }));

    fireEvent.press(getByLabelText('Renvoyer la photo'));

    expect(mockOnRetry).toHaveBeenCalledWith('cover-2');
  });
});
