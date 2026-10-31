const LOCALE = 'fr-FR';
const DAY_IN_MS = 24 * 60 * 60 * 1000;
const DAYS_IN_WEEK = 7;
const DAYS_IN_MONTH = 30;

export interface EventDateParts {
  /** Jour du mois, sans zéro initial (« 7 »). */
  day: string;
  /** Mois abrégé en capitales, sans point (« NOV »). */
  month: string;
  /** Jour de la semaine abrégé en capitales, sans point (« SAM »). */
  weekday: string;
  /** Heure de début (« 09:30 »). */
  time: string;
  /** Date complète lisible (« samedi 7 novembre »). */
  longDate: string;
}

const parseDate = (value: string | undefined): Date | null => {
  if (value === undefined || value === '') return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const toShortLabel = (date: Date, option: 'month' | 'weekday'): string =>
  date
    .toLocaleDateString(LOCALE, { [option]: 'short' })
    .replace('.', '')
    .toUpperCase();

const startOfDay = (date: Date): number =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();

const plural = (count: number, singular: string, pluralForm = `${singular}s`): string =>
  `${String(count)} ${count > 1 ? pluralForm : singular}`;

/** Trie du plus proche au plus lointain ; les dates illisibles finissent en bas de liste. */
export const sortEventsByStartAt = <T extends { startAt: string }>(events: readonly T[]): T[] =>
  [...events].sort((left, right) => {
    const leftTime = parseDate(left.startAt)?.getTime() ?? Number.POSITIVE_INFINITY;
    const rightTime = parseDate(right.startAt)?.getTime() ?? Number.POSITIVE_INFINITY;
    if (leftTime === rightTime) return 0;
    return leftTime < rightTime ? -1 : 1;
  });

/** Trie du plus récent au plus ancien ; les dates illisibles finissent en bas de liste. */
export const sortEventsByStartAtDesc = <T extends { startAt: string }>(events: readonly T[]): T[] =>
  [...events].sort((left, right) => {
    const leftTime = parseDate(left.startAt)?.getTime() ?? Number.NEGATIVE_INFINITY;
    const rightTime = parseDate(right.startAt)?.getTime() ?? Number.NEGATIVE_INFINITY;
    if (leftTime === rightTime) return 0;
    return leftTime > rightTime ? -1 : 1;
  });

export const getEventDateParts = (startAt: string): EventDateParts | null => {
  const date = parseDate(startAt);
  if (date === null) return null;

  return {
    day: String(date.getDate()),
    month: toShortLabel(date, 'month'),
    weekday: toShortLabel(date, 'weekday'),
    time: date.toLocaleTimeString(LOCALE, { hour: '2-digit', minute: '2-digit' }),
    longDate: date.toLocaleDateString(LOCALE, { weekday: 'long', day: 'numeric', month: 'long' }),
  };
};

/**
 * Compte à rebours lisible (« Demain », « Dans 3 semaines »), calculé en jours calendaires
 * locaux. Renvoie null quand la date est illisible ou que l'évènement est déjà passé.
 */
export const getCountdownLabel = (
  startAt: string,
  endAt?: string,
  now: Date = new Date(),
): string | null => {
  const start = parseDate(startAt);
  if (start === null) return null;

  if (start.getTime() <= now.getTime()) {
    const end = parseDate(endAt);
    return end === null || now.getTime() < end.getTime() ? 'En ce moment' : null;
  }

  const days = Math.round((startOfDay(start) - startOfDay(now)) / DAY_IN_MS);
  if (days === 0) return "Aujourd'hui";
  if (days === 1) return 'Demain';
  if (days < DAYS_IN_WEEK) return `Dans ${String(days)} jours`;
  if (days < DAYS_IN_MONTH) return `Dans ${plural(Math.floor(days / DAYS_IN_WEEK), 'semaine')}`;
  return `Dans ${String(Math.floor(days / DAYS_IN_MONTH))} mois`;
};
