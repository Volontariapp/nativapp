import React, { useMemo } from 'react';
import { SectionList, StyleSheet, View } from 'react-native';
import AppHeader from '@/components/layout/AppHeader';
import { AppText } from '@/components/typography/AppText';
import { BadgeCatalogRow } from '@/components/dataDisplay/badge/badge-catalog-row';
import { BadgeCatalogSummary } from '@/components/dataDisplay/badge/badge-catalog-summary';
import { buildBadgeCatalog } from '@/components/dataDisplay/badge/badge-catalog.utils';
import type {
  BadgeCatalogEntry,
  BadgeCatalogSection,
} from '@/components/dataDisplay/badge/badge-catalog.types';
import { useProfile } from '@/api/user/hooks/use-profile';
import { useStyles } from '@/context/ThemeContext';
import type { AppTheme } from '@/shared/themes/theme';

const keyExtractor = (entry: BadgeCatalogEntry): string => entry.variant;

const renderItem = ({ item }: { item: BadgeCatalogEntry }): React.JSX.Element => (
  <BadgeCatalogRow entry={item} />
);

/** Page qui montre tous les badges, ceux déjà obtenus et la façon d'obtenir les autres. */
export function BadgesScreen(): React.JSX.Element {
  const styles = useStyles(createStyles);
  const { data: profile } = useProfile();
  const catalog = useMemo(() => buildBadgeCatalog(profile?.badges ?? []), [profile?.badges]);
  // Catalogue court et fixe : tout rendre d'emblée (lignes, en-têtes de section et en-tête de liste comptent).
  const initialRowCount = catalog.total + catalog.sections.length + 1;

  const renderSectionHeader = ({
    section,
  }: {
    section: BadgeCatalogSection;
  }): React.JSX.Element => <AppText style={styles.sectionTitle}>{section.title}</AppText>;

  return (
    <View style={styles.container}>
      <AppHeader showBack />
      <SectionList
        sections={catalog.sections}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        renderSectionHeader={renderSectionHeader}
        initialNumToRender={initialRowCount}
        stickySectionHeadersEnabled={false}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        ListHeaderComponent={
          <View style={styles.intro}>
            <AppText variant="title">Les badges</AppText>
            <BadgeCatalogSummary unlockedCount={catalog.unlockedCount} total={catalog.total} />
          </View>
        }
      />
    </View>
  );
}

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    content: {
      paddingHorizontal: theme.spacing.xl,
      paddingBottom: theme.spacing.xxl,
    },
    intro: {
      gap: theme.spacing.lg,
      paddingTop: theme.spacing.lg,
    },
    sectionTitle: {
      fontSize: theme.typography.fontSize.sm,
      fontWeight: theme.typography.fontWeight.bold,
      color: theme.colors.grey,
      textTransform: 'uppercase',
      letterSpacing: 1,
      marginBottom: theme.spacing.sm,
    },
  });
