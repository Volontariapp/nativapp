import React from 'react';
import { ActivityIndicator, Modal, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText } from '@/components/typography/AppText';
import { AppIconsButton } from '@/components/buttons/AppIconsButton';
import { useAppTheme, useStyles } from '@/context/ThemeContext';
import type { AppTheme } from '@/shared/themes/theme';
import type { LiveRouteMapProps } from './LiveRouteMap';
import { formatWalkDuration } from './live-format.utils';

export type { LiveRouteMapProps };

export function LiveRouteMap({
  title,
  route,
  isLoading,
  isError,
  onClose,
}: LiveRouteMapProps): React.JSX.Element {
  const { theme } = useAppTheme();
  const styles = useStyles(createStyles);
  const insets = useSafeAreaInsets();

  return (
    <Modal visible animationType="slide" onRequestClose={onClose} testID="live-route-modal">
      <View style={styles.fullscreen} testID="live-route-fullscreen">
        <View style={styles.mapPlaceholder}>
          <AppText style={styles.placeholderText}>
            La carte d'itinéraire en direct est optimisée pour l'application mobile.
          </AppText>
        </View>
        <View style={[styles.panel, { top: insets.top + theme.spacing.md }]}>
          <View style={styles.headerText}>
            <AppText style={styles.title} numberOfLines={1}>
              {`Trajet vers ${title}`}
            </AppText>
            {route !== null && (
              <AppText style={styles.meta}>
                {`${formatWalkDuration(route.durationSeconds)} à pied - ${String(route.distanceMeters)} m`}
              </AppText>
            )}
            {isError && <AppText style={styles.error}>Trajet indisponible pour le moment.</AppText>}
          </View>
          {isLoading && (
            <ActivityIndicator
              size="small"
              color={theme.colors.primaryEco}
              testID="live-route-loading"
            />
          )}
          <AppIconsButton
            icon="x"
            size={24}
            variant="white"
            iconColor={theme.colors.grey}
            onPress={onClose}
            accessibilityLabel="Fermer le trajet"
            testID="live-route-fullscreen-close"
          />
        </View>
      </View>
    </Modal>
  );
}

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    fullscreen: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    mapPlaceholder: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: theme.spacing.lg,
      backgroundColor: theme.colors.lightGrey,
    },
    placeholderText: {
      color: theme.colors.grey,
      textAlign: 'center',
      fontSize: theme.typography.fontSize.sm,
    },
    panel: {
      position: 'absolute',
      left: theme.spacing.lg,
      right: theme.spacing.lg,
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
      backgroundColor: theme.colors.white,
      borderRadius: theme.radius.lg,
      borderWidth: 1,
      borderColor: theme.colors.lightGrey,
      padding: theme.spacing.md,
    },
    headerText: {
      flex: 1,
      gap: 2,
    },
    title: {
      fontSize: theme.typography.fontSize.sm,
      fontWeight: theme.typography.fontWeight.bold,
      color: theme.colors.text,
    },
    meta: {
      fontSize: theme.typography.fontSize.xs,
      color: theme.colors.grey,
    },
    error: {
      fontSize: theme.typography.fontSize.xs,
      color: theme.colors.danger,
    },
  });
