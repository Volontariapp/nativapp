import { EventType } from '@volontariapp/contracts';
import { eventSchema } from '../event.schema';

describe('eventSchema validation', () => {
  const getValidEventData = () => {
    const startAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const endAt = new Date(startAt.getTime() + 4 * 60 * 60 * 1000);

    return {
      title: 'Nettoyage des berges',
      description: 'Collecte participative de déchets le long du fleuve.',
      localisationName: 'Quai de la Gare, Paris',
      type: EventType.EVENT_TYPE_ECOLOGY,
      maxParticipants: 20,
      startAt,
      endAt,
      requirements: [],
    };
  };

  it('validates a correct event with EVENT_TYPE_ECOLOGY', () => {
    const result = eventSchema.safeParse(getValidEventData());
    expect(result.success).toBe(true);
  });

  it('validates a correct event with EVENT_TYPE_SOCIAL', () => {
    const data = {
      ...getValidEventData(),
      type: EventType.EVENT_TYPE_SOCIAL,
    };
    const result = eventSchema.safeParse(data);
    expect(result.success).toBe(true);
  });

  it('rejects an event with EVENT_TYPE_UNSPECIFIED', () => {
    const data = {
      ...getValidEventData(),
      type: EventType.EVENT_TYPE_UNSPECIFIED,
    };
    const result = eventSchema.safeParse(data);
    expect(result.success).toBe(false);
    if (!result.success) {
      const typeError = result.error.issues.find((e) => e.path.includes('type'));
      expect(typeError?.message).toContain("Le type d'évènement est obligatoire");
    }
  });

  it('rejects an event without type (undefined)', () => {
    const data = {
      ...getValidEventData(),
      type: undefined,
    };
    const result = eventSchema.safeParse(data);
    expect(result.success).toBe(false);
  });

  it('rejects an event with startAt before today', () => {
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const data = {
      ...getValidEventData(),
      startAt: yesterday,
      endAt: new Date(yesterday.getTime() + 2 * 60 * 60 * 1000),
    };
    const result = eventSchema.safeParse(data);
    expect(result.success).toBe(false);
    if (!result.success) {
      const startAtError = result.error.issues.find((e) => e.path.includes('startAt'));
      expect(startAtError?.message).toContain("antérieure à aujourd'hui");
    }
  });

  it('rejects an event where endAt is before startAt', () => {
    const startAt = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000);
    const endAt = new Date(startAt.getTime() - 3600 * 1000);
    const data = {
      ...getValidEventData(),
      startAt,
      endAt,
    };
    const result = eventSchema.safeParse(data);
    expect(result.success).toBe(false);
    if (!result.success) {
      const endAtError = result.error.issues.find((e) => e.path.includes('endAt'));
      expect(endAtError?.message).toContain('après le début');
    }
  });
});
