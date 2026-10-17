import { EventState } from '@volontariapp/contracts';
import { createEvent } from '@/components/event/__tests__/event-app.factory';
import { groupEventsByStatus } from '../group-events-by-status';

const FUTURE = { startAt: '2999-10-15T10:00:00.000Z', endAt: '2999-10-15T12:00:00.000Z' };
const PAST = { startAt: '2001-10-15T10:00:00.000Z', endAt: '2001-10-15T12:00:00.000Z' };

describe('groupEventsByStatus', () => {
  it('groups the events of the same status under one title', () => {
    const groups = groupEventsByStatus([
      createEvent({ id: 'a', state: EventState.EVENT_STATE_PUBLISHED, ...FUTURE }),
      createEvent({ id: 'b', state: EventState.EVENT_STATE_PUBLISHED, ...FUTURE }),
    ]);

    expect(groups).toHaveLength(1);
    expect(groups[0]?.title).toBe('À venir');
    expect(groups[0]?.data.map((event) => event.id)).toEqual(['a', 'b']);
  });

  it('orders the sections: in progress, upcoming, draft, finished, cancelled', () => {
    const groups = groupEventsByStatus([
      createEvent({ id: 'cancelled', state: EventState.EVENT_STATE_CANCELLED }),
      createEvent({ id: 'finished', state: EventState.EVENT_STATE_FINISHED }),
      createEvent({ id: 'draft', state: EventState.EVENT_STATE_DRAFT }),
      createEvent({ id: 'upcoming', state: EventState.EVENT_STATE_PUBLISHED, ...FUTURE }),
      createEvent({ id: 'live', state: EventState.EVENT_STATE_IN_PROGRESS }),
    ]);

    expect(groups.map((group) => group.title)).toEqual([
      'En cours',
      'À venir',
      'Brouillon',
      'Terminé',
      'Annulé',
    ]);
  });

  it('files a published event whose date has passed under the same title as its badge', () => {
    const groups = groupEventsByStatus([
      createEvent({ id: 'late', state: EventState.EVENT_STATE_PUBLISHED, ...PAST }),
      createEvent({ id: 'cancelled', state: EventState.EVENT_STATE_CANCELLED }),
    ]);

    expect(groups.map((group) => group.title)).toEqual(['Annulé']);
    expect(groups[0]?.data.map((event) => event.id)).toEqual(['late', 'cancelled']);
  });

  it('puts an unknown state last', () => {
    const groups = groupEventsByStatus([
      Object.assign(createEvent({ id: 'weird' }), { state: 999 }),
      createEvent({ id: 'live', state: EventState.EVENT_STATE_IN_PROGRESS }),
    ]);

    expect(groups.map((group) => group.title)).toEqual(['En cours', 'Inconnu']);
  });

  it('returns no section for no event', () => {
    expect(groupEventsByStatus([])).toEqual([]);
  });
});
