import React from 'react';
import { View, StyleSheet, Modal, Pressable, FlatList, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { AppText } from '@/components/typography/AppText';
import { theme } from '@/shared/themes/theme';
import { useGetPostLikers } from '@/api/user/hooks/use-get-post-likers';
import type { UserPublicProfile } from '@/api/user/user.api';

interface PostLikersModalProps {
  postId: string;
  visible: boolean;
  onClose: () => void;
}

const renderLiker = ({ item }: { item: UserPublicProfile }) => (
  <View style={styles.likerItem}>
    <View style={styles.avatarPlaceholder}>
      <Icon name="user" size={20} color={theme.colors.white} />
    </View>
    <AppText style={styles.likerPseudo}>@{item.pseudo}</AppText>
  </View>
);

export const PostLikersModal = ({ postId, visible, onClose }: PostLikersModalProps) => {
  const { data, isLoading } = useGetPostLikers(postId);

  const likers = data?.users ?? [];

  return (
    <Modal animationType="slide" transparent visible={visible} onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <AppText style={styles.title}>J'aime</AppText>
            <Pressable onPress={onClose} style={styles.closeButton}>
              <Icon name="x" size={24} color={theme.colors.black} />
            </Pressable>
          </View>

          {isLoading ? (
            <ActivityIndicator style={styles.loader} color={theme.colors.primarySocio} />
          ) : (
            <FlatList
              data={likers}
              keyExtractor={(item) => item.id}
              renderItem={renderLiker}
              contentContainerStyle={styles.listContent}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <AppText style={styles.emptyText}>Aucun J'aime pour le moment.</AppText>
                </View>
              }
            />
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
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
  },
  closeButton: {
    padding: theme.spacing.xs,
  },
  loader: {
    flex: 1,
    padding: theme.spacing.xl,
  },
  listContent: {
    padding: theme.spacing.md,
    gap: theme.spacing.md,
  },
  emptyContainer: {
    padding: theme.spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    color: theme.colors.grey,
    fontStyle: 'italic',
  },
  likerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.xs,
    gap: theme.spacing.md,
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.grey,
    justifyContent: 'center',
    alignItems: 'center',
  },
  likerPseudo: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.black,
  },
});
