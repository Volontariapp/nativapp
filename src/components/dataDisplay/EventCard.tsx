import React from 'react';
import { View, StyleSheet, TouchableOpacity, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { MainStackParamList } from '@/navigation/stacks/MainStack';
import { AppText } from '@/components/typography/AppText';
import { theme } from '@/shared/themes/theme';
import type { AppEvent } from '@/api/event/event.api';
import { mapEventType } from '@/shared/lib/event-mappers.utils';
import { EventType } from '@volontariapp/contracts';
import Feather from 'react-native-vector-icons/Feather';
import { Image } from 'expo-image';
import { getEventImageUri } from '@/api/event/event-cover.utils';
import { LIST_THUMBNAIL_RADIUS, LIST_THUMBNAIL_SIZE } from '@/components/event/event-image-frames';

export interface EventCardProps {
  event: AppEvent;
  onPress?: () => void;
  /** Quand il est fourni, un bouton de modification est affiché sur le côté de la carte. */
  onEdit?: () => void;
}

export function EventCard({ event, onPress, onEdit }: EventCardProps): React.JSX.Element {
  const navigation = useNavigation<NativeStackNavigationProp<MainStackParamList>>();

  const isEcology =
    event.type === EventType.EVENT_TYPE_ECOLOGY ||
    String(event.type) === EventType[EventType.EVENT_TYPE_ECOLOGY];
  const isSocial =
    event.type === EventType.EVENT_TYPE_SOCIAL ||
    String(event.type) === EventType[EventType.EVENT_TYPE_SOCIAL];

  const typeColor = isEcology
    ? theme.colors.primaryEco
    : isSocial
      ? theme.colors.primarySocio
      : theme.colors.grey;

  const typeBg = isEcology
    ? `${theme.colors.primaryEco}20`
    : isSocial
      ? `${theme.colors.primarySocio}20`
      : `${theme.colors.grey}20`;

  const date = new Date(event.startAt);
  const formattedDate = date.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  const formattedTime = date.toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const imageUri = getEventImageUri(event);

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.8}
      onPress={() => {
        if (onPress) {
          onPress();
        } else {
          navigation.navigate('EventDetail', { event });
        }
      }}
    >
      <View style={[styles.imageContainer, { backgroundColor: typeBg }]}>
        <Image
          source={{ uri: imageUri }}
          style={StyleSheet.absoluteFillObject}
          contentFit="cover"
          cachePolicy="memory-disk"
          accessibilityIgnoresInvertColors
        />
      </View>

      <View style={styles.content}>
        <View style={[styles.tag, { backgroundColor: typeBg }]}>
          <AppText style={[styles.tagText, { color: typeColor }]}>
            {mapEventType(event.type)}
          </AppText>
        </View>

        <AppText style={styles.title} numberOfLines={1}>
          {event.title}
        </AppText>

        <View style={styles.detailRow}>
          <Feather name="map-pin" size={14} color={theme.colors.grey} />
          <AppText style={styles.detailText} numberOfLines={1}>
            {event.localisationName}
          </AppText>
        </View>

        <View style={styles.detailRow}>
          <Feather name="calendar" size={14} color={theme.colors.grey} />
          <AppText style={styles.detailText}>
            {formattedDate} - {formattedTime}
          </AppText>
        </View>
      </View>

      {onEdit !== undefined && (
        <Pressable
          style={styles.editButton}
          accessibilityLabel={`Modifier l'évènement ${event.title}`}
          hitSlop={8}
          onPress={onEdit}
        >
          <Feather name="edit-2" size={16} color={theme.colors.primaryEco} />
        </Pressable>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.white,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    ...theme.shadows.card,
    borderRadius: 40,
  },
  imageContainer: {
    width: LIST_THUMBNAIL_SIZE,
    height: LIST_THUMBNAIL_SIZE,
    borderRadius: LIST_THUMBNAIL_RADIUS,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  content: {
    flex: 1,
  },
  editButton: {
    width: 36,
    height: 36,
    marginLeft: theme.spacing.sm,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: `${theme.colors.primaryEco}15`,
  },
  tag: {
    alignSelf: 'flex-start',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: 10,
    marginBottom: 4,
  },
  tagText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.black,
    marginBottom: 4,
    // Add underline if desired, but image doesn't strictly require it
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  detailText: {
    fontSize: 12,
    color: theme.colors.grey,
    marginLeft: 6,
    flex: 1,
  },
});
