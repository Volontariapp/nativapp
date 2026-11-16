import { EventState, EventType } from '@volontariapp/contracts';
import type { AppEvent } from '@/api/event/event.api';
import { normalizeEventState } from '@/shared/lib/event-mappers.utils';
import type { AppTheme } from '@/shared/themes/theme';

export const MAP_PIN_SIZE_SMALL = 32;
export const MAP_PIN_SIZE_MEDIUM = 40;
export const MAP_PIN_SIZE_LARGE = 48;

export type MapPinScaleTier = 'small' | 'medium' | 'large';

const MEDIUM_PARTICIPANTS_THRESHOLD = 5;
const LARGE_PARTICIPANTS_THRESHOLD = 20;
const MEDIUM_FILL_RATIO_THRESHOLD = 0.4;
const LARGE_FILL_RATIO_THRESHOLD = 0.8;

export type MapPinEventInput = Pick<
  AppEvent,
  'state' | 'type' | 'currentParticipants' | 'maxParticipants' | 'startAt' | 'endAt'
>;

/**
 * Détermine le palier de taille (`small` | `medium` | `large`) d'un pin de carte
 * selon le nombre d'inscrits et le taux de remplissage.
 */
export const getMapPinScaleTier = (
  event: Pick<AppEvent, 'currentParticipants' | 'maxParticipants'>,
): MapPinScaleTier => {
  const current = Math.max(0, event.currentParticipants || 0);
  const max = Math.max(0, event.maxParticipants || 0);
  const fillRatio = max > 0 ? current / max : 0;

  if (current >= LARGE_PARTICIPANTS_THRESHOLD || fillRatio >= LARGE_FILL_RATIO_THRESHOLD) {
    return 'large';
  }

  if (current >= MEDIUM_PARTICIPANTS_THRESHOLD || fillRatio >= MEDIUM_FILL_RATIO_THRESHOLD) {
    return 'medium';
  }

  return 'small';
};

/**
 * Retourne la taille en pixels (32, 40 ou 48) du marqueur de carte.
 */
export const getMapPinSize = (
  event: Pick<AppEvent, 'currentParticipants' | 'maxParticipants'>,
): number => {
  const tier = getMapPinScaleTier(event);
  if (tier === 'large') return MAP_PIN_SIZE_LARGE;
  if (tier === 'medium') return MAP_PIN_SIZE_MEDIUM;
  return MAP_PIN_SIZE_SMALL;
};

/**
 * Indique si un événement est actuellement en cours (statut `IN_PROGRESS` ou plage horaire active).
 */
export const isMapEventOngoing = (
  event: Pick<AppEvent, 'state' | 'startAt' | 'endAt'>,
  nowMs: number = Date.now(),
): boolean => {
  const state = normalizeEventState(event.state);
  if (state === EventState.EVENT_STATE_IN_PROGRESS) {
    return true;
  }
  if (
    state === EventState.EVENT_STATE_FINISHED ||
    state === EventState.EVENT_STATE_CANCELLED ||
    state === EventState.EVENT_STATE_DRAFT
  ) {
    return false;
  }

  const startMs = event.startAt.length > 0 ? Date.parse(event.startAt) : Number.NaN;
  const endMs = event.endAt.length > 0 ? Date.parse(event.endAt) : Number.NaN;
  if (Number.isNaN(startMs) || Number.isNaN(endMs)) {
    return false;
  }
  return startMs <= nowMs && nowMs <= endMs;
};

/**
 * Détermine la couleur de fond du pin de carte selon le statut et le type d'événement.
 */
export const getMapPinColor = (event: MapPinEventInput, theme: AppTheme): string => {
  const state = normalizeEventState(event.state);

  if (state === EventState.EVENT_STATE_DRAFT) {
    return theme.colors.badgeNeutral;
  }

  if (
    state === EventState.EVENT_STATE_FINISHED ||
    state === EventState.EVENT_STATE_CANCELLED
  ) {
    return theme.colors.grey;
  }

  const isFull =
    event.maxParticipants > 0 && event.currentParticipants >= event.maxParticipants;
  if (isFull) {
    return theme.colors.warning;
  }

  const isSocial =
    event.type === EventType.EVENT_TYPE_SOCIAL ||
    (event.type as unknown) === 'EVENT_TYPE_SOCIAL';

  return isSocial ? theme.colors.primarySocio : theme.colors.primaryEco;
};

/**
 * Retourne la couleur de bordure du pin de carte : rouge (`theme.colors.danger`) si l'événement
 * est en cours, blanc (`theme.colors.white`) sinon.
 */
export const getMapPinBorderColor = (
  event: Pick<AppEvent, 'state' | 'startAt' | 'endAt'>,
  theme: AppTheme,
  nowMs: number = Date.now(),
): string => {
  if (isMapEventOngoing(event, nowMs)) {
    return theme.colors.danger;
  }
  return theme.colors.white;
};
