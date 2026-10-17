import { EventType } from '@volontariapp/contracts';
import { createEvent } from '@/components/event/__tests__/event-app.factory';
import { groupEventsByType } from '../group-events';

describe('groupEventsByType', () => {
  it('groups events by category in a fixed order and drops empty categories', () => {
    const groups = groupEventsByType([
      createEvent({ id: 'social-1', type: EventType.EVENT_TYPE_SOCIAL }),
      createEvent({ id: 'eco-1', type: EventType.EVENT_TYPE_ECOLOGY }),
      createEvent({ id: 'social-2', type: EventType.EVENT_TYPE_SOCIAL }),
    ]);

    expect(groups.map((group) => group.title)).toEqual(['Écologie', 'Social']);
    expect(groups[0]?.data.map((event) => event.id)).toEqual(['eco-1']);
    expect(groups[1]?.data.map((event) => event.id)).toEqual(['social-1', 'social-2']);
  });

  it('keeps the received order inside a category', () => {
    const groups = groupEventsByType([
      createEvent({ id: 'b', type: EventType.EVENT_TYPE_ECOLOGY }),
      createEvent({ id: 'a', type: EventType.EVENT_TYPE_ECOLOGY }),
    ]);

    expect(groups[0]?.data.map((event) => event.id)).toEqual(['b', 'a']);
  });

  it('puts an unspecified or unknown type in the last category', () => {
    const groups = groupEventsByType([
      createEvent({ id: 'none', type: EventType.EVENT_TYPE_UNSPECIFIED }),
      createEvent({ id: 'eco', type: EventType.EVENT_TYPE_ECOLOGY }),
      Object.assign(createEvent({ id: 'weird' }), { type: 999 }),
    ]);

    expect(groups.map((group) => group.type)).toEqual([
      EventType.EVENT_TYPE_ECOLOGY,
      EventType.EVENT_TYPE_UNSPECIFIED,
    ]);
    expect(groups[1]?.data.map((event) => event.id)).toEqual(['none', 'weird']);
  });

  it('returns no category for no event', () => {
    expect(groupEventsByType([])).toEqual([]);
  });
});
