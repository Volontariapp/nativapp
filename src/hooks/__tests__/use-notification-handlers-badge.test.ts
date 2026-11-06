jest.mock('@volontariapp/errors', () => ({}), { virtual: true });
jest.mock('@volontariapp/contracts', () => ({}), { virtual: true });
jest.mock('@volontariapp/shared', () => ({ UserRoles: {} }), { virtual: true });
jest.mock('@volontariapp/logger', () => ({}), { virtual: true });
jest.mock(
  '@volontariapp/messaging',
  () => ({ WebsocketMessagingType: { USER_BADGE_AWARDED: 'user.badge_awarded' } }),
  { virtual: true },
);

import { renderHook } from '@testing-library/react-native';
import type { Socket } from 'socket.io-client';
import { BADGE_PROGRESS_QUERY_KEY } from '@/api/user/hooks/use-badge-progress';
import { PROFILE_QUERY_KEY } from '@/api/user/hooks/use-profile';
import { badgeAwardedBus } from '../../services/event-bus.service';
import { useNotificationHandlers } from '../useNotificationHandlers';

const mockInvalidateQueries = jest.fn();

jest.mock('@tanstack/react-query', () => ({
  useQueryClient: () => ({ clear: jest.fn(), invalidateQueries: mockInvalidateQueries }),
}));

const BADGE = {
  id: 'badge-1',
  name: 'Engagé·e',
  slug: 'EVENT_PARTICIPATION_TIER_2',
  description: 'Participer à 5 événements',
  points: 250,
};

describe('useNotificationHandlers: user.badge_awarded', () => {
  let listeners: Record<string, (data: unknown) => void>;
  let notify: jest.Mock;

  const receiveBadgeAwarded = (payload: unknown): void => {
    const handler = listeners['user.badge_awarded'];
    if (handler === undefined) throw new Error('user.badge_awarded handler is not registered');
    handler(payload);
  };

  beforeEach(() => {
    jest.clearAllMocks();
    listeners = {};
    notify = jest.fn();
    const socket = {
      on: jest.fn((event: string, handler: (data: unknown) => void) => {
        listeners[event] = handler;
      }),
      off: jest.fn(),
    };
    renderHook(() => {
      useNotificationHandlers(socket as unknown as Socket, notify);
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('refreshes the profile and the badge progress', () => {
    receiveBadgeAwarded({ badges: [BADGE] });

    expect(mockInvalidateQueries).toHaveBeenCalledWith({ queryKey: PROFILE_QUERY_KEY });
    expect(mockInvalidateQueries).toHaveBeenCalledWith({ queryKey: BADGE_PROGRESS_QUERY_KEY });
  });

  it('hands the badges, with their points, to the celebration modal and tells the user', () => {
    const emit = jest.spyOn(badgeAwardedBus, 'emit');

    receiveBadgeAwarded({ badges: [BADGE] });

    expect(emit).toHaveBeenCalledWith([BADGE]);
    expect(notify).toHaveBeenCalledTimes(1);
  });

  it('stays quiet when the message carries no badge', () => {
    const emit = jest.spyOn(badgeAwardedBus, 'emit');

    receiveBadgeAwarded({ badges: [] });

    expect(emit).not.toHaveBeenCalled();
    expect(notify).not.toHaveBeenCalled();
  });
});
