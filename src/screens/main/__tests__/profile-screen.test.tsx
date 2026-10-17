import React from 'react';
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
describe('ProfileScreen impact score', () => {
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

  it('keeps the social and event stats next to the impact score', () => {
    const { getByText } = render(<ProfileScreen />);

    expect(getByText('Abonnés')).toBeTruthy();
    expect(getByText('7')).toBeTruthy();
    expect(getByText('Abonnements')).toBeTruthy();
    expect(getByText('Évents créés')).toBeTruthy();
  });
});
