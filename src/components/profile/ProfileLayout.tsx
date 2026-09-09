import React from 'react';
import type { BadgeWeb } from '@volontariapp/contracts';
import { ProfileHeader } from './ProfileHeader';
import { ProfileSection } from './ProfileSection';
import { type ProfileStatItem } from './ProfileStats';
import { ProfileBadges } from './ProfileBadges';
import { ProfileEventsTabs, type PaginatedEventListData } from './ProfileEventsTabs';

interface ProfileLayoutProps {
  pseudo: string;
  avatarUrl?: string;
  bio?: string;
  stats: ProfileStatItem[];
  badges: BadgeWeb[];
  eventsTabs?: {
    participated?: PaginatedEventListData;
    created?: PaginatedEventListData;
    wished?: PaginatedEventListData;
  };
  headerAction?: React.ReactNode;
  bioAction?: React.ReactNode;
  children?: React.ReactNode;
}

/**
 * Template partagé entre le profil privé (ProfileScreen) et le profil public
 * (PublicProfileScreen) : header, bio, stats, badges. Le contenu spécifique à
 * chaque contexte (édition, follow, calendrier, tabs d'événements, actions) passe
 * par `headerAction`, `bioAction` et `children`.
 */
export const ProfileLayout = ({
  pseudo,
  avatarUrl,
  bio,
  stats,
  badges,
  eventsTabs,
  headerAction,
  bioAction,
  children,
}: ProfileLayoutProps): React.JSX.Element => {
  return (
    <>
      <ProfileHeader
        pseudo={pseudo}
        avatarUrl={avatarUrl}
        bio={bio}
        stats={stats}
        headerAction={headerAction}
        bioAction={bioAction}
      />

      <ProfileSection title="Badges">
        <ProfileBadges badges={badges} />
      </ProfileSection>

      {eventsTabs && (
        <ProfileEventsTabs
          participated={eventsTabs.participated}
          created={eventsTabs.created}
          wished={eventsTabs.wished}
        />
      )}

      {children}
    </>
  );
};
