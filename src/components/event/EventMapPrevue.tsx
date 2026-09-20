import React, { useMemo } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { EventType } from '@volontariapp/contracts';
import { AppText } from '@/components/typography/AppText';
import { AppIcons } from '@/components/media/AppIcons';
import { AppButton } from '@/components/buttons/AppButton';
import { AppIconsButton } from '@/components/buttons/AppIconsButton';
import { AppBadgeButton } from '@/components/buttons/AppBadgeButton';
import { useAppTheme, useStyles } from '@/context/ThemeContext';
import type { AppTheme } from '@/shared/themes/theme';
import type { AppEvent } from '@/api/event/event.api';
import { getFakeEcologyImage } from '@/utils/fake-images.util';

export interface EventMapPrevueProps {
  event: AppEvent;
  onOpen?: (event: AppEvent) => void;
  onClose?: () => void;
}

export function EventMapPrevue({
  event,
  onOpen,
  onClose,
}: EventMapPrevueProps): React.JSX.Element {
  const { theme } = useAppTheme();
  const styles = useStyles(createStyles);

  const isEco =
    event.type === EventType.EVENT_TYPE_ECOLOGY ||
    (event.type as unknown) === 'EVENT_TYPE_ECOLOGY';

  const dateString = useMemo(() => {
    if (event.startAt.length > 0) {
      try {
        const date = new Date(event.startAt);
        const formattedDate = date.toLocaleDateString('fr-FR', {
          day: 'numeric',
          month: 'short',
        });
        const formattedTime = date.toLocaleTimeString('fr-FR', {
          hour: '2-digit',
          minute: '2-digit',
        });
        return `${formattedDate}, ${formattedTime}`;
      } catch {
        return event.startAt;
      }
    }
    return 'Date à définir';
  }, [event.startAt]);

  const fakeImageUrl = useMemo(() => getFakeEcologyImage(event.id), [event.id]);

  const handleOpen = (): void => {
    onOpen?.(event);
  };

  const hasLocation = event.localisationName.length > 0;

  return (
    <View style={styles.container}>
      {/* Header bar: category badge + close button */}
      <View style={styles.header}>
        <AppBadgeButton
          label={isEco ? 'Écologie' : 'Social'}
          variant={isEco ? 'eco' : 'socio'}
          onPress={handleOpen}
        />
        {onClose != null && (
          <AppIconsButton
            icon="x"
            size={24}
            variant="white"
            iconColor={theme.colors.grey}
            onPress={onClose}
            accessibilityLabel="Fermer la prévisualisation"
          />
        )}
      </View>

      {/* Main card content clickable */}
      <Pressable onPress={handleOpen} style={styles.body}>
        {fakeImageUrl.length > 0 && (
          <Image source={{ uri: fakeImageUrl }} style={styles.thumbnail} contentFit="cover" />
        )}

        <View style={styles.details}>
          <AppText style={styles.title} numberOfLines={1}>
            {event.title}
          </AppText>

          <View style={styles.metaRow}>
            <AppIcons icon="calendar" iconLibrary="Feather" size={13} color={theme.colors.grey} />
            <AppText style={styles.metaText} numberOfLines={1}>
              {dateString}
            </AppText>
          </View>

          <View style={styles.metaRow}>
            <AppIcons icon="map-pin" iconLibrary="Feather" size={13} color={theme.colors.grey} />
            <AppText style={styles.metaText} numberOfLines={1}>
              {hasLocation ? event.localisationName : 'Lieu non spécifié'}
            </AppText>
          </View>
        </View>
      </Pressable>

      {/* Bottom action button */}
      <AppButton
        text="Voir l'événement"
        variant={isEco ? 'eco' : 'socio'}
        size="small"
        onPress={handleOpen}
      />
    </View>
  );
}

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      position: 'absolute',
      bottom: 24,
      left: 16,
      right: 16,
      backgroundColor: theme.colors.white,
      borderRadius: theme.radius.lg,
      padding: theme.spacing.md,
      zIndex: 1150,
      ...theme.shadows.card,
      shadowColor: theme.colors.black,
      shadowOpacity: 0.18,
      shadowRadius: 8,
      elevation: 8,
      borderWidth: 1,
      borderColor: theme.colors.lightGrey,
      gap: theme.spacing.sm,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    body: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.md,
    },
    thumbnail: {
      width: 60,
      height: 60,
      borderRadius: theme.radius.md,
      backgroundColor: theme.colors.lightGrey,
    },
    details: {
      flex: 1,
      gap: 3,
    },
    title: {
      fontSize: 15,
      fontWeight: theme.typography.fontWeight.bold,
      color: theme.colors.text,
    },
    metaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
    },
    metaText: {
      fontSize: 12,
      color: theme.colors.grey,
      flexShrink: 1,
    },
  });
