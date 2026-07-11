import { View, StyleSheet } from 'react-native';
import { AppText } from '@/components/typography/AppText';
import { theme } from '@/shared/themes/theme';
import type { Requirement } from '@volontariapp/contracts';

interface EventRequirementsProps {
  requirements: Requirement[];
}

export function EventRequirements({ requirements }: EventRequirementsProps) {
  return (
    <View style={styles.section}>
      <AppText style={styles.title}>À ramener</AppText>

      {requirements.map((req) => (
        <View key={req.id} style={styles.itemContainer}>
          <View style={styles.bulletPoint} />
          <AppText style={styles.itemText}>{req.name}</AppText>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    backgroundColor: theme.colors.white,
    padding: theme.spacing.lg,
    borderRadius: theme.radius.lg,
    marginBottom: theme.spacing.lg,
    ...theme.shadows.card,
  },
  title: {
    ...theme.sectionTitle,
    color: theme.colors.black,
    fontWeight: theme.typography.fontWeight.bold,
    textTransform: 'none',
    letterSpacing: 0,
    marginBottom: theme.spacing.md,
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.md,
    backgroundColor: theme.colors.background,
    borderRadius: theme.radius.md,
    marginBottom: theme.spacing.sm,
  },
  bulletPoint: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.colors.primarySocio,
    marginRight: theme.spacing.md,
  },
  itemText: {
    fontSize: 14,
    color: theme.colors.black,
    fontFamily: theme.typography.fonts.primary,
    flex: 1,
  },
});
