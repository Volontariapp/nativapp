import React from 'react';
import { StyleSheet, type StyleProp, type TextStyle } from 'react-native';
import { fireEvent, render } from '@testing-library/react-native';
import type { AppButton as AppButtonComponent } from '@/components/buttons/AppButton';
import type { ProfileLayout as ProfileLayoutComponent } from '@/components/profile/ProfileLayout';
import { createProfile } from '@/components/profile/__tests__/profile.factory';
import * as mockExpoImage from '@/components/profile/__tests__/expo-image.mock';
import {
  createEventList,
  createUpcomingEvent,
} from '@/components/profile/__tests__/upcoming-events.factory';
import { formatPoints, getImpactRankStatus } from '@/shared/lib/impact-ranks';
import { ProfileScreen } from '../ProfileScreen';
import {
  createMyPosts,
  createProfileEvents,
  mockLogout,
  mockNavigate,
  mockUseGetFollowers,
  mockUseGetMyPosts,
  mockUseGetFollows,
  mockUseProfile,
  mockUseProfileEvents,
} from './profile-screen.mock';

jest.mock('expo-image', () => mockExpoImage);
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
  useAuth: (): unknown => ({ logout: mockLogout }),
}));
jest.mock('@/api/post/hooks/use-get-my-posts', () => ({
  useGetMyPosts: (): unknown => mockUseGetMyPosts(),
}));
jest.mock('@react-navigation/native', () => ({
  useNavigation: (): unknown => ({ navigate: mockNavigate }),
}));
// Le barrel complet charge Tags.tsx, qui lit des constantes absentes du mock de jest.setup.js :
// on garde le vrai ProfileLayout (header et stats) et on neutralise le reste.
jest.mock('@/components', () => ({
  AppButton: jest.requireActual<{ AppButton: typeof AppButtonComponent }>(
    '@/components/buttons/AppButton',
  ).AppButton,
  AppText: (): null => null,
  AppHeader: (): null => null,
  AppLoader: (): null => null,
  AppIconsButton: (): null => null,
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
      data: createProfile({ totalImpactScore: 350 }),
      isLoading: false,
      error: null,
    });
    mockUseGetFollows.mockReturnValue({ data: { pagination: { total: 3 } } });
    mockUseGetFollowers.mockReturnValue({ data: { pagination: { total: 7 } } });
    mockUseProfileEvents.mockReturnValue(createProfileEvents());
    mockUseGetMyPosts.mockReturnValue(createMyPosts());
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('shows the impact score among the stats of the profile header', () => {
    const { getByText } = render(<ProfileScreen />);

    expect(getByText('Impact')).toBeTruthy();
    expect(getByText('350')).toBeTruthy();
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
    const values = ['350', '7', '3'].map((value) => getByText(value));

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

  it('no longer shows the engagements calendar', () => {
    const { queryByText } = render(<ProfileScreen />);

    expect(queryByText('Mes Engagements')).toBeNull();
  });

  it('shows only the next upcoming event of the user', () => {
    mockUseProfileEvents.mockReturnValue({
      ...createProfileEvents(),
      upcoming: createEventList({
        events: [
          createUpcomingEvent({ id: 'next', title: 'Nettoyage des berges' }),
          createUpcomingEvent({ id: 'later', title: 'Collecte de livres' }),
        ],
      }),
    });

    const { getByText, queryByText } = render(<ProfileScreen />);

    expect(getByText('Prochain évènement')).toBeTruthy();
    expect(getByText('Nettoyage des berges')).toBeTruthy();
    expect(queryByText('Collecte de livres')).toBeNull();
  });

  it('lists the finished events the user joined', () => {
    mockUseProfileEvents.mockReturnValue({
      ...createProfileEvents(),
      finished: createEventList({
        events: [createUpcomingEvent({ id: 'done', title: 'Maraude de septembre' })],
      }),
    });

    const { getByText } = render(<ProfileScreen />);

    expect(getByText('Évènements terminés')).toBeTruthy();
    expect(getByText('Maraude de septembre')).toBeTruthy();
  });

  it('opens the events management page from the dedicated button', () => {
    const { getByLabelText } = render(<ProfileScreen />);

    fireEvent.press(getByLabelText('Gérer mes évènements'));

    expect(mockNavigate).toHaveBeenCalledWith('MainTabs', {
      screen: 'create',
      params: { screen: 'ManageHub' },
    });
  });

  it('no longer offers the feedbacks button', () => {
    const { queryByText } = render(<ProfileScreen />);

    expect(queryByText('Voir mes feedbacks')).toBeNull();
  });

  it('logs the user out from the logout button', () => {
    const { getByText } = render(<ProfileScreen />);

    fireEvent.press(getByText('Se déconnecter'));

    expect(mockLogout).toHaveBeenCalledTimes(1);
  });

  it('opens the post form from the shortcut next to the posts', () => {
    const { getByText } = render(<ProfileScreen />);

    fireEvent.press(getByText('Créer mon premier post'));

    expect(mockNavigate).toHaveBeenCalledWith('MainTabs', {
      screen: 'create',
      params: { screen: 'PostForm' },
    });
  });

  it('shows the next rank to unlock and opens the ranks page', () => {
    const status = getImpactRankStatus(350);
    const { getByText, getByLabelText } = render(<ProfileScreen />);

    expect(getByText('PROCHAIN RANG')).toBeTruthy();
    expect(getByText(`Plus que ${formatPoints(status.pointsToNext)} pts`)).toBeTruthy();

    fireEvent.press(getByLabelText('Voir tous les rangs'));

    expect(mockNavigate).toHaveBeenCalledWith('Ranks');
  });
});
