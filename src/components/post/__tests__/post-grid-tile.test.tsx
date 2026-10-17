import React from 'react';
import { StyleSheet } from 'react-native';
import { fireEvent, render } from '@testing-library/react-native';
import { createPostMediaWeb, createPostWeb } from '@/api/post/__tests__/post-web.factory';
import { getFakeEcologyImage } from '@/utils/fake-images.util';
import { PostGridTile } from '../post-grid-tile';

jest.mock('expo-image', () => ({ Image: 'Image' }));

const IMAGE_URL = 'https://cdn.test/post/9b2f1c52-7a63-4d0e-8f41-0c5d2e6a7b13.webp';
const mockOnPress = jest.fn();

describe('PostGridTile', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it('shows the image of the post', () => {
    const post = createPostWeb({
      mediaStatus: 'READY',
      media: [createPostMediaWeb({ url: IMAGE_URL })],
    });

    const { getByTestId } = render(<PostGridTile post={post} size={128} onPress={mockOnPress} />);

    expect(getByTestId('post-grid-tile-image').props.source).toEqual({ uri: IMAGE_URL });
  });

  it('falls back to a stand-in image when the post has none', () => {
    const post = createPostWeb({ id: 'post-without-image' });

    const { getByTestId } = render(<PostGridTile post={post} size={128} onPress={mockOnPress} />);

    expect(getByTestId('post-grid-tile-image').props.source).toEqual({
      uri: getFakeEcologyImage('post-without-image'),
    });
  });

  it('opens the post when pressed', () => {
    const post = createPostWeb({ title: 'Mission Maraude Paris' });
    const { getByLabelText } = render(
      <PostGridTile post={post} size={128} onPress={mockOnPress} />,
    );

    fireEvent.press(getByLabelText('Ouvrir le post Mission Maraude Paris'));

    expect(mockOnPress).toHaveBeenCalledWith(post);
  });

  it('flags a post whose image is still being processed', () => {
    const post = createPostWeb({ mediaStatus: 'PENDING', media: [createPostMediaWeb()] });

    const { getByText } = render(<PostGridTile post={post} size={128} onPress={mockOnPress} />);

    expect(getByText('En traitement')).toBeTruthy();
  });

  it('flags a post whose image was refused', () => {
    const post = createPostWeb({ mediaStatus: 'REJECTED', media: [createPostMediaWeb()] });

    const { getByText } = render(<PostGridTile post={post} size={128} onPress={mockOnPress} />);

    expect(getByText('Image refusée')).toBeTruthy();
  });

  it('shows no badge for a ready post', () => {
    const post = createPostWeb({ mediaStatus: 'READY' });

    const { queryByText } = render(<PostGridTile post={post} size={128} onPress={mockOnPress} />);

    expect(queryByText('En traitement')).toBeNull();
    expect(queryByText('Image refusée')).toBeNull();
  });

  it('is a square of the given size', () => {
    const post = createPostWeb({ title: 'Mission Maraude Paris' });
    const { getByLabelText } = render(
      <PostGridTile post={post} size={128} onPress={mockOnPress} />,
    );

    const style = StyleSheet.flatten(
      getByLabelText('Ouvrir le post Mission Maraude Paris').props.style,
    ) as { width: number; height: number };

    expect(style.width).toBe(128);
    expect(style.height).toBe(128);
  });
});
