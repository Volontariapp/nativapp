import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import type { LocationObject } from 'expo-location';

import { theme } from '@/shared/themes/theme';
import type { AppEvent as Event } from '@/api/event/event.api';
import { EventTypeTagComponent } from '@/components/dataDisplay/EventTypesTags';
import { ImpactScoreBadge } from '@/components/event/ImpactScoreBadge';
import { getFakeEcologyImage } from '@/utils/fake-images.util';
import { calculateDistanceInKm, formatDistance } from '@/shared/lib/location.utils';

interface EventCardProps {
  event: Event;
  userLocation?: LocationObject | null;
  onLocationPress?: (event: Event) => void;
}

export const EventCard = React.memo(function EventCard({
  event,
  userLocation,
  onLocationPress,
}: EventCardProps): React.JSX.Element {
  const formattedDate = useMemo(() => {
    const date = new Date(event.startAt);
    return date
      .toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: 'short',
      })
      .toUpperCase();
  }, [event.startAt]);

  const formattedTime = useMemo(() => {
    const date = new Date(event.startAt);
    return date.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }, [event.startAt]);

  const distanceValue = useMemo(() => {
    if (!userLocation || !event.location) return '';
    const distance = calculateDistanceInKm(
      userLocation.coords.latitude,
      userLocation.coords.longitude,
      event.location.latitude,
      event.location.longitude,
    );
    return `à ${formatDistance(distance)}`;
  }, [userLocation, event.location]);

  const { avatars, remaining } = useMemo(() => {
    const currentPart = Math.max(1, event.currentParticipants);
    const displayCount = Math.min(currentPart, 3);
    const generatedAvatars = Array.from({ length: displayCount }).map(
      (_, i) => `https://i.pravatar.cc/150?u=${event.id}-${String(i)}`,
    );
    return {
      avatars: generatedAvatars,
      remaining: currentPart - displayCount,
    };
  }, [event.currentParticipants, event.id]);

  const fakeImageUrl = useMemo(() => getFakeEcologyImage(event.id), [event.id]);

  return (
    <View style={styles.cardContainer}>
      <View style={styles.cardInner}>
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: fakeImageUrl }}
            style={StyleSheet.absoluteFillObject}
            contentFit="cover"
            cachePolicy="memory-disk"
            accessibilityIgnoresInvertColors
          />
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.9)']}
            locations={[0.4, 1]}
            style={StyleSheet.absoluteFillObject}
          />
        </View>

        <View style={styles.contentOverlay}>
          <View style={styles.topContainer}>
            <View style={styles.tagsContainer}>
              <EventTypeTagComponent type={event.type} />
              {event.awardedImpactScore > 0 && (
                <ImpactScoreBadge score={event.awardedImpactScore} />
              )}
            </View>
          </View>

          <View style={styles.content}>
            <View style={styles.dateAndDistanceContainer}>
              <View style={styles.dateBadge}>
                <Ionicons
                  name="calendar-outline"
                  size={theme.typography.fontSize.md}
                  color={theme.colors.black}
                />
                <Text style={styles.dateText}>
                  {formattedDate}, {formattedTime}
                </Text>
              </View>

              {!!distanceValue && (
                <View style={styles.distanceChip}>
                  <Ionicons
                    name="location-outline"
                    size={theme.typography.fontSize.md}
                    color={theme.colors.white}
                  />
                  <Text style={styles.distanceChipText}>{distanceValue}</Text>
                </View>
              )}
            </View>

            <Text style={styles.title}>{event.title}</Text>

            <Text style={styles.description} numberOfLines={2}>
              {event.description}
            </Text>

            <View style={styles.footer}>
              <View style={styles.participants}>
                {avatars.map((url, i) => (
                  <Image
                    key={`${url}-${String(i)}`}
                    source={{ uri: url }}
                    style={[styles.avatar, i > 0 && styles.avatarOverlap, { zIndex: 10 - i }]}
                    contentFit="cover"
                    cachePolicy="memory-disk"
                  />
                ))}
                {remaining > 0 ? <Text style={styles.participantsText}>+{remaining}</Text> : null}
              </View>

              <Pressable
                style={({ pressed }) => [styles.location, pressed && styles.locationPressed]}
                onPress={() => onLocationPress?.(event)}
                hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
                accessibilityRole="button"
                accessibilityLabel={`Voir le lieu de l'événement : ${event.localisationName}`}
              >
                <Ionicons
                  name="location-outline"
                  size={theme.typography.fontSize.sm}
                  color={theme.colors.white}
                />
                <Text style={styles.locationText} numberOfLines={1}>
                  {event.localisationName}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  cardContainer: {
    flex: 1,
    ...theme.shadows.card,
  },
  cardInner: {
    flex: 1,
    overflow: 'hidden',
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.background,
  },
  imageContainer: {
    ...StyleSheet.absoluteFillObject,
  },
  contentOverlay: {
    flex: 1,
    justifyContent: 'space-between',
  },
  topContainer: {
    padding: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  tagsContainer: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  dateAndDistanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  dateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    backgroundColor: theme.colors.white,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radius.full,
  },
  dateText: {
    color: theme.colors.black,
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
    fontFamily: theme.typography.fonts.primary,
  },
  distanceChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    backgroundColor: theme.colors.whiteOverlay,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radius.full,
  },
  distanceChipText: {
    color: theme.colors.white,
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
    fontFamily: theme.typography.fonts.primary,
  },
  content: {
    padding: theme.spacing.lg,
    paddingBottom: 40, // Reduced since card is shorter
  },
  title: {
    fontSize: theme.typography.fontSize.xl,
    color: theme.colors.white,
    fontWeight: theme.typography.fontWeight.bold,
    fontFamily: theme.typography.fonts.primary,
    marginBottom: theme.spacing.xs,
  },
  description: {
    color: theme.colors.lightGrey,
    fontSize: theme.typography.fontSize.md,
    fontFamily: theme.typography.fonts.primary,
    marginBottom: theme.spacing.lg,
    lineHeight: 22,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  participants: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: theme.spacing.xl,
    height: theme.spacing.xl,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.skeletonGrey,
    borderWidth: 2,
    borderColor: theme.colors.white,
  },
  avatarOverlap: {
    marginLeft: -theme.spacing.sm,
  },
  participantsText: {
    marginLeft: theme.spacing.xs,
    color: theme.colors.white,
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.fonts.primary,
    fontWeight: theme.typography.fontWeight.medium,
  },
  location: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    maxWidth: '55%',
  },
  locationPressed: {
    opacity: 0.7,
  },
  locationText: {
    color: theme.colors.white,
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.fonts.primary,
  },
});
