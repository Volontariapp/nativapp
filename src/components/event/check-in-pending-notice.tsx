import React from 'react';
import { View, StyleSheet } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { AppText } from '@/components/typography/AppText';
import { theme } from '@/shared/themes/theme';

export const CHECK_IN_PENDING_MESSAGE =
  "L'organisateur ne vous a pas encore enregistré. Présentez-vous à lui pour valider votre présence.";

export function CheckInPendingNotice(): React.JSX.Element {
  return (
    <View style={styles.container} accessibilityRole="alert" testID="check-in-pending-notice">
      <Feather name="clock" size={14} color={theme.colors.warning} />
      <AppText style={styles.text}>{CHECK_IN_PENDING_MESSAGE}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: theme.spacing.xs,
    gap: theme.spacing.xs,
  },
  text: {
    flex: 1,
    fontSize: 11,
    color: theme.colors.warning,
  },
});
