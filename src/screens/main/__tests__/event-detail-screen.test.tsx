import React from 'react';
import { render } from '@testing-library/react-native';
import { EventDetailScreen } from '../EventDetailScreen';
import { createEvent } from '@/components/event/__tests__/event-app.factory';
import { useDeterministicScoring } from '@/components/event/__tests__/event-points-badge.mock';
import { clearEventPointsEstimateCache } from '@/shared/lib/event-points-estimate.utils';
import { mockNavigation, mockSocialActions } from './event-detail-screen.mock';
import type { AppEvent } from '@/api/event/event.api';

jest.mock('@volontariapp/shared', () => ({
  computeEventScoring: jest.fn(),
  TagsNames: {
    ECOLOGIE: 'ECOLOGIE',
    SOCIAL: 'SOCIAL',
    BENEVOLAT: 'BENEVOLAT',
    CERTIFIED: 'CERTIFIED',
  },
  MIN_ATTENDEES_FOR_ORGANIZER_POINTS: 3,
}));
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => mockNavigation,
}));
jest.mock('react-native-safe-area-context', () => ({
  SafeAreaView: 'SafeAreaView',
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));
jest.mock('@/api/social/hooks/use-user-social-actions', () => ({
  useUserSocialActions: () => mockSocialActions,
}));
jest.mock('@/api/social/hooks/use-user-participations', () => ({
  useUserParticipations: () => ({ data: undefined }),
}));
jest.mock('@/api/user/hooks/use-profile', () => ({
  useProfile: () => ({ data: undefined }),
}));
jest.mock('@/context/AuthContext', () => ({
  useAuth: () => ({ userId: undefined }),
}));
jest.mock('@/components/map/AppMap', () => 'AppMap');
jest.mock('../../../components/event/EventCover', () => ({ EventCover: () => null }));
jest.mock('../../../components/event/EventInfoCards', () => ({ EventInfoCards: () => null }));
jest.mock('../../../components/event/EventTags', () => ({ EventTags: () => null }));
jest.mock('../../../components/event/EventParticipants', () => ({ EventParticipants: () => null }));
jest.mock('../../../components/event/EventRequirements', () => ({
  EventRequirements: () => null,
}));
jest.mock('../../../components/event/EventOrganizer', () => ({ EventOrganizer: () => null }));

type ScreenProps = React.ComponentProps<typeof EventDetailScreen>;

/** Le composant ne lit que route.params.event ; la navigation passe par useNavigation (mocke). */
const buildProps = (event: AppEvent): ScreenProps =>
  ({ route: { key: 'event-detail', name: 'EventDetail', params: { event } } }) as ScreenProps;

const renderScreen = (event: AppEvent) => render(<EventDetailScreen {...buildProps(event)} />);

describe('EventDetailScreen points badge', () => {
  beforeEach(() => {
    clearEventPointsEstimateCache();
    useDeterministicScoring();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('shows the estimate for a v1 event', () => {
    const { getByText } = renderScreen(createEvent({ awardedImpactScore: 0, scoringVersion: 1 }));
    expect(getByText('Estimation : de 162 à 263 pts')).toBeTruthy();
  });

  it('keeps the legacy badge', () => {
    const { getByText } = renderScreen(createEvent({ awardedImpactScore: 30 }));
    expect(getByText("+30 points d'impact")).toBeTruthy();
  });
});
