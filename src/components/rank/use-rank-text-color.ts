import { useUserDistinction } from '@/api/user/hooks/use-user-distinction';
import { useAppTheme } from '@/context/ThemeContext';
import { rankPaletteKeys } from '@/shared/lib/rank/rank-palette';
import type { RankDistinction } from '@/shared/lib/rank/rank.types';
import type { AppTheme } from '@/shared/themes/theme';

/** Couleur de texte d'une distinction (jaune doré pour la couronne d'or), lisible sur fond clair et sombre. */
export const rankTextColor = (theme: AppTheme, distinction: RankDistinction): string =>
  theme.colors[rankPaletteKeys(distinction).text];

/**
 * Couleur à donner au pseudo d'un utilisateur du podium, ou `undefined` hors podium : le pseudo garde
 * alors sa couleur habituelle.
 */
export const useRankTextColor = (userId: string | undefined): string | undefined => {
  const { theme } = useAppTheme();
  const distinction = useUserDistinction(userId);
  return distinction === undefined ? undefined : rankTextColor(theme, distinction);
};
