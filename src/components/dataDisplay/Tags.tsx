import type { ReactNode } from 'react';
import { Text, View, StyleSheet } from 'react-native';
import type { TagsNames } from '@volontariapp/shared';
import { TAGS_CONFIG } from '@/shared/types/tagsTypes';
import { AppIcons } from '@/components/media/AppIcons';
import { theme } from '@/shared/themes/theme';

interface TagProps {
  type: TagsNames;
}

export const TagComponent = ({ type }: TagProps): ReactNode => {
  const tag = TAGS_CONFIG[type];

  return (
    <View style={[styles.container, { backgroundColor: tag.backgroundColor }]}>
      {tag.icon != null && <AppIcons icon={tag.icon} size={12} />}
      <Text style={[styles.text, { color: tag.textColor }]}>{tag.textContent}</Text>
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
