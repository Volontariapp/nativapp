import React from 'react';
import { render } from '@testing-library/react-native';
import * as mockSafeArea from '@/components/post/__tests__/safe-area.mock';
import { EventImagePreviews } from '../event-image-previews';

jest.mock('expo-image', () => ({ Image: 'Image' }));
jest.mock('expo-linear-gradient', () => ({ LinearGradient: 'LinearGradient' }));
jest.mock('react-native-safe-area-context', () => mockSafeArea);

const LOCAL_URI = 'file:///gallery/IMG_0001.HEIC';

describe('EventImagePreviews', () => {
  it('asks for a photo before showing any preview', () => {
    const { getByText, queryByTestId } = render(<EventImagePreviews imageUri={undefined} />);

    expect(getByText(/Ajoutez une photo/)).toBeTruthy();
    expect(queryByTestId('event-image-preview-swipe')).toBeNull();
  });

  it.each(['swipe', 'detail', 'list', 'map'])('shows the %s frame with the chosen photo', (id) => {
    const { getByTestId } = render(<EventImagePreviews imageUri={LOCAL_URI} />);

    expect(getByTestId(`event-image-preview-${id}`)).toBeTruthy();
    expect(getByTestId(`event-image-preview-image-${id}`).props.source).toEqual({ uri: LOCAL_URI });
  });

  it('labels each frame', () => {
    const { getByText } = render(<EventImagePreviews imageUri={LOCAL_URI} />);

    ['Swipe', 'Détail', 'Liste et profil', 'Carte'].forEach((label) => {
      expect(getByText(label)).toBeTruthy();
    });
  });
});
