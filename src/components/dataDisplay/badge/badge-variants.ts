import React from 'react';
import { Badge } from './badge';
import type { BadgeProps, BadgeVariant } from './badge.types';

export type VariantBadgeProps = Omit<BadgeProps, 'variant'>;

export const Badges: Record<BadgeVariant, React.FC<VariantBadgeProps>> = {
  EVENT_PARTICIPATION_TIER_1: (props) =>
    React.createElement(Badge, { variant: 'EVENT_PARTICIPATION_TIER_1', ...props }),
  EVENT_PARTICIPATION_TIER_2: (props) =>
    React.createElement(Badge, { variant: 'EVENT_PARTICIPATION_TIER_2', ...props }),
  EVENT_PARTICIPATION_TIER_3: (props) =>
    React.createElement(Badge, { variant: 'EVENT_PARTICIPATION_TIER_3', ...props }),
  EVENT_PARTICIPATION_TIER_4: (props) =>
    React.createElement(Badge, { variant: 'EVENT_PARTICIPATION_TIER_4', ...props }),
  EVENT_SOCIAL_TIER_1: (props) =>
    React.createElement(Badge, { variant: 'EVENT_SOCIAL_TIER_1', ...props }),
  EVENT_SOCIAL_TIER_2: (props) =>
    React.createElement(Badge, { variant: 'EVENT_SOCIAL_TIER_2', ...props }),
  EVENT_ECOLOGY_TIER_1: (props) =>
    React.createElement(Badge, { variant: 'EVENT_ECOLOGY_TIER_1', ...props }),
  EVENT_ECOLOGY_TIER_2: (props) =>
    React.createElement(Badge, { variant: 'EVENT_ECOLOGY_TIER_2', ...props }),
  EVENT_HYBRID_ECO_SOCIAL_TIER_1: (props) =>
    React.createElement(Badge, { variant: 'EVENT_HYBRID_ECO_SOCIAL_TIER_1', ...props }),
  SOCIAL_LIKE_COUNT_10: (props) =>
    React.createElement(Badge, { variant: 'SOCIAL_LIKE_COUNT_10', ...props }),
  EVENT_WISHLIST_COUNT_10: (props) =>
    React.createElement(Badge, { variant: 'EVENT_WISHLIST_COUNT_10', ...props }),
  COMMUNITY_POST_COUNT_1: (props) =>
    React.createElement(Badge, { variant: 'COMMUNITY_POST_COUNT_1', ...props }),
  EVENT_HOST_COUNT_1: (props) =>
    React.createElement(Badge, { variant: 'EVENT_HOST_COUNT_1', ...props }),
};
