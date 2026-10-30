import React from 'react';
import { render } from '@testing-library/react-native';
import { EventCard } from '../EventCard';
import { EventPreviewModal } from '@/components/post/event-preview-modal';
import { createEvent } from './event-app.factory';
import { useDeterministicScoring } from './event-points-badge.mock';
import { clearEventPointsEstimateCache } from '@/shared/lib/event-points-estimate.utils';

jest.mock('@volontariapp/shared', () => ({
  computeEventScoring: jest.fn(),
  UserRoles: { ORGANIZATION: 'ORGANIZATION', VOLUNTEER: 'VOLUNTEER', ADMIN: 'ADMIN' },
  TagsNames: {
    ECOLOGIE: 'ECOLOGIE',
    SOCIAL: 'SOCIAL',
    BENEVOLAT: 'BENEVOLAT',
    CERTIFIED: 'CERTIFIED',
  },
  MIN_ATTENDEES_FOR_ORGANIZER_POINTS: 3,
}));
jest.mock('expo-image', () => ({ Image: 'Image' }));
jest.mock('expo-linear-gradient', () => ({ LinearGradient: 'LinearGradient' }));
jest.mock('@/context/DebugContext', () => ({
  useDebug: () => ({ isDebugMode: false, toggleDebugMode: jest.fn() }),
}));

const estimateText = 'Estimation : de 162 à 263 pts';

describe('EventPointsBadge usage', () => {
  beforeEach(() => {
    clearEventPointsEstimateCache();
    useDeterministicScoring();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('EventCard renders the estimate for a v1 event', () => {
    const { getByText } = render(
      <EventCard event={createEvent({ awardedImpactScore: 0, scoringVersion: 1 })} />,
    );
    expect(getByText(estimateText)).toBeTruthy();
  });

  it('EventCard keeps the legacy badge', () => {
    const { getByText } = render(<EventCard event={createEvent({ awardedImpactScore: 25 })} />);
    expect(getByText("+25 points d'impact")).toBeTruthy();
  });

  it('EventPreviewModal renders the estimate for a v1 event', () => {
    const { getByText } = render(
      <EventPreviewModal
        visible
        event={createEvent({ awardedImpactScore: 0, scoringVersion: 1 })}
        onClose={jest.fn()}
      />,
    );
    expect(getByText(estimateText)).toBeTruthy();
  });

  it('EventPreviewModal keeps the legacy chip', () => {
    const { getByText } = render(
      <EventPreviewModal
        visible
        event={createEvent({ awardedImpactScore: 75 })}
        onClose={jest.fn()}
      />,
    );
    expect(getByText("+75 pts d'impact")).toBeTruthy();
  });
});
