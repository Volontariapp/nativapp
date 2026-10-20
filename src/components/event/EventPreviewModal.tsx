import React from 'react';
import { Modal, View, StyleSheet, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme, useStyles } from '@/context/ThemeContext';
import type { AppTheme } from '@/shared/themes/theme';
import { AppText } from '@/components/typography/AppText';
import { AppIcons } from '@/components/media/AppIcons';
import { AppButton } from '@/components/buttons/AppButton';
import { EventCard } from '@/components/event/EventCard';
import type { AppEvent } from '@/api/event/event.api';

export interface EventPreviewModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirmPublish: () => void;
  isPublishing: boolean;
  event: AppEvent | null;
}

export function EventPreviewModal({
  visible,
  onClose,
  onConfirmPublish,
  isPublishing,
  event,
}: EventPreviewModalProps): React.JSX.Element | null {
  const insets = useSafeAreaInsets();
  const { theme } = useAppTheme();
  const styles = useStyles(createStyles);

  if (!visible || event === null) {
    return null;
  }

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View
        style={[
          styles.container,
          {
            paddingTop: insets.top,
            paddingBottom: Math.max(insets.bottom, 16),
          },
        ]}
      >
        {/* Header de la prévisualisation */}
        <View style={styles.header}>
          <Pressable
            onPress={onClose}
            style={styles.closeButton}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel="Revenir au formulaire"
          >
            <AppIcons icon="arrow-left" size={24} color={theme.colors.text} />
          </Pressable>
          <View style={styles.headerTitleContainer}>
            <AppText style={styles.headerTitle}>Aperçu de l'évènement</AppText>
            <AppText style={styles.headerSubtitle}>
              Voici ce que verront les participants dans leur flux
            </AppText>
          </View>
          <View style={styles.headerSpacer} />
        </View>

        {/* Zone centrale : Carte de swipe en situation réelle */}
        <View style={styles.cardSection}>
          <View style={styles.cardWrapper}>
            <EventCard event={event} />
          </View>
        </View>

        {/* Actions inférieures : Validation finale & Modification */}
        <View style={styles.actionsContainer}>
          <AppButton
            variant="eco"
            text="Confirmer la publication"
            icon="check"
            onPress={onConfirmPublish}
            loading={isPublishing}
            style={styles.confirmButton}
            textStyle={styles.confirmButtonText}
          />
          <AppButton
            variant="secondary"
            text="Modifier l'évènement"
            icon="edit-2"
            onPress={onClose}
            disabled={isPublishing}
            style={styles.modifyButton}
          />
        </View>
      </View>
    </Modal>
  );
}

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
      justifyContent: 'space-between',
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.lightGrey,
      backgroundColor: theme.colors.white,
    },
    closeButton: {
      padding: theme.spacing.xs,
    },
    headerTitleContainer: {
      alignItems: 'center',
      flex: 1,
    },
    headerTitle: {
      fontSize: 17,
      fontWeight: 'bold',
      color: theme.colors.text,
    },
    headerSubtitle: {
      fontSize: 12,
      color: theme.colors.grey,
      marginTop: 2,
    },
    headerSpacer: {
      width: 32,
    },
    cardSection: {
      flex: 1,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.md,
      justifyContent: 'center',
      alignItems: 'center',
    },
    cardWrapper: {
      width: '100%',
      maxWidth: 380,
      flex: 1,
      maxHeight: 560,
      borderRadius: theme.radius.lg,
      overflow: 'hidden',
    },
    actionsContainer: {
      paddingHorizontal: theme.spacing.lg,
      paddingTop: theme.spacing.md,
      gap: theme.spacing.sm,
      backgroundColor: theme.colors.white,
      borderTopWidth: 1,
      borderTopColor: theme.colors.lightGrey,
    },
    confirmButton: {
      width: '100%',
    },
    confirmButtonText: {
      fontWeight: 'bold',
      fontSize: 16,
    },
    modifyButton: {
      width: '100%',
    },
  });
