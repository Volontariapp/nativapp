import type { AppTheme } from '@/shared/themes/theme';
import { EventState } from '@volontariapp/contracts';
import { normalizeEventState } from '@/shared/lib/event-mappers.utils';

export interface StatusConfig {
  label: string;
  icon: string;
  textColor: (theme: AppTheme) => string;
  bgColor: (theme: AppTheme) => string;
  borderColor: (theme: AppTheme) => string;
}

export function isEventDatePast(
  endDate?: string | Date | null,
  startDate?: string | Date | null,
  date?: string | Date | null,
): boolean {
  const target = endDate ?? date ?? startDate;
  if (target === undefined || target === null || target === '') return false;
  const time = typeof target === 'string' ? new Date(target).getTime() : target.getTime();
  if (Number.isNaN(time)) return false;
  return time < Date.now();
}

export function getEventStatusConfig(
  state: EventState | number | string,
  isPast = false,
): StatusConfig {
  const numericState = normalizeEventState(state);

  switch (numericState) {
    case EventState.EVENT_STATE_PUBLISHED:
      if (isPast) {
        return {
          label: 'Annulé',
          icon: 'slash',
          textColor: (theme) => theme.colors.danger,
          bgColor: (theme) => theme.colors.badgeRedBackground,
          borderColor: (theme) => theme.colors.badgeRedBorder,
        };
      }
      return {
        label: 'À venir',
        icon: 'clock',
        textColor: (theme) => theme.colors.primaryEco,
        bgColor: (theme) => theme.colors.badgeGreenBackground,
        borderColor: (theme) => theme.colors.badgeGreenBorder,
      };

    case EventState.EVENT_STATE_CANCELLED:
      return {
        label: 'Annulé',
        icon: 'slash',
        textColor: (theme) => theme.colors.danger,
        bgColor: (theme) => theme.colors.badgeRedBackground,
        borderColor: (theme) => theme.colors.badgeRedBorder,
      };

    case EventState.EVENT_STATE_IN_PROGRESS:
      return {
        label: 'En cours',
        icon: 'play-circle',
        textColor: (theme) => theme.colors.primarySocio,
        bgColor: (theme) => theme.colors.badgeSocioBackground,
        borderColor: (theme) => theme.colors.diamondBorder,
      };

    case EventState.EVENT_STATE_FINISHED:
      return {
        label: 'Terminé',
        icon: 'flag',
        textColor: (theme) => theme.colors.goldText,
        bgColor: (theme) => theme.colors.goldBackground,
        borderColor: (theme) => theme.colors.goldBorder,
      };

    case EventState.EVENT_STATE_DRAFT:
      return {
        label: 'Brouillon',
        icon: 'edit-3',
        textColor: (theme) => theme.colors.grey,
        bgColor: (theme) => theme.colors.lightGrey,
        borderColor: (theme) => theme.colors.grey,
      };

    default:
      return {
        label: 'Inconnu',
        icon: 'help-circle',
        textColor: (theme) => theme.colors.grey,
        bgColor: (theme) => theme.colors.lightGrey,
        borderColor: (theme) => theme.colors.grey,
      };
  }
}

/**
 * Un évènement terminé ou annulé ne peut plus être modifié. Un évènement publié dont la date est
 * passée s'affiche « Annulé » (voir getEventStatusConfig) : il est verrouillé de la même façon.
 */
export function isEventEditable(event: {
  state: EventState | number | string;
  endAt?: string | Date | null;
  startAt?: string | Date | null;
}): boolean {
  const state = normalizeEventState(event.state);
  if (state === EventState.EVENT_STATE_FINISHED || state === EventState.EVENT_STATE_CANCELLED) {
    return false;
  }
  return !(
    state === EventState.EVENT_STATE_PUBLISHED && isEventDatePast(event.endAt, event.startAt)
  );
}
