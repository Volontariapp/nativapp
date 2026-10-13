import React, { useState, useCallback } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { theme } from '@/shared/themes/theme';
import { AdminModal } from '@/components/admin/ui/AdminModal';
import { AppButton } from '@/components/buttons/AppButton';
import type { UserWeb, Event } from '@volontariapp/contracts';
import { AdminInspectorUserItem } from './AdminInspectorUserItem';
import { AdminInspectorEventItem } from './AdminInspectorEventItem';
import { AdminInspectorBadgeItem } from './AdminInspectorBadgeItem';
import { AdminUserEditModal } from '../AdminUserEditModal';
import { AdminRelationPickerModal } from './AdminRelationPickerModal';
import { AdminEventDetailsModal } from '../../events/AdminEventDetailsModal';
import { AdminInspectorSectionHeader } from './AdminInspectorSectionHeader';
import { AdminInspectorSectionBody } from './AdminInspectorSectionBody';
import { AdminInspectorPostItem } from './AdminInspectorPostItem';
import type { AdminUserInspectorModalProps, PickerConfig } from './admin-user-inspector.types';
import {
  useAdminUserWishedEvents,
  useAdminUserParticipatedEvents,
  useAdminUserFollowers,
  useAdminUserFollows,
  useAdminUserBlocks,
  useAdminUserPosts,
  useAdminUnwishEvent,
  useAdminUnparticipateEvent,
  useAdminUnfollowUser,
  useAdminUnblockUser,
  useAdminWishEvent,
  useAdminParticipateEvent,
  useAdminFollowUser,
  useAdminBlockUser,
} from '@/api/admin/hooks/use-admin-social';
import {
  useUpdateUserMutation,
  useAdminUserQuery,
  useAdminAddBadgeMutation,
  useAdminRemoveBadgeMutation,
} from '@/api/admin/hooks/use-admin-users';

export function AdminUserInspectorModal({
  visible,
  user,
  onClose,
}: AdminUserInspectorModalProps): React.JSX.Element | null {
  const [selectedUser, setSelectedUser] = useState<UserWeb | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [pickerConfig, setPickerConfig] = useState<PickerConfig | null>(null);

  const userId = user?.id ?? '';

  const { data: userData, isLoading: userLoading } = useAdminUserQuery(userId);
  const { data: wishesData, isLoading: wishesLoading } = useAdminUserWishedEvents(userId);
  const { data: participationsData, isLoading: participationsLoading } =
    useAdminUserParticipatedEvents(userId);
  const { data: followersData, isLoading: followersLoading } = useAdminUserFollowers(userId);
  const { data: followsData, isLoading: followsLoading } = useAdminUserFollows(userId);
  const { data: blocksData, isLoading: blocksLoading } = useAdminUserBlocks(userId);
  const { data: postsData, isLoading: postsLoading } = useAdminUserPosts(userId);

  const unwishMutation = useAdminUnwishEvent();
  const wishMutation = useAdminWishEvent();
  const unparticipateMutation = useAdminUnparticipateEvent();
  const participateMutation = useAdminParticipateEvent();
  const unfollowMutation = useAdminUnfollowUser();
  const followMutation = useAdminFollowUser();
  const unblockMutation = useAdminUnblockUser();
  const blockMutation = useAdminBlockUser();
  const addBadgeMutation = useAdminAddBadgeMutation(userId);
  const removeBadgeMutation = useAdminRemoveBadgeMutation(userId);
  const updateUserMutation = useUpdateUserMutation(() => {
    setSelectedUser(null);
  });

  const badges = userData?.user?.badges ?? user?.badges ?? [];

  const handlePickerSelect = useCallback(
    (id: string) => {
      if (!pickerConfig) return;
      if (pickerConfig.action === 'badges') {
        addBadgeMutation.mutate(id);
      } else if (pickerConfig.action === 'wishes') {
        wishMutation.mutate({ userId, eventId: id });
      } else if (pickerConfig.action === 'participations') {
        participateMutation.mutate({ userId, eventId: id });
      } else if (pickerConfig.action === 'follows') {
        followMutation.mutate({ userId, followedId: id });
      } else {
        // 'blocks'
        blockMutation.mutate({ userId, blockedId: id });
      }
      setPickerConfig(null);
    },
    [
      pickerConfig,
      userId,
      addBadgeMutation,
      wishMutation,
      participateMutation,
      followMutation,
      blockMutation,
    ],
  );

  const handlePickerClose = useCallback(() => {
    setPickerConfig(null);
  }, []);

  if (!user) return null;

  const wishIds = (wishesData?.ids ?? []).filter((id) => id !== 'null');
  const participationIds = (participationsData?.ids ?? []).filter((id) => id !== 'null');
  const followerIds = (followersData?.ids ?? []).filter((id) => id !== 'null');
  const followIds = (followsData?.ids ?? []).filter((id) => id !== 'null');
  const blockIds = (blocksData?.ids ?? []).filter((id) => id !== 'null');
  const postIds = (postsData?.ids ?? []).filter((id) => id !== 'null');

  const pickerExcludeIds: string[] = (() => {
    if (pickerConfig?.mode === 'badges') {
      return badges.map((b) => b.id);
    }
    if (pickerConfig?.mode === 'events') {
      return pickerConfig.action === 'participations' ? participationIds : wishIds;
    }
    if (pickerConfig?.action === 'follows') return [userId, ...followIds];
    return [userId, ...blockIds];
  })();

  return (
    <AdminModal
      visible={visible}
      onClose={onClose}
      title={`Inspecteur: ${user.pseudo}`}
      scrollable={false}
    >
      <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.scrollContent}>
        {/* Badges attribués */}
        <View style={styles.section}>
          <AdminInspectorSectionHeader
            title="Badges attribués"
            count={badges.length}
            onAdd={() => {
              setPickerConfig({ mode: 'badges', action: 'badges' });
            }}
          />
          <AdminInspectorSectionBody isLoading={userLoading} hasItems={badges.length > 0}>
            {badges.map((badge) => (
              <AdminInspectorBadgeItem
                key={badge.id}
                badge={badge}
                onRemove={(badgeId) => {
                  removeBadgeMutation.mutate(badgeId);
                }}
                removeLoading={removeBadgeMutation.isPending}
              />
            ))}
          </AdminInspectorSectionBody>
        </View>

        {/* Événements likés */}
        <View style={styles.section}>
          <AdminInspectorSectionHeader
            title="Événements likés"
            count={wishIds.length}
            onAdd={() => {
              setPickerConfig({ mode: 'events', action: 'wishes' });
            }}
          />
          <AdminInspectorSectionBody isLoading={wishesLoading} hasItems={wishIds.length > 0}>
            {wishIds.map((eventId) => (
              <AdminInspectorEventItem
                key={eventId}
                eventId={eventId}
                onPress={setSelectedEvent}
                onRemove={(id) => {
                  unwishMutation.mutate({ userId, eventId: id });
                }}
                removeLoading={unwishMutation.isPending}
              />
            ))}
          </AdminInspectorSectionBody>
        </View>


        {/* Événements participés */}
        <View style={styles.section}>
          <AdminInspectorSectionHeader
            title="Événements participés"
            count={participationIds.length}
            onAdd={() => {
              setPickerConfig({ mode: 'events', action: 'participations' });
            }}
          />
          <AdminInspectorSectionBody
            isLoading={participationsLoading}
            hasItems={participationIds.length > 0}
          >
            {participationIds.map((eventId) => (
              <AdminInspectorEventItem
                key={eventId}
                eventId={eventId}
                onPress={setSelectedEvent}
                onRemove={(id) => {
                  unparticipateMutation.mutate({ userId, eventId: id });
                }}
                removeLoading={unparticipateMutation.isPending}
              />
            ))}
          </AdminInspectorSectionBody>
        </View>

        {/* Abonnés */}
        <View style={styles.section}>
          <AdminInspectorSectionHeader title="Abonnés (Followers)" count={followerIds.length} />
          <AdminInspectorSectionBody isLoading={followersLoading} hasItems={followerIds.length > 0}>
            {followerIds.map((id) => (
              <AdminInspectorUserItem key={id} userId={id} onPress={setSelectedUser} />
            ))}
          </AdminInspectorSectionBody>
        </View>

        {/* Abonnements */}
        <View style={styles.section}>
          <AdminInspectorSectionHeader
            title="Abonnements (Following)"
            count={followIds.length}
            onAdd={() => {
              setPickerConfig({ mode: 'users', action: 'follows' });
            }}
          />
          <AdminInspectorSectionBody isLoading={followsLoading} hasItems={followIds.length > 0}>
            {followIds.map((id) => (
              <AdminInspectorUserItem
                key={id}
                userId={id}
                onPress={setSelectedUser}
                onRemove={(followedId) => {
                  unfollowMutation.mutate({ userId, followedId });
                }}
                removeLoading={unfollowMutation.isPending}
              />
            ))}
          </AdminInspectorSectionBody>
        </View>

        {/* Bloqués */}
        <View style={styles.section}>
          <AdminInspectorSectionHeader
            title="Utilisateurs bloqués"
            count={blockIds.length}
            onAdd={() => {
              setPickerConfig({ mode: 'users', action: 'blocks' });
            }}
          />
          <AdminInspectorSectionBody isLoading={blocksLoading} hasItems={blockIds.length > 0}>
            {blockIds.map((id) => (
              <AdminInspectorUserItem
                key={id}
                userId={id}
                onPress={setSelectedUser}
                onRemove={(blockedId) => {
                  unblockMutation.mutate({ userId, blockedId });
                }}
                removeLoading={unblockMutation.isPending}
              />
            ))}
          </AdminInspectorSectionBody>
        </View>

        {/* Posts */}
        <View style={styles.section}>
          <AdminInspectorSectionHeader title="Posts possédés" count={postIds.length} />
          <AdminInspectorSectionBody isLoading={postsLoading} hasItems={postIds.length > 0}>
            {postIds.map((postId) => (
              <AdminInspectorPostItem key={postId} postId={postId} />
            ))}
          </AdminInspectorSectionBody>
        </View>
      </ScrollView>

      <View style={styles.modalActions}>
        <AppButton text="Fermer" variant="eco" onPress={onClose} />
      </View>

      <AdminUserEditModal
        visible={selectedUser !== null}
        user={selectedUser}
        onClose={() => {
          setSelectedUser(null);
        }}
        onSubmit={(id, data) => {
          updateUserMutation.mutate({ userId: id, payload: data });
        }}
        isLoading={updateUserMutation.isPending}
      />

      <AdminEventDetailsModal
        visible={selectedEvent !== null}
        event={selectedEvent}
        onClose={() => {
          setSelectedEvent(null);
        }}
      />

      <AdminRelationPickerModal
        visible={pickerConfig !== null}
        mode={pickerConfig?.mode ?? 'users'}
        excludeIds={pickerExcludeIds}
        onSelect={handlePickerSelect}
        onClose={handlePickerClose}
      />
    </AdminModal>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    maxHeight: 500,
  },
  scrollContent: {
    paddingBottom: theme.spacing.lg,
  },
  section: {
    marginBottom: theme.spacing.md,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: theme.spacing.md,
  },
});
