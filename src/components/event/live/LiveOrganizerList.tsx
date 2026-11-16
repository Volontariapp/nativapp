import React from 'react';
import { StyleSheet, View } from 'react-native';
import { AppText } from '@/components/typography/AppText';
import { useStyles } from '@/context/ThemeContext';
import type { AppTheme } from '@/shared/themes/theme';
import { labelInitial, LIVE_ORGANIZER_EMPTY_MESSAGE } from './live-organizer.utils';

export interface LiveOrganizerListEntry {
  userId: string;
  label: string;
  age: string;
}

export interface LiveOrganizerListProps {
  entries: readonly LiveOrganizerListEntry[];
}

/** Liste des participants en route (partagee entre la carte native et le fallback web). */
export function LiveOrganizerList({ entries }: LiveOrganizerListProps): React.JSX.Element {
  const styles = useStyles(createStyles);

  if (entries.length === 0) {
    return <AppText style={styles.empty}>{LIVE_ORGANIZER_EMPTY_MESSAGE}</AppText>;
  }

  return (
    <View style={styles.list}>
      {entries.map(({ userId, label, age }) => (
        <View key={userId} style={styles.row}>
          <View style={styles.avatar}>
            <AppText style={styles.avatarText}>{labelInitial(label)}</AppText>
          </View>
          <AppText style={styles.rowLabel} numberOfLines={1}>
            {label}
          </AppText>
          <AppText style={styles.rowAge}>{age}</AppText>
        </View>
      ))}
    </View>
  );
}

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    empty: {
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.grey,
    },
    list: {
      gap: theme.spacing.xs,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
    },
    avatar: {
      width: 24,
      height: 24,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.primarySocio,
    },
    avatarText: {
      fontSize: theme.typography.fontSize.xs,
      fontWeight: theme.typography.fontWeight.bold,
      color: theme.colors.white,
    },
    rowLabel: {
      flex: 1,
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.text,
    },
    rowAge: {
      fontSize: theme.typography.fontSize.xs,
      color: theme.colors.grey,
    },
  });
