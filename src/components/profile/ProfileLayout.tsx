import React from 'react';
import type { BadgeWeb } from '@volontariapp/contracts';
import { ProfileHeader } from './ProfileHeader';
import { ProfileSection } from './ProfileSection';
import { type ProfileStatItem } from './ProfileStats';
import { ProfileBadges } from './ProfileBadges';
import { ProfileSeeAllLink } from './profile-see-all-link';
import { ProfileEventsTabs } from './ProfileEventsTabs';
import type { PaginatedEventListData } from './profile-events.types';

interface ProfileLayoutProps {
  pseudo: string;
  avatarUrl?: string;
  bio?: string;
  impactScore?: number;
  stats: ProfileStatItem[];
  badges?: (BadgeWeb | string)[];
  /** Quand il est fourni, la section Badges propose « Tout voir » (catalogue complet). */
  onSeeAllBadges?: () => void;
  eventsTabs?: {
    finished?: PaginatedEventListData;
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
 * chaque contexte (édition, follow, posts, évènements, actions) passe
 * par `headerAction`, `bioAction` et `children`.
 */
export const ProfileLayout = ({
  pseudo,
  avatarUrl,
  bio,
  impactScore,
  stats,
  badges,
  onSeeAllBadges,
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
        impactScore={impactScore}
        stats={stats}
        headerAction={headerAction}
        bioAction={bioAction}
      />

      <ProfileSection
        title="Badges"
        action={
          onSeeAllBadges && (
            <ProfileSeeAllLink onPress={onSeeAllBadges} accessibilityLabel="Voir tous les badges" />
          )
        }
      >
        <ProfileBadges badges={badges} />
      </ProfileSection>

      {eventsTabs && (
        <ProfileEventsTabs
          finished={eventsTabs.finished}
          created={eventsTabs.created}
          wished={eventsTabs.wished}
        />
      )}

      {children}
    </>
  );
};
