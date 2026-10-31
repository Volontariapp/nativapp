import React from 'react';
import { render } from '@testing-library/react-native';
import { EventPointsBadge } from '../EventPointsBadge';
import { createEvent } from './event-app.factory';
import { mockedComputeEventScoring, useDeterministicScoring } from './event-points-badge.mock';
import { clearEventPointsEstimateCache } from '@/shared/lib/event-points-estimate.utils';

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

describe('EventPointsBadge', () => {
  beforeEach(() => {
    clearEventPointsEstimateCache();
    useDeterministicScoring();
  });

  afterEach(() => {
    jest.restoreAllMocks();
    mockedComputeEventScoring.mockReset();
  });

  it('keeps the legacy badge unchanged for events without scoringVersion', () => {
    const { getByText } = render(
      <EventPointsBadge event={createEvent({ awardedImpactScore: 40 })} />,
    );
    expect(getByText("+40 points d'impact")).toBeTruthy();
    expect(mockedComputeEventScoring).not.toHaveBeenCalled();
  });

  it('keeps the legacy badge for scoringVersion 0', () => {
    const { getByText } = render(
      <EventPointsBadge event={createEvent({ awardedImpactScore: 40, scoringVersion: 0 })} />,
    );
    expect(getByText("+40 points d'impact")).toBeTruthy();
  });

  it('shows nothing for a legacy event with no points', () => {
    const { toJSON } = render(<EventPointsBadge event={createEvent({ awardedImpactScore: 0 })} />);
    expect(toJSON()).toBeNull();
  });

  it('shows the estimated range for a scoring v1 event', () => {
    const { getByText, queryByText } = render(
      <EventPointsBadge
        event={createEvent({ awardedImpactScore: 0, scoringVersion: 1, maxParticipants: 5 })}
      />,
    );
    expect(getByText('Estimation : de 162 à 263 pts')).toBeTruthy();
    expect(queryByText(/points d'impact/)).toBeNull();
  });

  it('renders the chip variant with the same estimate', () => {
    const { getByText } = render(
      <EventPointsBadge
        variant="chip"
        event={createEvent({ awardedImpactScore: 0, scoringVersion: 1 })}
      />,
    );
    expect(getByText('Estimation : de 162 à 263 pts')).toBeTruthy();
  });

  it('shows nothing for a v1 event without capacity', () => {
    const { toJSON } = render(
      <EventPointsBadge
        event={createEvent({ awardedImpactScore: 0, scoringVersion: 1, maxParticipants: 0 })}
      />,
    );
    expect(toJSON()).toBeNull();
  });

  it('shows nothing for a v1 event with invalid dates', () => {
    const { toJSON } = render(
      <EventPointsBadge
        event={createEvent({ awardedImpactScore: 0, scoringVersion: 1, startAt: 'invalid' })}
      />,
    );
    expect(toJSON()).toBeNull();
  });

  it('does not simulate very large capacities', () => {
    const { toJSON } = render(
      <EventPointsBadge
        event={createEvent({ awardedImpactScore: 0, scoringVersion: 1, maxParticipants: 5000 })}
      />,
    );
    expect(toJSON()).toBeNull();
    expect(mockedComputeEventScoring).not.toHaveBeenCalled();
  });

  it('computes once for several identical cards', () => {
    const event = createEvent({ awardedImpactScore: 0, scoringVersion: 1 });
    render(
      <>
        <EventPointsBadge event={event} />
        <EventPointsBadge event={{ ...event }} />
      </>,
    );
    expect(mockedComputeEventScoring).toHaveBeenCalledTimes(1);
  });
});
