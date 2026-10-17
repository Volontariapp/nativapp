import React from 'react';
import { StyleSheet, type StyleProp, type TextStyle } from 'react-native';
import { render } from '@testing-library/react-native';
import type { ProfileLayout as ProfileLayoutComponent } from '@/components/profile/ProfileLayout';
import { createProfile } from '@/components/profile/__tests__/profile.factory';
import { ProfileScreen } from '../ProfileScreen';
import {
  createProfileEvents,
  mockUseGetFollowers,
  mockUseGetFollows,
  mockUseProfile,
  mockUseProfileEvents,
} from './profile-screen.mock';

jest.mock('@/api/user/hooks/use-profile', () => ({
  useProfile: (): unknown => mockUseProfile(),
}));
jest.mock('@/api/user/hooks/use-update-profile', () => ({
  useUpdateProfile: (): unknown => ({ mutateAsync: jest.fn(), isPending: false }),
}));
jest.mock('@/api/social/hooks/use-get-follows', () => ({
  useGetFollows: (): unknown => mockUseGetFollows(),
}));
jest.mock('@/api/social/hooks/use-get-followers', () => ({
  useGetFollowers: (): unknown => mockUseGetFollowers(),
}));
jest.mock('../hooks/use-profile-events', () => ({
  useProfileEvents: (): unknown => mockUseProfileEvents(),
}));
jest.mock('@/context/AuthContext', () => ({
  useAuth: (): unknown => ({ logout: jest.fn() }),
}));
jest.mock('@react-navigation/native', () => ({
  useNavigation: (): unknown => ({ navigate: jest.fn() }),
}));
// Le barrel complet charge Tags.tsx, qui lit des constantes absentes du mock de jest.setup.js :
// on garde le vrai ProfileLayout (header et stats) et on neutralise le reste.
jest.mock('@/components', () => ({
  AppButton: (): null => null,
  AppText: (): null => null,
  AppHeader: (): null => null,
  AppLoader: (): null => null,
  AppIconsButton: (): null => null,
  AppCalendar: (): null => null,
  ProfileSection: (): null => null,
  ProfileEditModal: (): null => null,
  ProfileLayout: jest.requireActual<{ ProfileLayout: typeof ProfileLayoutComponent }>(
    '@/components/profile/ProfileLayout',
  ).ProfileLayout,
}));

type TextElement = { props: { style?: StyleProp<TextStyle> } };

const fontSizeOf = (element: TextElement): number | undefined =>
  StyleSheet.flatten(element.props.style).fontSize;

describe('ProfileScreen header stats', () => {
  beforeEach(() => {
    mockUseProfile.mockReturnValue({
      data: createProfile({ totalImpactScore: 120 }),
      isLoading: false,
      error: null,
    });
    mockUseGetFollows.mockReturnValue({ data: { pagination: { total: 3 } } });
    mockUseGetFollowers.mockReturnValue({ data: { pagination: { total: 7 } } });
    mockUseProfileEvents.mockReturnValue(createProfileEvents());
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('shows the impact score among the stats of the profile header', () => {
    const { getByText } = render(<ProfileScreen />);

    expect(getByText('Impact')).toBeTruthy();
    expect(getByText('120')).toBeTruthy();
  });

  it('labels the social stats Follow and Suivi(e)s next to the impact score', () => {
    const { getByText, queryByText } = render(<ProfileScreen />);

    expect(getByText('Follow')).toBeTruthy();
    expect(getByText('7')).toBeTruthy();
    expect(getByText('Suivi(e)s')).toBeTruthy();
    expect(getByText('3')).toBeTruthy();
    expect(queryByText('Abonnés')).toBeNull();
    expect(queryByText('Abonnements')).toBeNull();
  });

  it('does not show the created events counter', () => {
    const { queryByText } = render(<ProfileScreen />);

    expect(queryByText('Évents créés')).toBeNull();
  });

  it('keeps the same font size for every stat and does not shrink any of them', () => {
    const { getByText } = render(<ProfileScreen />);

    const labels = ['Impact', 'Follow', 'Suivi(e)s'].map((label) => getByText(label));
    const values = ['120', '7', '3'].map((value) => getByText(value));

    expect(new Set(labels.map(fontSizeOf)).size).toBe(1);
    expect(new Set(values.map(fontSizeOf)).size).toBe(1);
    [...labels, ...values].forEach((element) => {
      expect(element.props.adjustsFontSizeToFit).not.toBe(true);
    });
  });

  it('shows the rank as a chip next to the pseudo', () => {
    const { getByTestId, getByText } = render(<ProfileScreen />);

    expect(getByTestId('profile-rank-chip')).toBeTruthy();
    expect(getByText('FIELD VOLUNTEER')).toBeTruthy();
  });
});
