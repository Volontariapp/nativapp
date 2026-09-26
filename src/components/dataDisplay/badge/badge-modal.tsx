import React from 'react';
import { View, StyleSheet, Modal, Pressable } from 'react-native';
import { AppText } from '@/components/typography/AppText';
import { AppIcons } from '@/components/media/AppIcons';
import { useAppTheme, useStyles } from '@/context/ThemeContext';
import type { AppTheme } from '@/shared/themes/theme';
import { BADGE_REGISTRY } from './badge.config';
import { BadgeMedallion } from './badge-medallion';
import type { BadgeModalProps } from './badge.types';

export function BadgeModal({ visible, variant, onClose }: BadgeModalProps): React.JSX.Element {
  const { theme } = useAppTheme();
  const styles = useStyles(createStyles);

  if (variant == null) {
    return (
      <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
        <View />
      </Modal>
    );
  }

  const def = BADGE_REGISTRY[variant];

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable
          style={StyleSheet.absoluteFillObject}
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel="Fermer la boîte de dialogue"
        />

        <View style={styles.card}>


          <View style={styles.medallionCenter}>
            <BadgeMedallion variant={variant} size="xl" />
          </View>

          <View style={styles.body}>
            <AppText variant="title" style={styles.title}>
              {def.name}
            </AppText>

            <View style={styles.infoSection}>
              <View style={styles.valueRow}>
                <AppIcons
                  icon="check-circle"
                  iconLibrary="Feather"
                  size={16}
                  color={theme.colors.primaryEco}
                />
                <AppText variant="body" style={styles.value}>
                  {def.description}
                </AppText>
              </View>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: theme.colors.badgeOverlay,
      justifyContent: 'center',
      alignItems: 'center',
      padding: theme.spacing.lg,
    },
    card: {
      backgroundColor: theme.colors.white,
      borderRadius: theme.radius.lg,
      padding: theme.spacing.xl,
      width: '100%',
      maxWidth: 380,
      ...theme.shadows.card,
    },
    medallionCenter: {
      alignItems: 'center',
      justifyContent: 'center',
      marginVertical: theme.spacing.md,
    },
    body: {
      gap: theme.spacing.md,
    },
    title: {
      fontSize: theme.typography.fontSize.xl,
      fontWeight: theme.typography.fontWeight.bold,
      color: theme.colors.black,
      textAlign: 'center',
    },
    infoSection: {
      backgroundColor: theme.colors.background,
      borderRadius: theme.radius.md,
      padding: theme.spacing.md,
      gap: theme.spacing.xs,
    },
    valueRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
    },
    value: {
      fontSize: theme.typography.fontSize.sm,
      fontWeight: theme.typography.fontWeight.medium,
      color: theme.colors.text,
      flex: 1,
    },
  });
