import { View, Text, StyleSheet, ImageBackground, Image, TouchableOpacity } from 'react-native';
import { theme } from '@/shared/themes/theme';
import type { AppEvent as Event } from '@/api/event/event.api';
import { Ionicons } from '@expo/vector-icons';
import { EventTypeTagComponent } from '@/components/dataDisplay/EventTypesTags';
import { getFakeEcologyImage } from '@/utils/fake-images.util';
import { LinearGradient } from 'expo-linear-gradient';
import { ImpactScoreBadge } from '@/components/event/ImpactScoreBadge';
import { calculateDistanceInKm, formatDistance } from '@/shared/lib/location.utils';
import type { LocationObject } from 'expo-location';

interface EventCardProps {
  event: Event;
  userLocation?: LocationObject | null;
  onLocationPress?: () => void;
}

export default function EventCard({ event, userLocation, onLocationPress }: EventCardProps) {
  const date = new Date(event.startAt);

  const formattedDate = date.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
  });

  const formattedTime = date.toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const currentPart = Math.max(1, event.currentParticipants);
  const displayCount = Math.min(currentPart, 3);
  const avatars = Array.from({ length: displayCount }).map(
    (_, i) => `https://i.pravatar.cc/150?u=${event.id}-${String(i)}`,
  );
  const remaining = currentPart - displayCount;

  const fakeImageUrl = getFakeEcologyImage(event.id);

  let distanceValue = '';
  if (userLocation && event.location) {
    const distance = calculateDistanceInKm(
      userLocation.coords.latitude,
      userLocation.coords.longitude,
      event.location.latitude,
      event.location.longitude,
    );
    distanceValue = `à ${formatDistance(distance)}`;
  }

  return (
    <View style={styles.card}>
      <ImageBackground
        source={{ uri: fakeImageUrl }}
        style={styles.imageBackground}
        imageStyle={styles.imageStyle}
      >
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.9)']}
          locations={[0.4, 1]}
          style={styles.gradient}
        />

        <View style={styles.topContainer}>
          <View style={styles.tagsContainer}>
            <EventTypeTagComponent type={event.type} />
            {event.awardedImpactScore > 0 && <ImpactScoreBadge score={event.awardedImpactScore} />}
          </View>

          <View style={styles.dateAndDistanceContainer}>
            <View style={styles.dateBadge}>
              <Ionicons name="calendar-outline" size={16} color={theme.colors.black} />
              <Text style={styles.dateText}>
                {formattedDate.toUpperCase()}, {formattedTime}
              </Text>
            </View>

            {!!distanceValue && (
              <View style={styles.distanceChip}>
                <Ionicons name="location-outline" size={16} color={theme.colors.white} />
                <Text style={styles.distanceChipText}>{distanceValue}</Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.content}>
          <Text style={styles.title}>{event.title}</Text>

          <Text style={styles.description} numberOfLines={2}>
            {event.description}
          </Text>

          <View style={styles.footer}>
            <View style={styles.participants}>
              {avatars.map((url, i) => (
                <Image
                  key={i}
                  source={{ uri: url }}
                  style={[
                    styles.avatar,
                    i > 0 && styles.avatarOverlap,
                    { zIndex: displayCount - i },
                  ]}
                />
              ))}
              {remaining > 0 ? <Text style={styles.participantsText}>+{remaining}</Text> : null}
            </View>

            <TouchableOpacity style={styles.location} onPress={onLocationPress} activeOpacity={0.7}>
              <Ionicons name="location-outline" size={14} color={theme.colors.white} />
              <Text style={styles.locationText} numberOfLines={1}>
                {event.localisationName}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    overflow: 'hidden',
    ...theme.shadows.card,
    flex: 1,
  },

  imageBackground: {
    flex: 1,
    justifyContent: 'space-between',
  },

  imageStyle: {
    borderRadius: 0,
  },

  gradient: {
    ...StyleSheet.absoluteFillObject,
  },

  topContainer: {
    padding: theme.spacing.md,
    justifyContent: 'space-between',
    flex: 1,
  },

  tagsContainer: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },

  dateAndDistanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },

  dateBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'white',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
  },

  dateText: {
    color: theme.colors.black,
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
    fontFamily: theme.typography.fonts.primary,
  },

  distanceChip: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
  },

  distanceChipText: {
    color: theme.colors.white,
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
    fontFamily: theme.typography.fonts.primary,
  },

  content: {
    padding: theme.spacing.xl,
  },

  title: {
    fontSize: 28,
    lineHeight: 32,
    color: theme.colors.white,
    fontWeight: theme.typography.fontWeight.bold,
    fontFamily: theme.typography.fonts.primary,
    marginBottom: theme.spacing.sm,
  },

  description: {
    color: '#E0E0E0',
    fontSize: theme.typography.fontSize.md,
    lineHeight: 22,
    fontFamily: theme.typography.fonts.primary,
    marginBottom: theme.spacing.lg,
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
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#D9D9D9',
    borderWidth: 2,
    borderColor: 'white',
  },

  avatarOverlap: {
    marginLeft: -8,
  },

  participantsText: {
    marginLeft: 6,
    color: theme.colors.white,
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.fonts.primary,
  },

  footerRight: {
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: 4,
    maxWidth: '55%',
  },

  location: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },

  locationText: {
    color: theme.colors.white,
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.fonts.primary,
  },
});
