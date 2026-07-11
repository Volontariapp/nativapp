import React, { useMemo } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Image } from 'expo-image';
import type { DimensionValue } from 'react-native';
import { AppText } from '@/components/typography/AppText';
import { theme } from '@/shared/themes/theme';
import type { AppEvent } from '@/api/event/event.api';

interface EventParticipantsProps {
  event: AppEvent;
  onSeeMorePress?: () => void;
}

export const EventParticipants = React.memo(function EventParticipants({
  event,
  onSeeMorePress,
}: EventParticipantsProps): React.JSX.Element {
  const { currentPart, maxPart, fillPercentage } = useMemo(() => {
    const current = Math.max(1, event.currentParticipants);
    const max = event.maxParticipants;
    const percentage = max > 0 ? Math.min(100, Math.max(0, (current / max) * 100)) : 0;

    return {
      currentPart: current,
      maxPart: max,
      fillPercentage: percentage,
    };
  }, [event.currentParticipants, event.maxParticipants]);

  const { avatars, remaining } = useMemo(() => {
    const displayCount = Math.min(currentPart, 5);
    const generatedAvatars = Array.from({ length: displayCount }).map((_, i) => {
      const url = `https://i.pravatar.cc/150?u=${event.id}-${i.toString()}`;
      return url;
    });
    return {
      avatars: generatedAvatars,
      remaining: currentPart - displayCount,
    };
  }, [currentPart, event.id]);

  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <AppText style={styles.title}>Participants</AppText>

        <Pressable
          onPress={onSeeMorePress}
          hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
          accessibilityRole="button"
          accessibilityLabel="Voir tous les participants"
          style={({ pressed }) => [pressed && styles.linkPressed]}
        >
          <AppText style={styles.link}>voir plus</AppText>
        </Pressable>
      </View>

      <View style={styles.contentRow}>
        <View style={styles.avatarsContainer}>
          {avatars.map((url, i) => (
            <Image
              key={`${url}-${i.toString()}`}
              source={{ uri: url }}
              style={[styles.avatar, i > 0 && styles.avatarOverlap, { zIndex: 10 - i }]}
              contentFit="cover"
              cachePolicy="memory-disk"
              accessibilityIgnoresInvertColors
            />
          ))}
          {remaining > 0 && (
            <View style={[styles.remainingBadge, styles.avatarOverlap, { zIndex: 0 }]}>
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
            { width: `${String(fillPercentage)}%` as DimensionValue },
          ]}
        />
      </View>
    </View>
  );
});

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
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.info,
  },
  linkPressed: {
    opacity: 0.7,
  },
  contentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
    minHeight: theme.components.avatar.md, // Sécurise la hauteur au lieu du height 40px brut
  },
  avatarsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    // Suppression complète des bidouilles en position absolute et width magique
  },
  avatar: {
    width: theme.components.avatar.md,
    height: theme.components.avatar.md,
    borderRadius: theme.radius.full,
    borderWidth: 2,
    borderColor: theme.colors.white,
    backgroundColor: theme.colors.skeletonGrey, // skeleton en attente du load expo-image
  },
  avatarOverlap: {
    marginLeft: -theme.spacing.md, // Token flexbox propre au lieu du calcul left: i * 20
  },
  remainingBadge: {
    width: theme.components.avatar.md,
    height: theme.components.avatar.md,
    borderRadius: theme.radius.full,
    borderWidth: 2,
    borderColor: theme.colors.white,
    backgroundColor: theme.colors.info,
    justifyContent: 'center',
    alignItems: 'center',
  },
  remainingText: {
    color: theme.colors.white,
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.bold,
  },
  statsContainer: {
    alignItems: 'flex-end',
  },
  statsText: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.black,
  },
  statsSubtext: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.grey,
  },
  progressBarBg: {
    height: theme.components.progressBar.height,
    backgroundColor: theme.colors.background,
    borderRadius: theme.radius.sm,
    width: '100%',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: theme.colors.info,
    borderRadius: theme.radius.sm,
  },
});
