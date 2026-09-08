import React from 'react';
import type { BadgeWeb } from '@volontariapp/contracts';
import { ProfileHeader } from './ProfileHeader';
import { ProfileSection } from './ProfileSection';
import { ProfileBio } from './ProfileBio';
import { ProfileStats, type ProfileStatItem } from './ProfileStats';
import { ProfileBadges } from './ProfileBadges';

interface ProfileLayoutProps {
  pseudo: string;
  avatarUrl?: string;
  bio?: string;
  stats: ProfileStatItem[];
  badges: BadgeWeb[];
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
  headerAction,
  bioAction,
  children,
}: ProfileLayoutProps): React.JSX.Element => {
  return (
    <>
      <ProfileHeader pseudo={pseudo} avatarUrl={avatarUrl} />
      {headerAction}

      <ProfileSection title="Bio">
        <ProfileBio bio={bio} />
        {bioAction}
      </ProfileSection>

      <ProfileSection title="Statistiques">
        <ProfileStats stats={stats} />
      </ProfileSection>

      <ProfileSection title="Badges">
        <ProfileBadges badges={badges} />
      </ProfileSection>

      {children}
    </>
  );
};
