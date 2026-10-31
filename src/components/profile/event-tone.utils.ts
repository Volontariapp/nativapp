import { EventType } from '@volontariapp/contracts';
import type { AppEvent } from '@/api/event/event.api';
import type { AppTheme } from '@/shared/themes/theme';
import { normalizeEventType } from '@/shared/lib/event-mappers.utils';

export interface EventTone {
  /** Couleur forte : texte, icône, liseré. */
  accent: string;
  /** Fond pastel assorti, lisible en thème clair comme sombre. */
  surface: string;
}

/** Couleurs d'un évènement selon son type : vert pour l'écologie, bleu pour le social. */
export const getEventTone = (type: AppEvent['type'], theme: AppTheme): EventTone => {
  switch (normalizeEventType(type)) {
    case EventType.EVENT_TYPE_ECOLOGY:
      return { accent: theme.colors.primaryEco, surface: theme.colors.badgeEcoBackground };
    case EventType.EVENT_TYPE_SOCIAL:
      return { accent: theme.colors.primarySocio, surface: theme.colors.badgeSocioBackground };
    default:
      return { accent: theme.colors.grey, surface: theme.colors.badgeNeutralBackground };
  }
};
