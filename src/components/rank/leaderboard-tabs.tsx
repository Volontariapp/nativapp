import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import type { LeaderboardScopeWeb } from '@volontariapp/contracts';
import { AppText } from '@/components/typography/AppText';
import { useStyles } from '@/context/ThemeContext';
import { lightTheme, type AppTheme } from '@/shared/themes/theme';

interface LeaderboardTabsProps {
  scope: LeaderboardScopeWeb;
  onChange: (scope: LeaderboardScopeWeb) => void;
}

const TABS: readonly { scope: LeaderboardScopeWeb; label: string }[] = [
  { scope: 'global', label: 'Global' },
  { scope: 'month', label: 'Mois' },
  { scope: 'week', label: 'Semaine' },
];

/** Choix du classement : tous temps, mois en cours ou semaine en cours. */
export const LeaderboardTabs = ({ scope, onChange }: LeaderboardTabsProps): React.JSX.Element => {
  const styles = useStyles(createStyles);

  return (
    <View style={styles.container} accessibilityRole="tablist">
      {TABS.map((tab) => {
        const isActive = tab.scope === scope;
        return (
          <Pressable
            key={tab.scope}
            style={[styles.tab, isActive && styles.tabActive]}
            onPress={() => {
              onChange(tab.scope);
            }}
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}
          >
            <AppText style={[styles.label, isActive && styles.labelActive]}>{tab.label}</AppText>
          </Pressable>
        );
      })}
    </View>
  );
};

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      backgroundColor: theme.colors.lightGrey,
      borderRadius: theme.radius.full,
      padding: theme.spacing.xs,
    },
    tab: {
      flex: 1,
      alignItems: 'center',
      paddingVertical: theme.spacing.sm,
      borderRadius: theme.radius.full,
    },
    tabActive: {
      backgroundColor: theme.colors.primaryEco,
    },
    label: {
      fontWeight: theme.typography.fontWeight.medium,
      color: theme.colors.grey,
    },
    labelActive: {
      color: lightTheme.colors.white,
    },
  });
