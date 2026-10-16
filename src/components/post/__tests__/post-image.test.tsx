import React from 'react';
import { render } from '@testing-library/react-native';
import { getFakeEcologyImage } from '@/utils/fake-images.util';
import { PostImage } from '../post-image';

jest.mock('expo-image', () => ({ Image: 'Image' }));

const POST_ID = '123e4567-e89b-12d3-a456-426614174000';
const IMAGE_URL = 'https://cdn.test/post/9b2f1c52-7a63-4d0e-8f41-0c5d2e6a7b13.webp';

describe('PostImage', () => {
  it('shows the image of the post when it has one', () => {
    const { getByTestId } = render(<PostImage postId={POST_ID} imageUrl={IMAGE_URL} />);

    expect(getByTestId('post-image').props.source).toEqual({ uri: IMAGE_URL });
  });

  it('falls back to a stand-in image when the post has none', () => {
    const { getByTestId } = render(<PostImage postId={POST_ID} imageUrl={undefined} />);

    expect(getByTestId('post-image').props.source).toEqual({ uri: getFakeEcologyImage(POST_ID) });
  });

  it('keeps the same stand-in image for the same post across renders', () => {
    const first = render(<PostImage postId={POST_ID} imageUrl={undefined} />);
    const second = render(<PostImage postId={POST_ID} imageUrl={undefined} />);

    expect(first.getByTestId('post-image').props.source).toEqual(
      second.getByTestId('post-image').props.source,
    );
  });
});
