import React, { type ReactNode } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { AppText } from '@/components/typography/AppText';
import Feather from 'react-native-vector-icons/Feather';
import { theme } from '@/shared/themes/theme';

interface AppInfoCardProps {
  label: string;
  iconName: string;
  iconColor: string;
  iconBackgroundColor: string;
  children: ReactNode;
  style?: ViewStyle;
}

export function AppInfoCard({
  label,
  iconName,
  iconColor,
  iconBackgroundColor,
  children,
  style,
}: AppInfoCardProps): React.JSX.Element {
  return (
    <View style={[styles.card, style]}>
      <View style={[styles.iconBox, { backgroundColor: iconBackgroundColor }]}>
        <Feather name={iconName} size={20} color={iconColor} />
      </View>
      <View style={styles.content}>
        <AppText style={styles.label}>{label}</AppText>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.radius.md,
    padding: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.lightGrey,
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 80,
    flex: 1,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: theme.radius.sm,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.sm,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  label: {
    fontSize: 12,
    fontWeight: 'bold',
    color: theme.colors.black,
    marginBottom: 4,
  },
});
