import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { AppText } from '@/components/typography/AppText';
import { theme } from '@/shared/themes/theme';
import { EventState } from '@volontariapp/contracts';
import type { AppEvent } from '@/api/event/event.api';
import { getFakeEcologyImage } from '@/utils/fake-images.util';

interface EventCoverProps {
  event: AppEvent;
}

export function EventCover({ event }: EventCoverProps) {
  const placeholderUrl = getFakeEcologyImage(event.id);

  const getStatusConfig = () => {
    switch (event.state) {
      case EventState.EVENT_STATE_PUBLISHED:
        return { label: 'Ouvert', color: theme.colors.success };
      case EventState.EVENT_STATE_DRAFT:
        return { label: 'En cours', color: theme.colors.warning };
      case EventState.EVENT_STATE_UNSPECIFIED:
        return { label: 'Terminé', color: theme.colors.grey };
      case EventState.EVENT_STATE_CANCELLED:
        return { label: 'Annulé', color: theme.colors.danger };
      default:
        return { label: 'Brouillon', color: theme.colors.lightGrey };
    }
  };

  const status = getStatusConfig();

  return (
    <View style={styles.container}>
      <Image source={{ uri: placeholderUrl }} style={styles.coverImage} contentFit="cover" />
      <View style={[styles.badge, { backgroundColor: status.color }]}>
        <AppText style={styles.badgeText}>{status.label}</AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 200,
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
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.radius.full,
  },
  badgeText: {
    color: theme.colors.white,
    fontSize: 12,
    fontWeight: theme.typography.fontWeight.bold,
  },
});
