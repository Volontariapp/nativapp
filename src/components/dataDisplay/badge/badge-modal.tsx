import React from 'react';
import { View, StyleSheet, Modal, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { AppText } from '@/components/typography/AppText';
import { AppIcons } from '@/components/media/AppIcons';
import { useAppTheme, useStyles } from '@/context/ThemeContext';
import type { AppTheme } from '@/shared/themes/theme';
import { BADGE_REGISTRY } from './badge.config';
import { BadgeMedallion } from './badge-medallion';
import type { BadgeModalProps } from './badge.types';

function formatAwardedDate(dateValue?: string): string | null {
  if (typeof dateValue !== 'string' || dateValue.trim() === '') {
    return null;
  }
  const parsed = new Date(dateValue);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }
  return parsed.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function BadgeModal({
  visible,
  variant,
  customBadge = null,
  awardedAt,
  customDescription,
  onClose,
}: BadgeModalProps): React.JSX.Element {
  const { theme } = useAppTheme();
  const styles = useStyles(createStyles);

  if (variant == null && customBadge == null) {
    return (
      <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
        <View />
      </Modal>
    );
  }

  const def = variant != null ? BADGE_REGISTRY[variant] : null;
  const badgeName = def?.name ?? customBadge?.name ?? 'Badge';
  const badgeDescription =
    customDescription ??
    def?.description ??
    customBadge?.description ??
    'Badge obtenu sur Volontariapp';
  const formattedAwardedDate = formatAwardedDate(awardedAt ?? customBadge?.awardedAt);
  const customIconPath = customBadge?.iconPath;

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
            {variant != null ? (
              <BadgeMedallion variant={variant} size="xl" />
            ) : (
              <View style={styles.customMedallion}>
                {typeof customIconPath === 'string' && customIconPath !== '' ? (
                  <Image
                    source={{ uri: customIconPath }}
                    style={styles.customMedallionImage}
                    contentFit="contain"
                  />
                ) : (
                  <AppIcons
                    icon="award"
                    iconLibrary="Feather"
                    size={42}
                    color={theme.colors.primaryEco}
                  />
                )}
              </View>
            )}
          </View>

          <View style={styles.body}>
            <AppText variant="title" style={styles.title}>
              {badgeName}
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
                  {badgeDescription}
                </AppText>
              </View>

              {formattedAwardedDate !== null && (
                <View style={styles.valueRow}>
                  <AppIcons
                    icon="calendar"
                    iconLibrary="Feather"
                    size={16}
                    color={theme.colors.grey}
                  />
                  <AppText variant="body" style={styles.dateText}>
                    {`Obtenu le ${formattedAwardedDate}`}
                  </AppText>
                </View>
              )}
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
    customMedallion: {
      width: 96,
      height: 96,
      borderRadius: 48,
      backgroundColor: theme.colors.background,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 2,
      borderColor: theme.colors.lightGrey,
      ...theme.shadows.card,
    },
    customMedallionImage: {
      width: 56,
      height: 56,
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
      gap: theme.spacing.sm,
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
    dateText: {
      fontSize: theme.typography.fontSize.xs,
      color: theme.colors.grey,
      flex: 1,
    },
  });
