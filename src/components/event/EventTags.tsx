import { View, StyleSheet } from 'react-native';
import { AppText } from '@/components/typography/AppText';
import { AppIcons } from '@/components/media/AppIcons';
import { theme } from '@/shared/themes/theme';
import type { Tag } from '@volontariapp/contracts';

interface EventTagsProps {
  tags: Tag[];
}

export function EventTags({ tags }: EventTagsProps) {
  return (
    <View style={styles.container}>
      {tags.map((tag) => (
        <View key={tag.id} style={styles.tag}>
          <AppIcons icon="tag" iconLibrary="Feather" size={14} color={theme.colors.grey} />
          <AppText style={styles.tagText}>{tag.name}</AppText>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: theme.spacing.sm,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radius.full,
    marginRight: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  tagText: {
    fontSize: 12,
    color: theme.colors.grey,
    marginLeft: theme.spacing.xs,
  },
});
