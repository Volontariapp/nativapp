import type { AppTheme } from '@/shared/themes/theme';

export interface StatusSectionStyle {
  icon: string;
  color: string;
}

/**
 * Couleur et icône du titre de section d'un statut dans « Mes événements ». Indexé par le
 * libellé affiché (celui de `getEventStatusConfig`) : un statut inconnu reste neutre.
 */
export const getStatusSectionStyle = (title: string, theme: AppTheme): StatusSectionStyle => {
  switch (title) {
    case 'En cours':
      return { icon: 'play-circle', color: theme.colors.primarySocio };
    case 'À venir':
      return { icon: 'clock', color: theme.colors.warning };
    case 'Brouillon':
      return { icon: 'edit-3', color: theme.colors.grey };
    case 'Terminé':
      return { icon: 'check-circle', color: theme.colors.badgeGreen };
    case 'Annulé':
      return { icon: 'x-circle', color: theme.colors.badgeRed };
    default:
      return { icon: 'help-circle', color: theme.colors.grey };
  }
};
