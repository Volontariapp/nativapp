import React from 'react';
import { render } from '@testing-library/react-native';
import { createProfile } from '@/components/profile/__tests__/profile.factory';
import { BADGE_VARIANTS } from '@/components/dataDisplay/badge/badge.config';
import { mockHeaderStub, mockUseProfile } from './badges-screen.mock';
import { BadgesScreen } from '../BadgesScreen';

jest.mock('@/api/user/hooks/use-profile', () => ({
  useProfile: (): unknown => mockUseProfile(),
}));
jest.mock('@/components/layout/AppHeader', () => ({
  __esModule: true,
  default: mockHeaderStub,
}));

const total = BADGE_VARIANTS.length;

describe('BadgesScreen', () => {
  beforeEach(() => {
    mockUseProfile.mockReturnValue({
      data: createProfile({
        badges: [],
      }),
      isLoading: false,
    });
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  const renderWithBadges = (badges: string[]) => {
    mockUseProfile.mockReturnValue({
      data: { ...createProfile(), badges },
      isLoading: false,
    });
    return render(<BadgesScreen />);
  };

  it('offers a way back to the profile', () => {
    const { getByTestId } = render(<BadgesScreen />);

    expect(getByTestId('header-back')).toBeTruthy();
  });

  it('tells how many badges are unlocked out of all of them', () => {
    const { getByText } = renderWithBadges([
      'EVENT_PARTICIPATION_TIER_1',
      'COMMUNITY_POST_COUNT_1',
    ]);

    expect(getByText(`2 / ${String(total)} débloqués`)).toBeTruthy();
  });

  it('marks the owned badges as unlocked', () => {
    const { getAllByText } = renderWithBadges([
      'EVENT_PARTICIPATION_TIER_1',
      'COMMUNITY_POST_COUNT_1',
    ]);

    expect(getAllByText('Débloqué')).toHaveLength(2);
  });

  it('explains how to obtain every badge still locked', () => {
    const { getAllByText, getByText } = renderWithBadges(['EVENT_PARTICIPATION_TIER_1']);

    expect(getAllByText("Comment l'obtenir")).toHaveLength(total - 1);
    expect(getByText('Participer à 5 événements')).toBeTruthy();
  });

  it('shows the badges of each category under its label', () => {
    const { getByText } = render(<BadgesScreen />);

    expect(getByText('Badge de participation')).toBeTruthy();
    expect(getByText("Badge d'interaction")).toBeTruthy();
  });

  it('still lists every badge while the profile is not loaded', () => {
    mockUseProfile.mockReturnValue({ data: undefined, isLoading: true });
    const { getByText } = render(<BadgesScreen />);

    expect(getByText(`0 / ${String(total)} débloqués`)).toBeTruthy();
  });
});
