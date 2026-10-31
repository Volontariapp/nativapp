import { computeEventScoring } from '@volontariapp/shared';
import type { ComputeEventScoringParams, EventScoringResult } from '@volontariapp/shared';

export interface EventPointsRange {
  /** Points du dernier rang simule. */
  min: number;
  /** Points du premier rang simule. */
  max: number;
}

export interface EventPointsEstimateInput {
  startAt: string;
  endAt: string;
  maxParticipants: number;
  organizerId?: string;
}

export type EventScoringCalculator = (params: ComputeEventScoringParams) => EventScoringResult;

/**
 * Au-dela de cette capacite, on n'affiche pas d'estimation : tronquer la
 * simulation fausserait le rapport N / beta de la formule, et la simuler en
 * entier a chaque carte d'une liste coute cher pour une valeur peu parlante.
 */
export const MAX_SIMULATED_ATTENDEES = 1000;

const CACHE_LIMIT = 200;
const SYNTHETIC_BASE_TIME = Date.UTC(2000, 0, 1);
const cache = new Map<string, EventPointsRange | null>();

export const clearEventPointsEstimateCache = (): void => {
  cache.clear();
};

const buildSyntheticAttendees = (count: number) =>
  Array.from({ length: count }, (_, index) => ({
    userId: `estimate-attendee-${String(index + 1)}`,
    registeredAt: SYNTHETIC_BASE_TIME + index * 1000,
  }));

/** Extrait premier et dernier rang d'un resultat du calculateur ; null si vide. */
export const extractPointsRange = (result: EventScoringResult): EventPointsRange | null => {
  if (result.participants.length === 0) return null;
  const ranked = [...result.participants].sort((a, b) => a.rank - b.rank);
  const first = ranked[0];
  const last = ranked[ranked.length - 1];
  if (!first || !last) return null;
  return { min: last.points, max: first.points };
};

const computeRange = (
  startMs: number,
  endMs: number,
  input: EventPointsEstimateInput,
  calculate: EventScoringCalculator,
): EventPointsRange | null => {
  const result = calculate({
    attendees: buildSyntheticAttendees(input.maxParticipants),
    startAt: startMs,
    endAt: endMs,
    maxParticipants: input.maxParticipants,
    organizerId: input.organizerId,
  });
  return extractPointsRange(result);
};

/**
 * Estime la fourchette de points d'un participant pour un evenement au bareme
 * v1, en simulant une salle pleine (N = maxParticipants). Renvoie null quand
 * l'estimation est impossible (capacite inutilisable, dates invalides).
 *
 * Le resultat est memoise par (debut, fin, capacite) : le calcul est pur, donc
 * une liste d'evenements de meme gabarit ne le refait qu'une fois.
 */
export const estimateEventPointsRange = (
  input: EventPointsEstimateInput,
  calculate: EventScoringCalculator = computeEventScoring,
): EventPointsRange | null => {
  const { maxParticipants } = input;
  if (!Number.isInteger(maxParticipants) || maxParticipants < 1) return null;
  if (maxParticipants > MAX_SIMULATED_ATTENDEES) return null;

  const startMs = Date.parse(input.startAt);
  const endMs = Date.parse(input.endAt);
  if (Number.isNaN(startMs) || Number.isNaN(endMs) || endMs <= startMs) return null;

  const key = `${String(startMs)}|${String(endMs)}|${String(maxParticipants)}`;
  if (cache.has(key)) return cache.get(key) ?? null;

  const range = computeRange(startMs, endMs, input, calculate);
  if (cache.size >= CACHE_LIMIT) cache.clear();
  cache.set(key, range);
  return range;
};

/** Evenements crees avant le bareme dynamique : points fixes, exacts. */
export const isLegacyScoring = (scoringVersion: number | undefined): boolean =>
  scoringVersion === undefined || scoringVersion < 1;
