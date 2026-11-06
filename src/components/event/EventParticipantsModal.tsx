import React, { useContext, useEffect, useMemo } from 'react';
import { ActivityIndicator, Modal, Pressable, SectionList, StyleSheet, View } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { UserWeb } from '@volontariapp/contracts';
import { AppText } from '@/components/typography/AppText';
import { UserAvatar } from '@/components/media/UserAvatar';
import { PostFollowButton } from '@/components/post/PostFollowButton';
import { AuthContext } from '@/context/AuthContext';
import { useAppTheme, useStyles } from '@/context/ThemeContext';
import { useInfiniteEventParticipants } from '@/api/event/hooks/use-infinite-event-participants';
import { useMyFollowedIds } from '@/api/social/hooks/use-my-followed-ids';
import { resolveAvatarUrl } from '@/api/user/resolve-avatar-url';
import { useFrozenSnapshot } from '@/hooks/use-frozen-snapshot';
import { shouldLoadNextPage } from '@/shared/lib/paging.utils';
import { dedupeById } from '@/shared/utils/dedupe-by-id';
import type { MainStackParamList } from '@/navigation/stacks/MainStack';
import type { AppTheme } from '@/shared/themes/theme';
import { buildParticipantSections } from './participants-list.utils';

const PAGE_SIZE = 50;
/** 50 x 6 : la liste est chargee en entier, dans une limite qui borne le cout reseau. */
const MAX_PAGES = 6;

interface EventParticipantsModalProps {
  eventId: string;
  visible: boolean;
  onClose: () => void;
}

/**
 * Tous les participants d'un evenement. Les comptes que je suis viennent en premier, chacun avec un
 * bouton Suivre / Suivi. L'ordre est fige a l'ouverture : suivre quelqu'un depuis la liste ne le
 * fait pas sauter de section sous le doigt.
 */
export function EventParticipantsModal({
  eventId,
  visible,
  onClose,
}: EventParticipantsModalProps): React.JSX.Element {
  const { theme } = useAppTheme();
  const styles = useStyles(createStyles);
  const navigation = useNavigation<NativeStackNavigationProp<MainStackParamList>>();
  const currentUserId = useContext(AuthContext)?.userId ?? null;

  const participantsQuery = useInfiniteEventParticipants(
    visible ? eventId : undefined,
    PAGE_SIZE,
  );
  const { hasNextPage, isFetchingNextPage, fetchNextPage } = participantsQuery;
  const loadedPages = participantsQuery.data?.pages.length ?? 0;

  useEffect(() => {
    if (shouldLoadNextPage({ hasNextPage, isFetchingNextPage, loadedPages, maxPages: MAX_PAGES })) {
      void fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, loadedPages, fetchNextPage]);

  const { followedIds, isLoading: isFollowsLoading } = useMyFollowedIds(visible);
  const orderingIds = useFrozenSnapshot(followedIds, !isFollowsLoading, visible);

  const participants = useMemo(
    () => dedupeById(participantsQuery.data?.pages.flatMap((page) => page.participants) ?? []),
    [participantsQuery.data],
  );
  const totalCount = participantsQuery.data?.pages[0]?.totalCount ?? participants.length;

  const hasMorePages = hasNextPage && loadedPages < MAX_PAGES;
  const isLoading = participantsQuery.isLoading || hasMorePages || orderingIds === null;

  const sections = useMemo(
    () =>
      orderingIds === null
        ? []
        : buildParticipantSections({ participants, followedIds: orderingIds, currentUserId }),
    [participants, orderingIds, currentUserId],
  );

  const goToProfile = (userId: string): void => {
    onClose();
    navigation.navigate('PublicProfile', { userId });
  };

  const renderParticipant = ({ item }: { item: UserWeb }): React.JSX.Element => {
    const isMe = item.id === currentUserId;
    return (
      <Pressable
        testID={`participants-modal-row-${item.id}`}
        style={styles.row}
        disabled={isMe}
        onPress={() => {
          goToProfile(item.id);
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
            <AppText style={styles.title}>{`Participants (${String(totalCount)})`}</AppText>
            <Pressable
              testID="participants-modal-close"
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
              testID="participants-modal-loader"
              style={styles.loader}
              color={theme.colors.primarySocio}
            />
          ) : (
            <SectionList
              sections={sections}
              keyExtractor={(item) => item.id}
              renderItem={renderParticipant}
              renderSectionHeader={({ section }) => (
                <View style={styles.sectionHeader}>
                  <AppText style={styles.sectionTitle}>{section.title}</AppText>
                </View>
              )}
              stickySectionHeadersEnabled
              contentContainerStyle={styles.listContent}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <AppText style={styles.emptyText}>Aucun participant pour le moment.</AppText>
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
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
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
      fontWeight: 'bold',
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
    listContent: {
      paddingHorizontal: theme.spacing.md,
      paddingBottom: theme.spacing.md,
    },
    sectionHeader: {
      backgroundColor: theme.colors.background,
      paddingTop: theme.spacing.md,
      paddingBottom: theme.spacing.xs,
    },
    sectionTitle: {
      fontSize: theme.typography.fontSize.sm,
      fontWeight: theme.typography.fontWeight.bold,
      color: theme.colors.grey,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: theme.spacing.sm,
      gap: theme.spacing.md,
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
