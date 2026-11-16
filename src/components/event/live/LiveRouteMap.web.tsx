import React from 'react';
import { Modal, StyleSheet, View } from 'react-native';
import { AppText } from '@/components/typography/AppText';
import { useStyles } from '@/context/ThemeContext';
import type { AppTheme } from '@/shared/themes/theme';
import type { LiveRouteMapProps } from './LiveRouteMap';
import { LiveRoutePanel } from './LiveRoutePanel';

export type { LiveRouteMapProps };

export function LiveRouteMap({
  title,
  route,
  isLoading,
  isError,
  onClose,
}: LiveRouteMapProps): React.JSX.Element {
  const styles = useStyles(createStyles);

  return (
    <Modal visible animationType="slide" onRequestClose={onClose} testID="live-route-modal">
      <View style={styles.fullscreen} testID="live-route-fullscreen">
        <View style={styles.mapPlaceholder}>
          <AppText style={styles.placeholderText}>
            La carte d'itinéraire en direct est optimisée pour l'application mobile.
          </AppText>
        </View>
        <LiveRoutePanel
          title={title}
          route={route}
          isLoading={isLoading}
          isError={isError}
          onClose={onClose}
        />
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
  });
