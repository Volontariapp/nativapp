import React from 'react';
import { render } from '@testing-library/react-native';
import { EventState } from '@volontariapp/contracts';
import { createEvent } from '@/components/event/__tests__/event-app.factory';
import { ImpactCardContainer } from '../impact-card-container';
import { mockUseGetParticipatedEvents, mockUseProfile } from './impact-card-container.mock';

jest.mock('@/api/user/hooks/use-profile', () => ({
  useProfile: (): unknown => mockUseProfile(),
}));
jest.mock('@/api/event/hooks/use-get-participated-events', () => ({
  useGetParticipatedEvents: (): unknown => mockUseGetParticipatedEvents(),
}));

const participations = (events: ReturnType<typeof createEvent>[]) => ({
  data: { pages: [{ events, totalCount: events.length }] },
  isLoading: false,
  hasNextPage: false,
  isFetchingNextPage: false,
  fetchNextPage: jest.fn(),
});

describe('ImpactCardContainer', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it('shows the score of the profile and the progress from finished participations', () => {
    mockUseProfile.mockReturnValue({ data: { totalImpactScore: 42 }, isLoading: false });
    mockUseGetParticipatedEvents.mockReturnValue(
      participations([createEvent({ id: 'f1', state: EventState.EVENT_STATE_FINISHED })]),
    );

    const { getByText } = render(<ImpactCardContainer />);

    expect(getByText('42')).toBeTruthy();
    expect(getByText('Plus que 4 événements avant le badge « Engagé·e »')).toBeTruthy();
  });

  it('stops fetching participation pages once the page cap is reached', () => {
    const fetchNextPage = jest.fn();
    mockUseProfile.mockReturnValue({ data: { totalImpactScore: 42 }, isLoading: false });
    mockUseGetParticipatedEvents.mockReturnValue({
      data: { pages: Array.from({ length: 5 }, () => ({ events: [], totalCount: 1000 })) },
      isLoading: false,
      hasNextPage: true,
      isFetchingNextPage: false,
      fetchNextPage,
    });

    const { getByText } = render(<ImpactCardContainer />);

    expect(fetchNextPage).not.toHaveBeenCalled();
    expect(getByText('42')).toBeTruthy();
  });

  it('renders nothing when the profile failed to load', () => {
    mockUseProfile.mockReturnValue({ data: undefined, isLoading: false });
    mockUseGetParticipatedEvents.mockReturnValue(participations([]));

    const { toJSON } = render(<ImpactCardContainer />);

    expect(toJSON()).toBeNull();
  });
});
