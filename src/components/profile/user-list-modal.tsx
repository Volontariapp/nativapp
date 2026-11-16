import React, { useContext, useMemo } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AppText } from '@/components/typography/AppText';
import { UserAvatar } from '@/components/media/UserAvatar';
import { PostFollowButton } from '@/components/post/PostFollowButton';
import { AuthContext } from '@/context/AuthContext';
import { useAppTheme, useStyles } from '@/context/ThemeContext';
import {
  useInfiniteFollowUsers,
  type FollowListMode,
} from '@/api/social/hooks/use-infinite-follow-users';
import { useMyFollowedIds } from '@/api/social/hooks/use-my-followed-ids';
import { resolveAvatarUrl } from '@/api/user/resolve-avatar-url';
import type { UserPublicProfile } from '@/api/user/user.api';
import { dedupeById } from '@/shared/utils/dedupe-by-id';
import type { MainStackParamList } from '@/navigation/stacks/MainStack';
import type { AppTheme } from '@/shared/themes/theme';

const PAGE_SIZE = 20;

export interface UserListModalProps {
  userId: string;
  mode: FollowListMode;
  visible: boolean;
  onClose: () => void;
}

export function UserListModal({
  userId,
  mode,
  visible,
  onClose,
}: UserListModalProps): React.JSX.Element {
  const { theme } = useAppTheme();
  const styles = useStyles(createStyles);
  const navigation = useNavigation<NativeStackNavigationProp<MainStackParamList>>();
  const currentUserId = useContext(AuthContext)?.userId ?? null;
  const isSelf = currentUserId !== null && currentUserId === userId;

  const {
    data,
    isLoading,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useInfiniteFollowUsers(visible ? userId : undefined, mode, isSelf, PAGE_SIZE);

  const { followedIds } = useMyFollowedIds(visible);

  const users = useMemo(
    () => dedupeById(data?.pages.flatMap((page) => page.users) ?? []),
    [data],
  );
  const totalCount = data?.pages[0]?.totalCount ?? users.length;

  const title =
    mode === 'followers'
      ? `Abonnés (${String(totalCount)})`
      : `Suivi(e)s (${String(totalCount)})`;
  const emptyLabel =
    mode === 'followers'
      ? 'Aucun abonné pour le moment.'
      : 'Aucun abonnement pour le moment.';

  const handleEndReached = (): void => {
    if (hasNextPage && !isFetchingNextPage) {
      void fetchNextPage();
    }
  };

  const handleUserPress = (targetUserId: string): void => {
    onClose();
    if (targetUserId === currentUserId) {
      navigation.navigate('MainTabs', { screen: 'profil' });
      return;
    }
    navigation.navigate('PublicProfile', { userId: targetUserId });
  };

  const renderUser = ({ item }: { item: UserPublicProfile }): React.JSX.Element => {
    const isMe = item.id === currentUserId;
    return (
      <Pressable
        testID={`user-list-modal-row-${item.id}`}
        style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
        onPress={() => {
          handleUserPress(item.id);
        }}
        accessibilityRole="button"
        accessibilityLabel={`Voir le profil de ${item.pseudo}`}
      >
        <UserAvatar uri={resolveAvatarUrl(item)} size={theme.components.avatar.md} />
        <View style={styles.identity}>
          <View style={styles.pseudoRow}>
            <AppText style={styles.pseudo} numberOfLines={1}>
              {item.pseudo}
            </AppText>
            {isMe && <AppText style={styles.meTag}>Vous</AppText>}
          </View>
          <AppText style={styles.subtitle}>
            {item.totalImpactScore > 0 ? `${String(item.totalImpactScore)} pts` : 'Bénévole'}
          </AppText>
        </View>
        <PostFollowButton authorId={item.id} knownIsFollowing={followedIds.has(item.id)} />
      </Pressable>
    );
  };

  return (
    <Modal animationType="slide" transparent visible={visible} onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <AppText style={styles.title}>{title}</AppText>
            <Pressable
              testID="user-list-modal-close"
              onPress={onClose}
              style={styles.closeButton}
              accessibilityRole="button"
              accessibilityLabel="Fermer"
            >
              <Feather name="x" size={24} color={theme.colors.text} />
            </Pressable>
          </View>

          {isLoading ? (
            <ActivityIndicator
              testID="user-list-modal-loader"
              style={styles.loader}
              color={theme.colors.primarySocio}
            />
          ) : (
            <FlatList
              data={users}
              keyExtractor={(item) => item.id}
              renderItem={renderUser}
              contentContainerStyle={styles.listContent}
              onEndReached={handleEndReached}
              onEndReachedThreshold={0.5}
              ListFooterComponent={
                isFetchingNextPage ? (
                  <ActivityIndicator
                    style={styles.footerLoader}
                    color={theme.colors.primarySocio}
                  />
                ) : null
              }
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <AppText style={styles.emptyText}>{emptyLabel}</AppText>
                </View>
              }
            />
          )}
        </View>
      </View>
    </Modal>
  );
}

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: theme.colors.blackOverlay,
      justifyContent: 'flex-end',
    },
    container: {
      backgroundColor: theme.colors.background,
      borderTopLeftRadius: theme.radius.lg,
      borderTopRightRadius: theme.radius.lg,
      maxHeight: '80%',
      minHeight: '50%',
      paddingBottom: theme.spacing.md,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: theme.spacing.lg,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.lightGrey,
    },
    title: {
      fontSize: 18,
      fontWeight: theme.typography.fontWeight.bold,
      fontFamily: theme.typography.fonts.primary,
      color: theme.colors.text,
    },
    closeButton: {
      padding: theme.spacing.xs,
    },
    loader: {
      flex: 1,
      padding: theme.spacing.xl,
    },
    footerLoader: {
      paddingVertical: theme.spacing.md,
    },
    listContent: {
      paddingHorizontal: theme.spacing.md,
      paddingBottom: theme.spacing.md,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: theme.spacing.sm,
      gap: theme.spacing.md,
    },
    rowPressed: {
      opacity: 0.75,
    },
    identity: {
      flex: 1,
    },
    pseudoRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.xs,
    },
    pseudo: {
      flexShrink: 1,
      fontSize: theme.typography.fontSize.md,
      fontWeight: theme.typography.fontWeight.semibold,
      color: theme.colors.text,
    },
    meTag: {
      fontSize: theme.typography.fontSize.xs,
      fontWeight: theme.typography.fontWeight.bold,
      color: theme.colors.info,
    },
    subtitle: {
      fontSize: theme.typography.fontSize.xs,
      color: theme.colors.grey,
    },
    emptyContainer: {
      padding: theme.spacing.xl,
      alignItems: 'center',
    },
    emptyText: {
      color: theme.colors.grey,
      fontStyle: 'italic',
    },
  });
