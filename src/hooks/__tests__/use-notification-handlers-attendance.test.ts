jest.mock('@volontariapp/errors', () => ({}), { virtual: true });
jest.mock('@volontariapp/contracts', () => ({}), { virtual: true });
jest.mock('@volontariapp/shared', () => ({ UserRoles: {} }), { virtual: true });
jest.mock('@volontariapp/logger', () => ({}), { virtual: true });
jest.mock(
  '@volontariapp/messaging',
  () => ({
    WebsocketMessagingType: { EVENT_ATTENDANCE_UPDATED: 'event.attendance_updated' },
  }),
  { virtual: true },
);

import { renderHook } from '@testing-library/react-native';
import type { Socket } from 'socket.io-client';
import { EVENT_ATTENDEES_QUERY_KEY } from '@/api/social/hooks/use-event-attendance';
import { useNotificationHandlers } from '../useNotificationHandlers';

const mockInvalidateQueries = jest.fn();

jest.mock('@tanstack/react-query', () => ({
  useQueryClient: () => ({ clear: jest.fn(), invalidateQueries: mockInvalidateQueries }),
}));

describe('useNotificationHandlers: event.attendance_updated', () => {
  let listeners: Record<string, (data: unknown) => void>;
  let notify: jest.Mock;
  let socket: { on: jest.Mock; off: jest.Mock };

  beforeEach(() => {
    jest.clearAllMocks();
    listeners = {};
    notify = jest.fn();
    socket = {
      on: jest.fn((event: string, handler: (data: unknown) => void) => {
        listeners[event] = handler;
      }),
      off: jest.fn(),
    };
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('refreshes the attendees of the event without showing a toast', () => {
    renderHook(() => {
      useNotificationHandlers(socket as unknown as Socket, notify);
    });
    const handler = listeners['event.attendance_updated'];
    if (handler === undefined) throw new Error('event.attendance_updated handler is not registered');

    handler({ eventId: 'event-1', checked: true });

    expect(mockInvalidateQueries).toHaveBeenCalledWith({
      queryKey: [EVENT_ATTENDEES_QUERY_KEY, 'event-1'],
    });
    expect(notify).not.toHaveBeenCalled();
  });

  it('removes the listener on unmount', () => {
    const { unmount } = renderHook(() => {
      useNotificationHandlers(socket as unknown as Socket, notify);
    });

    unmount();

    expect(socket.off).toHaveBeenCalledWith('event.attendance_updated', expect.any(Function));
  });
});
