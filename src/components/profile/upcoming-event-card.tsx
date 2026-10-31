import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Feather from 'react-native-vector-icons/Feather';
import { Image } from 'expo-image';
import { AppText } from '@/components/typography/AppText';
import { EventStatusBadge } from '@/components/event/EventStatusBadge';
import { getEventImageUri } from '@/api/event/event-cover.utils';
import type { AppEvent } from '@/api/event/event.api';
import type { MainStackParamList } from '@/navigation/stacks/MainStack';
import { useAppTheme, useStyles } from '@/context/ThemeContext';
import { getCountdownLabel, getEventDateParts } from '@/shared/lib/event-date.utils';
import type { AppTheme } from '@/shared/themes/theme';
import { getEventTone } from './event-tone.utils';

export interface UpcomingEventCardProps {
  event: AppEvent;
  /** Met la photo de l'évènement en tête de carte (réservé au prochain évènement). */
  featured?: boolean;
  onPress?: () => void;
}

const ICON_SIZE = 14;

export function UpcomingEventCard({
  event,
  featured = false,
  onPress,
}: UpcomingEventCardProps): React.JSX.Element {
  const { theme } = useAppTheme();
  const styles = useStyles(createStyles);
  const navigation = useNavigation<NativeStackNavigationProp<MainStackParamList>>();

  const tone = getEventTone(event.type, theme);
  const parts = getEventDateParts(event.startAt);
  const countdown = getCountdownLabel(event.startAt, event.endAt);
  const accessibilityLabel =
    parts === null
      ? `${event.title}, ${event.localisationName}`
      : `${event.title}, ${parts.longDate} à ${parts.time}, ${event.localisationName}`;

  const handlePress = (): void => {
    if (onPress) {
      onPress();
      return;
    }
    navigation.navigate('EventDetail', { event });
  };

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={handlePress}
    >
      {featured && (
        <Image
          testID="upcoming-event-cover"
          source={{ uri: getEventImageUri(event) }}
          style={styles.cover}
          contentFit="cover"
          cachePolicy="memory-disk"
          accessibilityIgnoresInvertColors
        />
      )}

      <View style={styles.row}>
        <View style={[styles.dateTile, { backgroundColor: tone.surface }]}>
          <AppText style={[styles.dateWeekday, { color: tone.accent }]}>
            {parts?.weekday ?? ''}
          </AppText>
          <AppText style={[styles.dateDay, { color: tone.accent }]}>{parts?.day ?? '-'}</AppText>
          <AppText style={[styles.dateMonth, { color: tone.accent }]}>{parts?.month ?? ''}</AppText>
        </View>

        <View style={styles.content}>
          <View style={styles.badges}>
            {countdown !== null && (
              <View style={[styles.countdown, { backgroundColor: tone.surface }]}>
                <AppText style={[styles.countdownText, { color: tone.accent }]}>
                  {countdown}
                </AppText>
              </View>
            )}
            <EventStatusBadge
              state={event.state}
              startDate={event.startAt}
              endDate={event.endAt}
              size="sm"
            />
          </View>

          <AppText style={styles.title} numberOfLines={2}>
            {event.title}
          </AppText>

          {parts !== null && (
            <View style={styles.detail}>
              <Feather name="clock" size={ICON_SIZE} color={theme.colors.grey} />
              <AppText style={styles.detailText}>{parts.time}</AppText>
            </View>
          )}
          <View style={styles.detail}>
            <Feather name="map-pin" size={ICON_SIZE} color={theme.colors.grey} />
            <AppText style={styles.detailText} numberOfLines={1}>
              {event.localisationName}
            </AppText>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    card: {
      backgroundColor: theme.colors.white,
      borderRadius: theme.radius.lg,
      overflow: 'hidden',
      ...theme.shadows.card,
    },
    cardPressed: {
      opacity: 0.85,
    },
    cover: {
      width: '100%',
      height: 120,
      backgroundColor: theme.colors.skeletonGrey,
    },
    row: {
      flexDirection: 'row',
      padding: theme.spacing.md,
    },
    dateTile: {
      width: 64,
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: theme.spacing.sm,
      marginRight: theme.spacing.md,
      borderRadius: theme.radius.md,
    },
    dateWeekday: {
      fontSize: 10,
      fontWeight: theme.typography.fontWeight.semibold,
      letterSpacing: 0.5,
    },
    dateDay: {
      fontSize: theme.typography.fontSize.xl,
      fontWeight: theme.typography.fontWeight.bold,
    },
    dateMonth: {
      fontSize: theme.typography.fontSize.xs,
      fontWeight: theme.typography.fontWeight.semibold,
    },
    content: {
      flex: 1,
    },
    badges: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      alignItems: 'center',
      gap: theme.spacing.sm,
      marginBottom: theme.spacing.sm,
    },
    countdown: {
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.xs,
      borderRadius: theme.radius.full,
    },
    countdownText: {
      fontSize: 10,
      fontWeight: theme.typography.fontWeight.bold,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    title: {
      fontSize: theme.typography.fontSize.md,
      fontWeight: theme.typography.fontWeight.bold,
      marginBottom: theme.spacing.xs,
    },
    detail: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 2,
    },
    detailText: {
      flex: 1,
      marginLeft: theme.spacing.sm - 2,
      fontSize: theme.typography.fontSize.xs,
      color: theme.colors.grey,
    },
  });
