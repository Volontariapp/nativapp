import { useMemo } from 'react';
import type { ViewStyle } from 'react-native';
import { useUserDistinction } from '@/api/user/hooks/use-user-distinction';
import { useAppTheme } from '@/context/ThemeContext';
import { rankPaletteKeys } from '@/shared/lib/rank/rank-palette';
import type { RankDistinction, RankFrameIntensity } from '@/shared/lib/rank/rank.types';
import type { AppTheme } from '@/shared/themes/theme';

const BORDER_WIDTH: Record<RankFrameIntensity, number> = { strong: 2, medium: 2, thin: 1 };

export interface RankFrameOptions {
  /** Angles droits et sans halo : pour une bannière pleine largeur (en-tête de post). */
  squared?: boolean;
}

/** Style de cadre d'une distinction : bordure aux couleurs du thème, halo discret pour les cadres forts. */
export const buildRankFrameStyle = (
  theme: AppTheme,
  distinction: RankDistinction,
  intensity: RankFrameIntensity,
  options: RankFrameOptions = {},
): ViewStyle => {
  const keys = rankPaletteKeys(distinction);
  const borderColor = theme.colors[keys.border];
  const squared = options.squared === true;
  const base: ViewStyle = {
    borderColor,
    borderWidth: BORDER_WIDTH[intensity],
    borderRadius: squared ? 0 : theme.radius.md,
  };
  if (intensity === 'thin') return base;
  if (squared) return { ...base, backgroundColor: theme.colors[keys.background] };
  return {
    ...base,
    backgroundColor: theme.colors[keys.background],
    shadowColor: borderColor,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: intensity === 'strong' ? 0.5 : 0.3,
    shadowRadius: intensity === 'strong' ? 10 : 6,
  };
};

/**
 * Surcharge de style à poser sur un bloc qui existe déjà (carte de commentaire, bloc organisateur) :
 * `undefined` quand l'utilisateur n'est sur aucun podium, donc aucun changement visuel.
 */
export const useRankFrameStyle = (
  userId: string | undefined,
  intensity: RankFrameIntensity,
  options: RankFrameOptions = {},
): ViewStyle | undefined => {
  const { theme } = useAppTheme();
  const distinction = useUserDistinction(userId);
  const squared = options.squared === true;
  return useMemo(
    () =>
      distinction === undefined
        ? undefined
        : buildRankFrameStyle(theme, distinction, intensity, { squared }),
    [theme, distinction, intensity, squared],
  );
};
