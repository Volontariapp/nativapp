import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import * as mockExpoImage from './expo-image.mock';
import { createProfile } from './profile.factory';
import { ProfileLayout } from '../ProfileLayout';

jest.mock('expo-image', () => mockExpoImage);
// Le barrel complet charge Tags.tsx, illisible avec le mock de jest.setup : ProfileEventsTabs
// (non rendu ici) n'en a besoin que pour ses imports.
jest.mock('@/components', () => ({}));

const mockOnSeeAllBadges = jest.fn();

const renderLayout = (onSeeAllBadges?: () => void) => {
  const profile = createProfile();
  return render(
    <ProfileLayout
      pseudo={profile.pseudo}
      stats={[]}
      badges={[]}
      onSeeAllBadges={onSeeAllBadges}
    />,
  );
};

describe('ProfileLayout badges section', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it('offers to see all the badges when a shortcut is given', () => {
    const { getByText, getByLabelText } = renderLayout(mockOnSeeAllBadges);

    expect(getByText('Tout voir')).toBeTruthy();
    expect(getByLabelText('Voir tous les badges')).toBeTruthy();
  });

  it('calls the shortcut when the link is pressed', () => {
    const { getByLabelText } = renderLayout(mockOnSeeAllBadges);

    fireEvent.press(getByLabelText('Voir tous les badges'));

    expect(mockOnSeeAllBadges).toHaveBeenCalledTimes(1);
  });

  it('shows no link without a shortcut, as on the public profile', () => {
    const { queryByText } = renderLayout();

    expect(queryByText('Tout voir')).toBeNull();
  });
});
