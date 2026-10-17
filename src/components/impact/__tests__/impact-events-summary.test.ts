import { EventState } from '@volontariapp/contracts';
import { createEvent } from '@/components/event/__tests__/event-app.factory';
import { summarizeImpactEvents } from '../impact-events-summary.utils';

const NOW = new Date('2026-10-17T12:00:00.000Z');

describe('summarizeImpactEvents', () => {
  it('returns zero and no event for an empty list', () => {
    expect(summarizeImpactEvents([], NOW)).toEqual({ finishedCount: 0, nextEvent: null });
  });

  it('counts only the finished events', () => {
    const events = [
      createEvent({ id: 'a', state: EventState.EVENT_STATE_FINISHED }),
      createEvent({ id: 'b', state: EventState.EVENT_STATE_FINISHED }),
      createEvent({ id: 'c', state: EventState.EVENT_STATE_CANCELLED }),
      createEvent({ id: 'd', state: EventState.EVENT_STATE_PUBLISHED }),
    ];

    expect(summarizeImpactEvents(events, NOW).finishedCount).toBe(2);
  });

  it('picks the earliest upcoming event', () => {
    const events = [
      createEvent({
        id: 'late',
        title: 'Tard',
        startAt: '2026-12-01T10:00:00.000Z',
        endAt: '2026-12-01T12:00:00.000Z',
      }),
      createEvent({
        id: 'soon',
        title: 'Bientôt',
        startAt: '2026-10-20T10:00:00.000Z',
        endAt: '2026-10-20T12:00:00.000Z',
      }),
    ];

    expect(summarizeImpactEvents(events, NOW).nextEvent).toEqual({
      title: 'Bientôt',
      startAt: '2026-10-20T10:00:00.000Z',
    });
  });

  it('ignores cancelled, finished and already ended events', () => {
    const events = [
      createEvent({
        id: 'x',
        state: EventState.EVENT_STATE_CANCELLED,
        startAt: '2026-10-20T10:00:00.000Z',
        endAt: '2026-10-20T12:00:00.000Z',
      }),
      createEvent({
        id: 'y',
        state: EventState.EVENT_STATE_FINISHED,
        startAt: '2026-10-20T10:00:00.000Z',
        endAt: '2026-10-20T12:00:00.000Z',
      }),
      createEvent({
        id: 'z',
        startAt: '2026-10-01T10:00:00.000Z',
        endAt: '2026-10-01T12:00:00.000Z',
      }),
    ];

    expect(summarizeImpactEvents(events, NOW).nextEvent).toBeNull();
  });

  it('keeps an event that started but has not ended yet', () => {
    const events = [
      createEvent({
        id: 'live',
        title: 'En cours',
        startAt: '2026-10-17T10:00:00.000Z',
        endAt: '2026-10-17T18:00:00.000Z',
        state: EventState.EVENT_STATE_IN_PROGRESS,
      }),
    ];

    expect(summarizeImpactEvents(events, NOW).nextEvent?.title).toBe('En cours');
  });
});
