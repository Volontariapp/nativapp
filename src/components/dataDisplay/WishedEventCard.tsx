import React from 'react';
import { View, StyleSheet } from 'react-native';
import { AppText } from '@/components/typography/AppText';
import { theme } from '@/shared/themes/theme';
import type { AppEvent } from '@/api/event/event.api';
import { mapEventType } from '@/shared/lib/event-mappers.utils';
import { EventType } from '@volontariapp/contracts';
import Feather from 'react-native-vector-icons/Feather';
import { AppIconsButton } from '@/components';
import { useUserSocialActions } from '@/api/social/hooks/use-user-social-actions';

export interface EventCardProps {
  event: AppEvent;
}

export function WishedEventCard({ event }: EventCardProps): React.JSX.Element {
  const { unwish } = useUserSocialActions();

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

  return (
    <View style={styles.card}>
      <View style={[styles.imageContainer, { backgroundColor: typeBg }]}>
        <Feather
          name={isEcology ? 'leaf' : isSocial ? 'users' : 'help-circle'}
          size={32}
          color={typeColor}
        />
      </View>

      <View style={styles.content}>
        <View style={[styles.tag, { backgroundColor: typeBg }]}>
          <AppText style={[styles.tagText, { color: typeColor }]}>{mapEventType(event.type)}</AppText>
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
      <View style={styles.trash}>
        <AppIconsButton
          icon="x"
          size={42}
          variant="danger"
          onPress={() => {
            void unwish(event.id);
          }}
        />
      </View>
    </View>
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
    width: 70,
    height: 70,
    borderRadius: 15,
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
  trash: {
    position: 'absolute',
    right: 10,
    padding: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
