import type { ReactNode } from 'react';
import { Text, View, StyleSheet } from 'react-native';
import type { EventType } from '@volontariapp/contracts';
import { EVENT_TYPE_CONFIG } from '@/shared/types/tagsTypes';
import { AppIcons } from '@/components/media/AppIcons';
import { theme } from '@/shared/themes/theme';

interface TagProps {
  type: EventType;
}

export const EventTypeTagComponent = ({ type }: TagProps): ReactNode => {
  const tagConfig = EVENT_TYPE_CONFIG[type];

  if (tagConfig === undefined) return null;

  return (
    <View style={[styles.container, { backgroundColor: tagConfig.backgroundColor }]}>
      {tagConfig.icon != null && <AppIcons icon={tagConfig.icon} size={12} />}
      <Text style={[styles.text, { color: tagConfig.textColor }]}>{tagConfig.textContent}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.radius.full,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    gap: theme.spacing.xs,
  },
  text: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.medium,
  },
});
