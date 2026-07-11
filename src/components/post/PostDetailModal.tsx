import React from 'react';
import { View, StyleSheet, Modal, Pressable, ScrollView } from 'react-native';
import { theme } from '@/shared/themes/theme';
import { AppText } from '@/components/typography/AppText';
import { AppButton } from '@/components/buttons/AppButton';
import { convertEventDtoToAppEvent } from '@/api/event/event.api';
import type { PostWeb, EventDTO } from '@volontariapp/contracts';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { MainStackParamList } from '@/navigation/stacks/MainStack';

interface PostWithEvent extends PostWeb {
  event?: EventDTO;
}

interface PostDetailModalProps {
  visible: boolean;
  post: PostWeb | null;
  onClose: () => void;
}

export function PostDetailModal({
  visible,
  post,
  onClose,
}: PostDetailModalProps): React.JSX.Element {
  const navigation = useNavigation<NativeStackNavigationProp<MainStackParamList>>();

  if (!post) {
    return (
      <Modal visible={visible} transparent animationType="fade">
        <View />
      </Modal>
    );
  }

  const postWithEvent: PostWithEvent = post;

  const handleEventPress = () => {
    if (postWithEvent.event !== undefined) {
      const appEvent = convertEventDtoToAppEvent(postWithEvent.event);
      onClose();
      setTimeout(() => {
        navigation.navigate('EventDetail', { event: appEvent });
      }, 100);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFillObject} onPress={onClose} />
        <View style={styles.modalContent}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.header}>
              <AppText style={styles.title}>{post.title}</AppText>
              <Pressable onPress={onClose} style={styles.closeButton}>
                <AppText style={styles.closeText}>✕</AppText>
              </Pressable>
            </View>

            <View style={styles.section}>
              <AppText style={styles.label}>Contenu</AppText>
              <AppText style={styles.value}>{post.content}</AppText>
            </View>

            <View style={styles.row}>
              <View style={styles.flex1}>
                <AppText style={styles.label}>Auteur</AppText>
                <AppText style={styles.value}>{post.authorId}</AppText>
              </View>
              <View style={styles.flex1}>
                <AppText style={styles.label}>Créé le</AppText>
                <AppText style={styles.value}>
                  {new Date(post.createdAt).toLocaleDateString('fr-FR')}
                </AppText>
              </View>
            </View>

            {postWithEvent.event !== undefined && (
              <View style={styles.eventSection}>
                <AppText style={styles.sectionTitle}>Événement lié</AppText>
                <Pressable style={styles.eventCard} onPress={handleEventPress}>
                  <View style={styles.eventContent}>
                    <AppText style={styles.eventTitle}>{postWithEvent.event.title}</AppText>
                    <AppText style={styles.eventDescription} numberOfLines={2}>
                      {postWithEvent.event.description}
                    </AppText>
                    <AppText style={styles.eventMeta}>
                      {postWithEvent.event.startAt !== undefined
                        ? new Date(postWithEvent.event.startAt).toLocaleDateString('fr-FR')
                        : 'Date non définie'}
                    </AppText>
                  </View>
                  <AppText style={styles.eventArrow}>→</AppText>
                </Pressable>
              </View>
            )}

            <AppButton text="Fermer" onPress={onClose} style={styles.closeButtonAction} />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    display: 'flex',
  },
  modalContent: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    maxHeight: '85%',
    width: '90%',
    alignSelf: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.lg,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
    marginRight: theme.spacing.md,
    color: theme.colors.black,
  },
  closeButton: {
    padding: theme.spacing.sm,
  },
  closeText: {
    fontSize: 24,
    color: theme.colors.grey,
  },
  section: {
    marginBottom: theme.spacing.lg,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.grey,
    marginBottom: theme.spacing.xs,
    textTransform: 'uppercase',
  },
  value: {
    fontSize: 14,
    color: theme.colors.black,
    lineHeight: 20,
  },
  row: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  flex1: {
    flex: 1,
  },
  eventSection: {
    marginBottom: theme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: theme.colors.lightGrey,
    paddingTop: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.black,
    marginBottom: theme.spacing.md,
  },
  eventCard: {
    backgroundColor: theme.colors.lightGrey,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  eventContent: {
    flex: 1,
    marginRight: theme.spacing.md,
  },
  eventTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: theme.colors.black,
    marginBottom: theme.spacing.xs,
  },
  eventDescription: {
    fontSize: 12,
    color: theme.colors.grey,
    marginBottom: theme.spacing.xs,
    lineHeight: 16,
  },
  eventMeta: {
    fontSize: 11,
    color: theme.colors.grey,
  },
  eventArrow: {
    fontSize: 18,
    color: theme.colors.primaryEco,
    fontWeight: 'bold',
  },
  closeButtonAction: {
    marginTop: theme.spacing.lg,
  },
});
