import React from 'react';
import { View, StyleSheet, Image } from 'react-native';
import type { DimensionValue } from 'react-native';
import { AppText } from '@/components/typography/AppText';
import { theme } from '@/shared/themes/theme';
import type { AppEvent } from '@/api/event/event.api';

interface EventParticipantsProps {
  event: AppEvent;
}

export function EventParticipants({ event }: EventParticipantsProps) {
  const currentPart = Math.max(1, event.currentParticipants);
  const maxPart = event.maxParticipants;

  const displayCount = Math.min(currentPart, 5);
  const avatars = Array.from({ length: displayCount }).map(
    (_, i) => `https://i.pravatar.cc/150?u=${event.id}-${String(i)}`,
  );
  const remaining = currentPart - displayCount;

  const fillPercentage =
    maxPart > 0 ? Math.min(100, Math.max(0, (currentPart / maxPart) * 100)) : 0;

  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <AppText style={styles.title}>Participants</AppText>
        <AppText style={styles.link}>voir plus</AppText>
      </View>

      <View style={styles.contentRow}>
        <View style={styles.avatarsContainer}>
          {avatars.map((url, i) => (
            <Image
              key={i}
              source={{ uri: url }}
              style={[styles.avatar, { left: i * 20, zIndex: displayCount - i }]}
            />
          ))}
          {remaining > 0 && (
            <View style={[styles.remainingBadge, { left: displayCount * 20 }]}>
              <AppText style={styles.remainingText}>+{remaining}</AppText>
            </View>
          )}
        </View>

        <View style={styles.statsContainer}>
          <AppText style={styles.statsText}>
            {currentPart} / {maxPart}
          </AppText>
          <AppText style={styles.statsSubtext}>places remplies</AppText>
        </View>
      </View>

      <View style={styles.progressBarBg}>
        <View
          style={[
            styles.progressBarFill,
            { width: (fillPercentage.toString() + '%') as DimensionValue },
          ]}
        />
      </View>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  title: {
    ...theme.sectionTitle,
    color: theme.colors.black,
    fontWeight: theme.typography.fontWeight.bold,
    textTransform: 'none',
    letterSpacing: 0,
  },
  link: {
    fontSize: 12,
    fontWeight: theme.typography.fontWeight.bold,
    color: '#0066cc',
  },
  contentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
    height: 40,
  },
  avatarsContainer: {
    flexDirection: 'row',
    position: 'relative',
    height: 40,
    width: 150,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: theme.colors.white,
    position: 'absolute',
  },
  remainingBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: theme.colors.white,
    backgroundColor: '#0066cc',
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  remainingText: {
    color: theme.colors.white,
    fontSize: 12,
    fontWeight: theme.typography.fontWeight.bold,
  },
  statsContainer: {
    alignItems: 'flex-end',
  },
  statsText: {
    fontSize: 16,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.black,
  },
  statsSubtext: {
    fontSize: 12,
    color: theme.colors.grey,
  },
  progressBarBg: {
    height: 6,
    backgroundColor: theme.colors.background,
    borderRadius: 3,
    width: '100%',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#0066cc',
    borderRadius: 3,
  },
});
