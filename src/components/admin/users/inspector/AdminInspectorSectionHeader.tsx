import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { theme } from '@/shared/themes/theme';
import { AppText } from '@/components/typography/AppText';
import { AppIcons } from '../../../media/AppIcons';

interface AdminInspectorSectionHeaderProps {
  title: string;
  count: number;
  onAdd?: () => void;
}

export function AdminInspectorSectionHeader({
  title,
  count,
  onAdd,
}: AdminInspectorSectionHeaderProps): React.JSX.Element {
  return (
    <View style={styles.sectionHeader}>
      <AppText style={styles.sectionTitle}>
        {title} ({count})
      </AppText>
      {onAdd !== undefined && (
        <Pressable onPress={onAdd} style={styles.addButton}>
          <AppIcons icon="plus" size={20} color={theme.colors.primarySocio} />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: '700',
    color: theme.colors.black,
    textTransform: 'uppercase',
  },
  addButton: {
    padding: theme.spacing.xs,
  },
});
