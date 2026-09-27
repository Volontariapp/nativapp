import type { AppTheme } from '@/shared/themes/theme';
import type { BadgeDefinition, BadgeSize } from './badge.types';

export const BADGE_SIZE_CONFIG: Record<
  BadgeSize,
  {
    containerSize: number;
    iconSize: number;
    fontSize: number;
    pillFontSize: number;
    pillPaddingH: number;
    pillPaddingV: number;
    borderWidth: number;
  }
> = {
  sm: {
    containerSize: 42,
    iconSize: 18,
    fontSize: 15,
    pillFontSize: 8,
    pillPaddingH: 3,
    pillPaddingV: 1,
    borderWidth: 2,
  },
  md: {
    containerSize: 58,
    iconSize: 26,
    fontSize: 20,
    pillFontSize: 9,
    pillPaddingH: 4,
    pillPaddingV: 2,
    borderWidth: 2,
  },
  lg: {
    containerSize: 76,
    iconSize: 34,
    fontSize: 26,
    pillFontSize: 11,
    pillPaddingH: 6,
    pillPaddingV: 2,
    borderWidth: 2.5,
  },
  xl: {
    containerSize: 96,
    iconSize: 44,
    fontSize: 34,
    pillFontSize: 13,
    pillPaddingH: 8,
    pillPaddingV: 3,
    borderWidth: 3,
  },
};

export interface MedallionColorConfig {
  backgroundColor: string;
  borderColor: string;
  iconColor: string;
  textColor: string;
  isDiamond?: boolean;
  borderWidthBoost?: number;
}

export function getMedallionColors(def: BadgeDefinition, theme: AppTheme): MedallionColorConfig {
  switch (def.variant) {
    case 'EVENT_PARTICIPATION_TIER_1':
      return {
        backgroundColor: theme.colors.bronzeBackground,
        borderColor: theme.colors.bronze,
        iconColor: theme.colors.bronze,
        textColor: theme.colors.bronzeText,
      };
    case 'EVENT_PARTICIPATION_TIER_2':
      return {
        backgroundColor: theme.colors.silverBackground,
        borderColor: theme.colors.silver,
        iconColor: theme.colors.silver,
        textColor: theme.colors.silverText,
      };
    case 'EVENT_PARTICIPATION_TIER_3':
      return {
        backgroundColor: theme.colors.goldBackground,
        borderColor: theme.colors.gold,
        iconColor: theme.colors.gold,
        textColor: theme.colors.goldText,
      };
    case 'EVENT_PARTICIPATION_TIER_4':
      return {
        backgroundColor: theme.colors.diamondBackground,
        borderColor: theme.colors.diamond,
        iconColor: theme.colors.diamond,
        textColor: theme.colors.diamondText,
        isDiamond: true,
      };
    case 'EVENT_SOCIAL_TIER_1':
    case 'EVENT_SOCIAL_TIER_2':
      return {
        backgroundColor: theme.colors.badgeSocioBackground,
        borderColor: theme.colors.primarySocio,
        iconColor: theme.colors.primarySocio,
        textColor: theme.colors.primarySocio,
      };
    case 'EVENT_ECOLOGY_TIER_1':
    case 'EVENT_ECOLOGY_TIER_2':
      return {
        backgroundColor: theme.colors.badgeEcoBackground,
        borderColor: theme.colors.primaryEco,
        iconColor: theme.colors.primaryEco,
        textColor: theme.colors.primaryEco,
      };
    case 'EVENT_HYBRID_ECO_SOCIAL_TIER_1':
      return {
        backgroundColor: theme.colors.badgeEcoBackground,
        borderColor: theme.colors.primarySocio,
        iconColor: theme.colors.primaryEco,
        textColor: theme.colors.primaryEco,
        borderWidthBoost: 1.5,
      };
    case 'SOCIAL_LIKE_COUNT_10':
      return {
        backgroundColor: theme.colors.badgeRedBackground,
        borderColor: theme.colors.badgeRedBorder,
        iconColor: theme.colors.badgeRed,
        textColor: theme.colors.badgeRed,
      };
    case 'EVENT_WISHLIST_COUNT_10':
      return {
        backgroundColor: theme.colors.badgeGreenBackground,
        borderColor: theme.colors.badgeGreenBorder,
        iconColor: theme.colors.badgeGreen,
        textColor: theme.colors.badgeGreen,
      };
    case 'COMMUNITY_POST_COUNT_1':
      return {
        backgroundColor: theme.colors.badgeNeutralBackground,
        borderColor: theme.colors.badgeNeutralBorder,
        iconColor: theme.colors.badgeNeutral,
        textColor: theme.colors.badgeNeutral,
      };
    case 'EVENT_HOST_COUNT_1':
    default:
      return {
        backgroundColor: theme.colors.goldBackground,
        borderColor: theme.colors.goldBorder,
        iconColor: theme.colors.gold,
        textColor: theme.colors.goldText,
      };
  }
}
