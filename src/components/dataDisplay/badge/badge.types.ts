import type { StyleProp, ViewStyle } from 'react-native';
import type { IconLibrary } from '@/shared/types/components';

export type BadgeVariant =
  | 'EVENT_PARTICIPATION_TIER_1'
  | 'EVENT_PARTICIPATION_TIER_2'
  | 'EVENT_PARTICIPATION_TIER_3'
  | 'EVENT_PARTICIPATION_TIER_4'
  | 'EVENT_SOCIAL_TIER_1'
  | 'EVENT_SOCIAL_TIER_2'
  | 'EVENT_ECOLOGY_TIER_1'
  | 'EVENT_ECOLOGY_TIER_2'
  | 'EVENT_HYBRID_ECO_SOCIAL_TIER_1'
  | 'SOCIAL_LIKE_COUNT_10'
  | 'EVENT_WISHLIST_COUNT_10'
  | 'COMMUNITY_POST_COUNT_1'
  | 'EVENT_HOST_COUNT_1';

export type BadgeCategory = 'participation' | 'interaction';

export type BadgeSize = 'sm' | 'md' | 'lg' | 'xl';

export interface BadgeDefinition {
  variant: BadgeVariant;
  name: string;
  description: string;
  category: BadgeCategory;
  categoryLabel: string;
  designDescription: string;
  icon?: string;
  iconLibrary?: IconLibrary;
  tierText?: string;
  badgeNumber?: number;
  isDiamond?: boolean;
  isHybrid?: boolean;
}

export interface BadgeProps {
  variant: BadgeVariant;
  size?: BadgeSize;
  showLabel?: boolean;
  onPress?: (variant: BadgeVariant) => void;
  disableModal?: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

export interface BadgeModalProps {
  visible: boolean;
  variant: BadgeVariant | null;
  onClose: () => void;
}
