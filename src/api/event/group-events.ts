import { EventType } from '@volontariapp/contracts';
import { mapEventType, normalizeEventType } from '@/shared/lib/event-mappers.utils';
import type { AppEvent } from './event.api';

export interface EventGroup {
  type: EventType;
  title: string;
  data: AppEvent[];
}

/** Ordre des catégories ; un type non précisé tombe dans la dernière. */
const GROUP_ORDER: readonly EventType[] = [
  EventType.EVENT_TYPE_ECOLOGY,
  EventType.EVENT_TYPE_SOCIAL,
  EventType.EVENT_TYPE_UNSPECIFIED,
];

/** Catégorie d'un évènement ; tout type inconnu rejoint « non précisé ». */
const groupTypeOf = (event: AppEvent): EventType => {
  const type = normalizeEventType(event.type);
  return GROUP_ORDER.includes(type) ? type : EventType.EVENT_TYPE_UNSPECIFIED;
};

/** Regroupe les évènements par catégorie, sans catégorie vide, en gardant l'ordre reçu dans chacune. */
export const groupEventsByType = (events: AppEvent[]): EventGroup[] =>
  GROUP_ORDER.flatMap((type): EventGroup[] => {
    const data = events.filter((event) => groupTypeOf(event) === type);
    return data.length === 0 ? [] : [{ type, title: mapEventType(type), data }];
  });
