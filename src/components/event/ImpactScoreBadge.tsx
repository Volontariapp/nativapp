import type { StyleProp, ViewStyle } from 'react-native';
import { View, StyleSheet } from 'react-native';
import { AppText } from '@/components/typography/AppText';
import { AppIcons } from '@/components/media/AppIcons';
import { theme } from '@/shared/themes/theme';

interface ImpactScoreBadgeProps {
  score: number;
  style?: StyleProp<ViewStyle>;
}

export function ImpactScoreBadge({ score, style }: ImpactScoreBadgeProps) {
  if (!score || score <= 0) return null;

  return (
    <View style={[styles.container, style]}>
      <AppIcons icon="star" size={14} color={theme.colors.gold} />
      <AppText style={styles.text}>+{score} points d'impact</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.goldBackground,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs + 2,
    borderRadius: theme.radius.full,
    borderWidth: 1,
    borderColor: theme.colors.goldBorder,
    gap: theme.spacing.xs,
    alignSelf: 'flex-start',
  },
  text: {
    color: theme.colors.goldText,
    fontSize: 12,
    fontWeight: theme.typography.fontWeight.bold,
    fontFamily: theme.typography.fonts.primary,
  },
});
