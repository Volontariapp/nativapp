import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';
import Feather from 'react-native-vector-icons/Feather';
import { AppText } from '@/components/typography/AppText';
import { useAppTheme, useStyles } from '@/context/ThemeContext';
import type { AppTheme } from '@/shared/themes/theme';
import type { PostImage } from '@/api/post/post-images.types';
import type { AppEvent } from '@/api/event/event.api';
import { getEventImageUri } from '@/api/event/event-cover.utils';
import { EventCoverPicker } from './event-cover-picker';
import { EventImagePreviews } from './event-image-previews';
import { DETAIL_COVER_HEIGHT } from './event-image-frames';

const COVER_STATUS_NOTES: Partial<Record<NonNullable<AppEvent['coverStatus']>, string>> = {
  PENDING: 'Photo en cours de vérification',
  REJECTED: 'Photo refusée : choisissez-en une autre',
};

interface EventCoverEditorProps {
  event: AppEvent | undefined;
  /** Nouvelle photo choisie, ou undefined tant que l'organisateur garde l'actuelle. */
  cover: PostImage | undefined;
  onAdd: () => void;
  onRetry: (id: string) => void;
  onRemove: (id: string) => void;
}

/** Photo actuelle de l'évènement avec de quoi la remplacer ; la nouvelle photo s'enregistre avec le reste du formulaire. */
export function EventCoverEditor({
  event,
  cover,
  onAdd,
  onRetry,
  onRemove,
}: EventCoverEditorProps): React.JSX.Element {
  const { theme } = useAppTheme();
  const styles = useStyles(createStyles);

  if (cover !== undefined) {
    return (
      <View style={styles.container}>
        <EventCoverPicker cover={cover} onAdd={onAdd} onRetry={onRetry} onRemove={onRemove} />
        <EventImagePreviews imageUri={cover.source.uri} />
      </View>
    );
  }

  const note = event?.coverStatus === undefined ? undefined : COVER_STATUS_NOTES[event.coverStatus];

  return (
    <View style={styles.container}>
      <View style={styles.current}>
        {event !== undefined && (
          <Image
            testID="event-cover-editor-current"
            source={{ uri: getEventImageUri(event) }}
            style={StyleSheet.absoluteFill}
            contentFit="cover"
          />
        )}
        <Pressable
          style={styles.changeButton}
          accessibilityLabel="Changer la photo"
          onPress={onAdd}
        >
          <Feather name="camera" size={16} color={theme.colors.white} />
          <AppText style={styles.changeText}>Changer la photo</AppText>
        </Pressable>
      </View>
      {note !== undefined && <AppText style={styles.note}>{note}</AppText>}
    </View>
  );
}

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      marginBottom: theme.spacing.xl,
    },
    current: {
      width: '100%',
      height: DETAIL_COVER_HEIGHT,
      borderRadius: theme.radius.md,
      overflow: 'hidden',
      backgroundColor: theme.colors.lightGrey,
      justifyContent: 'flex-end',
      alignItems: 'flex-end',
    },
    changeButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.xs,
      margin: theme.spacing.sm,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      borderRadius: theme.radius.full,
      backgroundColor: 'rgba(0,0,0,0.6)',
    },
    changeText: {
      fontSize: 13,
      fontWeight: '600',
      color: theme.colors.white,
    },
    note: {
      marginTop: theme.spacing.xs,
      fontSize: 13,
      color: theme.colors.grey,
    },
  });
