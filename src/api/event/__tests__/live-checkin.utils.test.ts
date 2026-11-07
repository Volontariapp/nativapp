import { EventState } from '@volontariapp/contracts';
import type { EventAttendee } from '@volontariapp/contracts';
import type { AppEvent } from '../event.api';
import { isCheckInExpected, isCheckInPending } from '../live-checkin.utils';

const NOW = new Date('2026-11-07T12:00:00.000Z').getTime();
const HOUR_MS = 60 * 60 * 1000;

function buildEvent(overrides: Partial<AppEvent> = {}): AppEvent {
  return {
    id: 'event-1',
    organizerId: 'organizer-1',
    startAt: new Date(NOW - HOUR_MS).toISOString(),
    endAt: new Date(NOW + HOUR_MS).toISOString(),
    state: EventState.EVENT_STATE_PUBLISHED,
    ...overrides,
  } as AppEvent;
}

function buildAttendee(userId: string, checkedInAt?: EventAttendee['checkedInAt']): EventAttendee {
  return { userId, registeredAt: undefined, checkedInAt };
}

describe('isCheckInExpected', () => {
  it('is true for a participant of a live event', () => {
    expect(isCheckInExpected(buildEvent(), 'user-1', NOW)).toBe(true);
  });

  it('is false for the organizer', () => {
    expect(isCheckInExpected(buildEvent(), 'organizer-1', NOW)).toBe(false);
  });

  it('is false when logged out', () => {
    expect(isCheckInExpected(buildEvent(), null, NOW)).toBe(false);
  });

  it('is false for an event that has not started', () => {
    const event = buildEvent({
      startAt: new Date(NOW + HOUR_MS).toISOString(),
      endAt: new Date(NOW + 2 * HOUR_MS).toISOString(),
    });
    expect(isCheckInExpected(event, 'user-1', NOW)).toBe(false);
  });

  it('is false for an event that is over', () => {
    const event = buildEvent({
      startAt: new Date(NOW - 3 * HOUR_MS).toISOString(),
      endAt: new Date(NOW - 2 * HOUR_MS).toISOString(),
    });
    expect(isCheckInExpected(event, 'user-1', NOW)).toBe(false);
  });
});

describe('isCheckInPending', () => {
  it('is true when the user is listed without a check-in date', () => {
    expect(isCheckInPending([buildAttendee('user-1')], 'user-1')).toBe(true);
  });

  it('is false once the organizer checked the user in', () => {
    const checkedIn = buildAttendee('user-1', { seconds: 1, nanos: 0 });
    expect(isCheckInPending([checkedIn], 'user-1')).toBe(false);
  });

  it('is false when the user is not in the loaded list', () => {
    expect(isCheckInPending([buildAttendee('user-2')], 'user-1')).toBe(false);
  });

  it('is false while the list is loading or the user is unknown', () => {
    expect(isCheckInPending(undefined, 'user-1')).toBe(false);
    expect(isCheckInPending([buildAttendee('user-1')], null)).toBe(false);
  });
});
