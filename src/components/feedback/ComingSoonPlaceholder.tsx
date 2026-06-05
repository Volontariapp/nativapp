import React from 'react';
import { View, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { AppText } from '@/components/typography/AppText';
import { theme } from '@/shared/themes/theme';

/**
 * Placeholder pour les fonctionnalités en cours de développement.
 */
export const ComingSoonPlaceholder = (): React.JSX.Element => {
  return (
    <View style={styles.comingSoonContainer}>
      <Icon name="clock" size={20} color={theme.colors.grey} />
      <AppText style={styles.comingSoonText}>Coming soon</AppText>
    </View>
  );
};

const styles = StyleSheet.create({
  comingSoonContainer: {
    backgroundColor: theme.colors.white,
    padding: theme.spacing.lg,
    borderRadius: theme.radius.md,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: theme.colors.grey,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
  },
  comingSoonText: {
    color: theme.colors.grey,
    fontSize: theme.typography.fontSize.md,
    fontStyle: 'italic',
  },
});
