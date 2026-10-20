import React from 'react';
import { render } from '@testing-library/react-native';
import { EventCard } from '../EventCard';
import { useDebug } from '@/context/DebugContext';
import { EventState, EventType } from '@volontariapp/contracts';
import type { RankedAppEvent } from '@/api/ranking';

jest.mock('expo-image', () => ({ Image: 'Image' }));
jest.mock('expo-linear-gradient', () => ({ LinearGradient: 'LinearGradient' }));
jest.mock('@/context/DebugContext', () => ({
  useDebug: jest.fn(),
}));

const mockUseDebug = jest.mocked(useDebug);

const baseRankedEvent: RankedAppEvent = {
  id: 'evt-test-1',
  title: 'Maraude solidaire',
  description: 'Distribution alimentaire',
  localisationName: 'Paris 10e',
  awardedImpactScore: 15,
  maxParticipants: 10,
  currentParticipants: 3,
  tags: [],
  requirements: [],
  startAt: '2026-10-25T14:00:00.000Z',
  endAt: '2026-10-25T17:00:00.000Z',
  type: EventType.EVENT_TYPE_SOCIAL,
  state: EventState.EVENT_STATE_PUBLISHED,
  rankingScore: 88.5,
  reasons: ['NEAR_YOU', 'TRENDING'],
};

describe('EventCard ranking debug display', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it('hides ranking score and reasons when debug mode is disabled', () => {
    mockUseDebug.mockReturnValue({ isDebugMode: false, toggleDebugMode: jest.fn() });

    const { queryByText } = render(<EventCard event={baseRankedEvent} />);

    expect(queryByText(/Score:/i)).toBeNull();
    expect(queryByText('Proche de vous')).toBeNull();
    expect(queryByText('Populaire')).toBeNull();
  });

  it('displays ranking score and mapped reason labels when debug mode is enabled', () => {
    mockUseDebug.mockReturnValue({ isDebugMode: true, toggleDebugMode: jest.fn() });

    const { getByText } = render(<EventCard event={baseRankedEvent} />);

    expect(getByText('Score: 88.5')).toBeTruthy();
    expect(getByText('Proche de vous')).toBeTruthy();
    expect(getByText('Populaire')).toBeTruthy();
  });
});
