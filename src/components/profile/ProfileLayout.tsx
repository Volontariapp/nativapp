import React, { useMemo, useState } from 'react';
import type { BadgeWeb } from '@volontariapp/contracts';
import type { FollowListMode } from '@/api/social/hooks/use-infinite-follow-users';
import { ProfileHeader } from './ProfileHeader';
import { ProfileSection } from './ProfileSection';
import { type ProfileStatItem } from './ProfileStats';
import { ProfileBadges } from './ProfileBadges';
import { ProfileSeeAllLink } from './profile-see-all-link';
import { ProfileEventsTabs } from './ProfileEventsTabs';
import { UserListModal } from './user-list-modal';
import type { PaginatedEventListData } from './profile-events.types';

interface ProfileLayoutProps {
  userId?: string;
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
  userId,
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
  const [activeFollowModal, setActiveFollowModal] = useState<FollowListMode | null>(null);

  const interactiveStats = useMemo<ProfileStatItem[]>(() => {
    if (userId === undefined || userId.length === 0) {
      return stats;
    }
    return stats.map((stat) => {
      if (stat.onPress !== undefined) {
        return stat;
      }
      const normalized = stat.label.toLowerCase();
      if (normalized === 'follow' || normalized === 'abonnés') {
        return {
          ...stat,
          testID: stat.testID ?? 'profile-stat-followers',
          onPress: () => {
            setActiveFollowModal('followers');
          },
        };
      }
      if (normalized === 'suivi(e)s' || normalized === 'abonnements') {
        return {
          ...stat,
          testID: stat.testID ?? 'profile-stat-following',
          onPress: () => {
            setActiveFollowModal('following');
          },
        };
      }
      return stat;
    });
  }, [stats, userId]);

  return (
    <>
      <ProfileHeader
        userId={userId}
        pseudo={pseudo}
        avatarUrl={avatarUrl}
        bio={bio}
        impactScore={impactScore}
        stats={interactiveStats}
        headerAction={headerAction}
        bioAction={bioAction}
      />

      {userId !== undefined && activeFollowModal !== null && (
        <UserListModal
          userId={userId}
          mode={activeFollowModal}
          visible
          onClose={() => {
            setActiveFollowModal(null);
          }}
        />
      )}

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
