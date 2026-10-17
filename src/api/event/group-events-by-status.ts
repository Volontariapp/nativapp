import { getEventStatusConfig, isEventDatePast } from '@/components/event/event-status.utils';
import type { AppEvent } from './event.api';

export interface EventStatusGroup {
  /** Libellé affiché du statut (« À venir », « En cours »...), tel que dans le badge. */
  title: string;
  data: AppEvent[];
}

/** Ordre des sections ; un statut absent de la liste (« Inconnu ») vient en dernier. */
const STATUS_ORDER: readonly string[] = ['En cours', 'À venir', 'Brouillon', 'Terminé', 'Annulé'];

const orderOf = (title: string): number => {
  const index = STATUS_ORDER.indexOf(title);
  return index === -1 ? STATUS_ORDER.length : index;
};

/** Le statut montré à l'utilisateur : celui du badge, qui tient compte de la date de fin. */
const statusTitleOf = (event: AppEvent): string =>
  getEventStatusConfig(event.state, isEventDatePast(event.endAt, event.startAt)).label;

/** Regroupe les évènements par statut affiché, en gardant l'ordre reçu dans chaque groupe. */
export const groupEventsByStatus = (events: AppEvent[]): EventStatusGroup[] => {
  const groups = new Map<string, AppEvent[]>();
  for (const event of events) {
    const title = statusTitleOf(event);
    groups.set(title, [...(groups.get(title) ?? []), event]);
  }
  return [...groups.entries()]
    .map(([title, data]): EventStatusGroup => ({ title, data }))
    .sort((a, b) => orderOf(a.title) - orderOf(b.title));
};
