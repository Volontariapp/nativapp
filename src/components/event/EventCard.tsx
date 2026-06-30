import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
} from 'react-native';
import { theme } from '@/shared/themes/theme';
import type { AppEvent as Event } from '@/api/event/event.api';
import { Ionicons } from '@expo/vector-icons';
import { EventTypeTagComponent } from '@/components/dataDisplay/EventTypesTags';
import EventPlaceholder from '../../../assets/image_placeholder.jpg';

interface EventCardProps {
  event: Event;
}

export default function EventCard({ event }: EventCardProps) {
  const date = new Date(event.startAt);

  const formattedDate = date.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
  });

  const formattedTime = date.toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <View style={styles.card}>
      <ImageBackground
        source={EventPlaceholder}
        style={styles.image}
        imageStyle={styles.imageStyle}
      >
        <View style={styles.tagsContainer}>
          <EventTypeTagComponent type={event.type} />
        </View>

        <View style={styles.dateBadge}>
          <Ionicons
            name="calendar-outline"
            size={16}
            color={theme.colors.black}
          />
          <Text style={styles.dateText}>
            {formattedDate.toUpperCase()}, {formattedTime}
          </Text>
        </View>
      </ImageBackground>

      <View style={styles.content}>
        <Text style={styles.title}>{event.title}</Text>

        <Text
          style={styles.description}
          numberOfLines={2}
        >
          {event.description}
        </Text>

        <View style={styles.footer}>
          <View style={styles.participants}>
            <View style={styles.avatar} />
            <View style={[styles.avatar, styles.avatarOverlap]} />
            <View style={[styles.avatar, styles.avatarOverlap]} />

            <Text style={styles.participantsText}>
              +{event.currentParticipants}
            </Text>
          </View>

          <View style={styles.location}>
            <Ionicons
              name="location-outline"
              size={14}
              color={theme.colors.primarySocio}
            />
            <Text style={styles.locationText}>
              {event.localisationName}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const IMAGE_HEIGHT = 400;

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.background,
    borderRadius: 24,
    overflow: 'hidden',
    marginVertical: theme.spacing.md,
    ...theme.shadows.card,
    //minHeight: 500,
    minHeight: 580,
  },

  image: {
    height: IMAGE_HEIGHT,
    justifyContent: 'space-between',
    padding: theme.spacing.md,
  },

  imageStyle: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },

  tagsContainer: {
    flexDirection: 'row',
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

  content: {
    padding: theme.spacing.xl,
    flex: 1,
    justifyContent: 'space-between',
  },

  title: {
    fontSize: 28,
    lineHeight: 32,
    color: theme.colors.black,
    fontWeight: theme.typography.fontWeight.bold,
    fontFamily: theme.typography.fonts.primary,
    marginBottom: theme.spacing.sm,
  },

  description: {
    color: theme.colors.grey,
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
    color: theme.colors.grey,
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.fonts.primary,
  },

  location: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    maxWidth: '50%',
  },

  locationText: {
    color: theme.colors.primarySocio,
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.fonts.primary,
  },
});
