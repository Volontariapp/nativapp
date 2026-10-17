import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { useStyles } from '@/context/ThemeContext';
import type { AppTheme } from '@/shared/themes/theme';
import type { AppEvent } from '@/api/event/event.api';
import { getEventImageUri } from '@/api/event/event-cover.utils';
import { EventStatusBadge } from './EventStatusBadge';
import { DETAIL_COVER_HEIGHT } from './event-image-frames';

interface EventCoverProps {
  event: AppEvent;
}

export function EventCover({ event }: EventCoverProps): React.JSX.Element {
  const styles = useStyles(createStyles);
  const imageUri = getEventImageUri(event);

  return (
    <View style={styles.container}>
      <Image source={{ uri: imageUri }} style={styles.coverImage} contentFit="cover" />
      <EventStatusBadge
        state={event.state}
        endDate={event.endAt}
        startDate={event.startAt}
        style={styles.badge}
      />
    </View>
  );
}

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      height: DETAIL_COVER_HEIGHT,
      width: '100%',
      position: 'relative',
      marginBottom: theme.spacing.lg,
    },
    coverImage: {
      width: '100%',
      height: '100%',
    },
    badge: {
      position: 'absolute',
      top: theme.spacing.md,
      left: theme.spacing.md,
      zIndex: 2,
    },
  });
