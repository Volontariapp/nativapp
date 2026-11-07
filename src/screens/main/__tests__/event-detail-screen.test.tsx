import React from 'react';
import { Alert } from 'react-native';
import { cleanup, fireEvent, render, waitFor } from '@testing-library/react-native';
import { EventDetailScreen } from '../EventDetailScreen';
import { createEvent } from '@/components/event/__tests__/event-app.factory';
import { useDeterministicScoring } from '@/components/event/__tests__/event-points-badge.mock';
import { clearEventPointsEstimateCache } from '@/shared/lib/event-points-estimate.utils';
import { EventState } from '@volontariapp/contracts';
import { liveApi } from '@/api/live/live.api';
import {
  mockAuthState,
  mockNavigation,
  mockParticipations,
  mockSocialActions,
} from './event-detail-screen.mock';
import type { AppEvent } from '@/api/event/event.api';

jest.mock('@volontariapp/shared', () => ({
  UserRoles: { ORGANIZATION: 'ORGANIZATION', VOLUNTEER: 'VOLUNTEER', ADMIN: 'ADMIN' },
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
  useUserParticipations: () => mockParticipations,
}));
jest.mock('@/api/user/hooks/use-profile', () => ({
  useProfile: () => ({ data: undefined }),
}));
jest.mock('@/context/AuthContext', () => ({
  useAuth: () => mockAuthState,
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
    cleanup();
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

const LEAVE_LABEL = 'Ne plus y participer';

const createLiveEvent = (overrides: Partial<AppEvent> = {}): AppEvent =>
  createEvent({
    state: EventState.EVENT_STATE_IN_PROGRESS,
    startAt: '2000-01-01T10:00:00.000Z',
    endAt: '2999-01-01T12:00:00.000Z',
    location: { latitude: 48.85, longitude: 2.35 },
    organizerId: 'organizer-1',
    ...overrides,
  });

describe('EventDetailScreen leave a live event', () => {
  beforeEach(() => {
    mockAuthState.userId = 'visitor-1';
    mockParticipations.data = { pages: [{ ids: ['event-1'] }] };
    mockSocialActions.unparticipate.mockReset().mockResolvedValue(undefined);
  });

  afterEach(() => {
    cleanup();
    jest.restoreAllMocks();
    mockAuthState.userId = undefined;
    mockParticipations.data = undefined;
  });

  it('shows the leave action to a participant of a live event', () => {
    const { getByText } = renderScreen(createLiveEvent());
    expect(getByText(LEAVE_LABEL)).toBeTruthy();
  });

  it('hides the action from the organizer', () => {
    mockAuthState.userId = 'organizer-1';
    const { queryByText } = renderScreen(createLiveEvent());
    expect(queryByText(LEAVE_LABEL)).toBeNull();
  });

  it('does not offer to join a live event the user is not part of', () => {
    mockParticipations.data = { pages: [{ ids: [] }] };
    const { queryByText } = renderScreen(createLiveEvent());
    expect(queryByText(LEAVE_LABEL)).toBeNull();
    expect(queryByText('Rejoindre')).toBeNull();
  });

  it.each([EventState.EVENT_STATE_FINISHED, EventState.EVENT_STATE_CANCELLED])(
    'shows no action for the ended state %s',
    (state) => {
      const { queryByText } = renderScreen(createLiveEvent({ state }));
      expect(queryByText(LEAVE_LABEL)).toBeNull();
    },
  );

  it('shows no action for a past event', () => {
    const { queryByText } = renderScreen(
      createLiveEvent({
        state: EventState.EVENT_STATE_IN_PROGRESS,
        startAt: '2000-01-01T10:00:00.000Z',
        endAt: '2000-01-01T12:00:00.000Z',
      }),
    );
    expect(queryByText(LEAVE_LABEL)).toBeNull();
  });

  it('stops the location sharing then unparticipates after confirmation', async () => {
    const stopSharing = jest.spyOn(liveApi, 'stopSharing').mockResolvedValue(undefined);
    const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => undefined);
    const { getByText } = renderScreen(createLiveEvent());

    fireEvent.press(getByText(LEAVE_LABEL));
    expect(mockSocialActions.unparticipate).not.toHaveBeenCalled();

    const buttons = alertSpy.mock.calls[0]?.[2];
    const confirm = buttons?.find((button) => button.text === 'Quitter');
    confirm?.onPress?.();

    await waitFor(() => {
      expect(mockSocialActions.unparticipate).toHaveBeenCalledWith('event-1');
    });
    expect(stopSharing).toHaveBeenCalledWith('event-1', 'LEFT');
  });

  it('does not stop any sharing when leaving an event that is not live', async () => {
    const stopSharing = jest.spyOn(liveApi, 'stopSharing').mockResolvedValue(undefined);
    const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => undefined);
    const { getByText } = renderScreen(
      createLiveEvent({
        state: EventState.EVENT_STATE_PUBLISHED,
        startAt: '2999-01-01T10:00:00.000Z',
        endAt: '2999-01-01T12:00:00.000Z',
      }),
    );

    fireEvent.press(getByText(LEAVE_LABEL));
    alertSpy.mock.calls[0]?.[2]?.find((button) => button.text === 'Quitter')?.onPress?.();

    await waitFor(() => {
      expect(mockSocialActions.unparticipate).toHaveBeenCalledWith('event-1');
    });
    expect(stopSharing).not.toHaveBeenCalled();
  });

  it('unparticipates even when stopping the sharing fails', async () => {
    jest.spyOn(liveApi, 'stopSharing').mockRejectedValue(new Error('no sharing'));
    const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => undefined);
    const { getByText } = renderScreen(createLiveEvent());

    fireEvent.press(getByText(LEAVE_LABEL));
    alertSpy.mock.calls[0]?.[2]?.find((button) => button.text === 'Quitter')?.onPress?.();

    await waitFor(() => {
      expect(mockSocialActions.unparticipate).toHaveBeenCalledWith('event-1');
    });
  });
});
