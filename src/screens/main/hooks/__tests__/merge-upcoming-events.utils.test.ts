import { EventState } from '@volontariapp/contracts';
import { createEvent } from '@/components/event/__tests__/event-app.factory';
import { mergeUpcomingEvents } from '../merge-upcoming-events.utils';

const NOW = new Date(2026, 9, 31, 12, 0);
const at = (day: number, hour = 10): string => new Date(2026, 10, day, hour).toISOString();

describe('mergeUpcomingEvents', () => {
  it('merges participated and created events sorted by start date', () => {
    const participated = [createEvent({ id: 'b', startAt: at(10), endAt: at(10, 12) })];
    const created = [createEvent({ id: 'a', startAt: at(5), endAt: at(5, 12) })];

    expect(mergeUpcomingEvents(participated, created, NOW).map((event) => event.id)).toEqual([
      'a',
      'b',
    ]);
  });

  it('keeps a single entry for an event both created and joined', () => {
    const shared = createEvent({ id: 'same', startAt: at(5), endAt: at(5, 12) });

    expect(mergeUpcomingEvents([shared], [shared], NOW)).toHaveLength(1);
  });

  it.each([
    EventState.EVENT_STATE_FINISHED,
    EventState.EVENT_STATE_CANCELLED,
    EventState.EVENT_STATE_DRAFT,
  ])('drops events in state %s', (state) => {
    const events = [createEvent({ id: 'x', state, startAt: at(5), endAt: at(5, 12) })];

    expect(mergeUpcomingEvents(events, [], NOW)).toEqual([]);
  });

  it('drops events whose end date is already past', () => {
    const past = createEvent({
      id: 'past',
      startAt: new Date(2026, 9, 1).toISOString(),
      endAt: new Date(2026, 9, 2).toISOString(),
    });

    expect(mergeUpcomingEvents([past], [], NOW)).toEqual([]);
  });

  it('keeps an event that is in progress right now', () => {
    const running = createEvent({
      id: 'running',
      state: EventState.EVENT_STATE_IN_PROGRESS,
      startAt: new Date(2026, 9, 31, 11).toISOString(),
      endAt: new Date(2026, 9, 31, 14).toISOString(),
    });

    expect(mergeUpcomingEvents([running], [], NOW)).toHaveLength(1);
  });
});
