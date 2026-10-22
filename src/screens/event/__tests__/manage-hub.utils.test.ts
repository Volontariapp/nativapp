import { EventState, EventType } from '@volontariapp/contracts';
import type { AppEvent } from '@/api/event/event.api';
import {
  filterByScope,
  filterByType,
  isEventLive,
  isEventUpcoming,
  sortEventsByEarliestUpcoming,
} from '../manage-hub.utils';

const NOW = new Date('2026-10-22T12:00:00.000Z').getTime();

const makeEvent = (overrides: Partial<AppEvent> & { id: string }): AppEvent => ({
  title: `Event ${overrides.id}`,
  description: 'Description',
  startAt: '2026-10-30T10:00:00.000Z',
  endAt: '2026-10-30T12:00:00.000Z',
  localisationName: 'Paris',
  type: EventType.EVENT_TYPE_SOCIAL,
  state: EventState.EVENT_STATE_PUBLISHED,
  awardedImpactScore: 10,
  maxParticipants: 10,
  currentParticipants: 1,
  ...overrides,
});

const live = makeEvent({
  id: 'live',
  startAt: '2026-10-22T10:00:00.000Z',
  endAt: '2026-10-22T14:00:00.000Z',
});
const soon = makeEvent({ id: 'soon', startAt: '2026-10-23T10:00:00.000Z' });
const later = makeEvent({ id: 'later', startAt: '2026-11-23T10:00:00.000Z' });
const pastRecent = makeEvent({
  id: 'past-recent',
  startAt: '2026-10-20T10:00:00.000Z',
  endAt: '2026-10-20T12:00:00.000Z',
});
const pastOld = makeEvent({
  id: 'past-old',
  startAt: '2026-09-01T10:00:00.000Z',
  endAt: '2026-09-01T12:00:00.000Z',
});
const invalid = makeEvent({ id: 'invalid', startAt: 'not-a-date' });

describe('manage-hub utils', () => {
  it('sorts live first, then upcoming by start, then past by most recent end', () => {
    const sorted = [pastOld, later, invalid, pastRecent, soon, live].sort((a, b) =>
      sortEventsByEarliestUpcoming(a, b, NOW),
    );
    expect(sorted.map((e) => e.id)).toEqual([
      'live',
      'soon',
      'later',
      'past-recent',
      'past-old',
      'invalid',
    ]);
  });

  it('treats two invalid dates as equal', () => {
    expect(sortEventsByEarliestUpcoming(invalid, { ...invalid, id: 'other' }, NOW)).toBe(0);
  });

  it('falls back to startAt when endAt is missing', () => {
    const noEnd = makeEvent({ id: 'no-end', endAt: '', startAt: '2026-10-25T10:00:00.000Z' });
    expect(sortEventsByEarliestUpcoming(noEnd, later, NOW)).toBeLessThan(0);
  });

  it('detects live events by time or by state', () => {
    expect(isEventLive(live, NOW)).toBe(true);
    expect(isEventLive(soon, NOW)).toBe(false);
    expect(
      isEventLive(makeEvent({ id: 'state', state: EventState.EVENT_STATE_IN_PROGRESS }), NOW),
    ).toBe(true);
  });

  it('detects upcoming events and excludes finished or cancelled ones', () => {
    expect(isEventUpcoming(soon, NOW)).toBe(true);
    expect(isEventUpcoming(pastOld, NOW)).toBe(false);
    expect(
      isEventUpcoming(makeEvent({ id: 'f', state: EventState.EVENT_STATE_FINISHED }), NOW),
    ).toBe(false);
    expect(
      isEventUpcoming(makeEvent({ id: 'c', state: EventState.EVENT_STATE_CANCELLED }), NOW),
    ).toBe(false);
  });

  it('filters by scope', () => {
    const all = [live, soon, pastOld];
    expect(filterByScope(all, 'all', NOW)).toEqual(all);
    expect(filterByScope(all, 'live', NOW)).toEqual([live]);
    expect(filterByScope(all, 'upcoming', NOW)).toEqual([soon]);
  });

  it('filters by type', () => {
    const eco = makeEvent({ id: 'eco', type: EventType.EVENT_TYPE_ECOLOGY });
    const asString = makeEvent({
      id: 'eco-str',
      type: EventType[EventType.EVENT_TYPE_ECOLOGY] as unknown as EventType,
    });
    const all = [soon, eco, asString];
    expect(filterByType(all, 'all')).toEqual(all);
    expect(filterByType(all, 'social')).toEqual([soon]);
    expect(filterByType(all, 'ecology')).toEqual([eco, asString]);
  });
});
