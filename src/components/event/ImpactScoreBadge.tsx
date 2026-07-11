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
      <AppIcons icon="star" size={14} color="#D4AF37" />
      <AppText style={styles.text}>+{score} points d'impact</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9F5EB',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#E6D3A3',
    gap: 4,
    alignSelf: 'flex-start',
  },
  text: {
    color: '#B8860B', // Dark goldenrod for text
    fontSize: 12,
    fontWeight: theme.typography.fontWeight.bold,
    fontFamily: theme.typography.fonts.primary,
  },
});
