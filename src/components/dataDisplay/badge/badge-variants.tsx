import React from 'react';
import { Badge } from './badge';
import type { BadgeProps, BadgeVariant } from './badge.types';

export type VariantBadgeProps = Omit<BadgeProps, 'variant'>;

export const Badges: Record<BadgeVariant, React.FC<VariantBadgeProps>> = {
  EVENT_PARTICIPATION_TIER_1: (props) => (
    <Badge variant="EVENT_PARTICIPATION_TIER_1" {...props} />
  ),
  EVENT_PARTICIPATION_TIER_2: (props) => (
    <Badge variant="EVENT_PARTICIPATION_TIER_2" {...props} />
  ),
  EVENT_PARTICIPATION_TIER_3: (props) => (
    <Badge variant="EVENT_PARTICIPATION_TIER_3" {...props} />
  ),
  EVENT_PARTICIPATION_TIER_4: (props) => (
    <Badge variant="EVENT_PARTICIPATION_TIER_4" {...props} />
  ),
  EVENT_SOCIAL_TIER_1: (props) => <Badge variant="EVENT_SOCIAL_TIER_1" {...props} />,
  EVENT_SOCIAL_TIER_2: (props) => <Badge variant="EVENT_SOCIAL_TIER_2" {...props} />,
  EVENT_ECOLOGY_TIER_1: (props) => <Badge variant="EVENT_ECOLOGY_TIER_1" {...props} />,
  EVENT_ECOLOGY_TIER_2: (props) => <Badge variant="EVENT_ECOLOGY_TIER_2" {...props} />,
  EVENT_HYBRID_ECO_SOCIAL_TIER_1: (props) => (
    <Badge variant="EVENT_HYBRID_ECO_SOCIAL_TIER_1" {...props} />
  ),
  SOCIAL_LIKE_COUNT_10: (props) => <Badge variant="SOCIAL_LIKE_COUNT_10" {...props} />,
  EVENT_WISHLIST_COUNT_10: (props) => <Badge variant="EVENT_WISHLIST_COUNT_10" {...props} />,
  COMMUNITY_POST_COUNT_1: (props) => <Badge variant="COMMUNITY_POST_COUNT_1" {...props} />,
  EVENT_HOST_COUNT_1: (props) => <Badge variant="EVENT_HOST_COUNT_1" {...props} />,
};

// Individual exports for direct one-line usage: <EVENT_PARTICIPATION_TIER_1 />
export const EVENT_PARTICIPATION_TIER_1 = Badges.EVENT_PARTICIPATION_TIER_1;
export const EVENT_PARTICIPATION_TIER_2 = Badges.EVENT_PARTICIPATION_TIER_2;
export const EVENT_PARTICIPATION_TIER_3 = Badges.EVENT_PARTICIPATION_TIER_3;
export const EVENT_PARTICIPATION_TIER_4 = Badges.EVENT_PARTICIPATION_TIER_4;
export const EVENT_SOCIAL_TIER_1 = Badges.EVENT_SOCIAL_TIER_1;
export const EVENT_SOCIAL_TIER_2 = Badges.EVENT_SOCIAL_TIER_2;
export const EVENT_ECOLOGY_TIER_1 = Badges.EVENT_ECOLOGY_TIER_1;
export const EVENT_ECOLOGY_TIER_2 = Badges.EVENT_ECOLOGY_TIER_2;
export const EVENT_HYBRID_ECO_SOCIAL_TIER_1 = Badges.EVENT_HYBRID_ECO_SOCIAL_TIER_1;
export const SOCIAL_LIKE_COUNT_10 = Badges.SOCIAL_LIKE_COUNT_10;
export const EVENT_WISHLIST_COUNT_10 = Badges.EVENT_WISHLIST_COUNT_10;
export const COMMUNITY_POST_COUNT_1 = Badges.COMMUNITY_POST_COUNT_1;
export const EVENT_HOST_COUNT_1 = Badges.EVENT_HOST_COUNT_1;
