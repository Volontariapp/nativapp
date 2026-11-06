import React from 'react';
import { render } from '@testing-library/react-native';
import { createProfile } from '@/components/profile/__tests__/profile.factory';
import { BADGE_VARIANTS } from '@/components/dataDisplay/badge/badge.config';
import { createBadgeProgress } from '@/components/dataDisplay/badge/__tests__/badge-progress.factory';
import { mockHeaderStub, mockUseBadgeProgress, mockUseProfile } from './badges-screen.mock';
import { BadgesScreen } from '../BadgesScreen';

jest.mock('@/api/user/hooks/use-profile', () => ({
  useProfile: (): unknown => mockUseProfile(),
}));
jest.mock('@/api/user/hooks/use-badge-progress', () => ({
  useBadgeProgress: (): unknown => mockUseBadgeProgress(),
}));
jest.mock('@/components/layout/AppHeader', () => ({
  __esModule: true,
  default: mockHeaderStub,
}));

const total = BADGE_VARIANTS.length;

describe('BadgesScreen', () => {
  beforeEach(() => {
    mockUseBadgeProgress.mockReturnValue({ data: undefined, isLoading: true });
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
  describe('with the progress of each badge', () => {
    it('adds up the points of the unlocked badges', () => {
      mockUseBadgeProgress.mockReturnValue({
        data: [
          createBadgeProgress({ slug: 'EVENT_PARTICIPATION_TIER_1', unlocked: true, percent: 100, points: 100 }),
          createBadgeProgress({ slug: 'EVENT_SOCIAL_TIER_1', unlocked: true, percent: 100, points: 150 }),
        ],
      });
      const { getByText } = render(<BadgesScreen />);

      expect(getByText('250 points gagnés')).toBeTruthy();
    });

    it('shows how far a locked badge is and what it will give', () => {
      mockUseBadgeProgress.mockReturnValue({ data: [createBadgeProgress()] });
      const { getByText } = render(<BadgesScreen />);

      expect(getByText('60 %')).toBeTruthy();
      expect(getByText('3 / 5 événements terminés')).toBeTruthy();
      expect(getByText('Récompense : +250 pts')).toBeTruthy();
    });

    it('does not claim any points while the progress is not loaded', () => {
      const { queryByText } = render(<BadgesScreen />);

      expect(queryByText(/points gagnés/)).toBeNull();
    });

    it('still lists every badge when the progress could not be loaded', () => {
      mockUseBadgeProgress.mockReturnValue({ data: undefined, isError: true });
      const { getByText } = render(<BadgesScreen />);

      expect(getByText(`0 / ${String(total)} débloqués`)).toBeTruthy();
    });
  });
});
