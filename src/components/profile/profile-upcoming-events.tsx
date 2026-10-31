import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  View,
  type ListRenderItemInfo,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { AppButton } from '@/components/buttons/AppButton';
import { AppText } from '@/components/typography/AppText';
import type { AppEvent } from '@/api/event/event.api';
import { useAppTheme, useStyles } from '@/context/ThemeContext';
import type { AppTheme } from '@/shared/themes/theme';
import type { PaginatedEventListData } from './profile-events.types';
import { UpcomingEventCard } from './upcoming-event-card';
import { ProfileEventsCarouselNav } from './profile-events-carousel-nav';

interface ProfileUpcomingEventsProps {
  data: PaginatedEventListData;
  /** Titre de la section ; « À venir » par défaut. */
  title?: string;
  /** Limite l'affichage aux premiers évènements, sans pagination (le compte reste total). */
  limit?: number;
  /** Une seule carte à la fois, parcourue avec des flèches ; pas de « Voir plus ». */
  carousel?: boolean;
}

const EMPTY_ICON_SIZE = 28;

const keyExtractor = (event: AppEvent): string => event.id;

const renderEvent = ({ item, index }: ListRenderItemInfo<AppEvent>): React.JSX.Element => (
  <UpcomingEventCard event={item} featured={index === 0} />
);

function Separator(): React.JSX.Element {
  const styles = useStyles(createStyles);
  return <View style={styles.separator} />;
}

function EmptyState(): React.JSX.Element {
  const { theme } = useAppTheme();
  const styles = useStyles(createStyles);

  return (
    <View style={styles.empty}>
      <Feather name="calendar" size={EMPTY_ICON_SIZE} color={theme.colors.primarySocio} />
      <AppText style={styles.emptyTitle}>Rien de prévu pour le moment</AppText>
      <AppText style={styles.emptyText}>
        Explore les événements autour de toi et inscris-toi : ils apparaîtront ici.
      </AppText>
    </View>
  );
}

export function ProfileUpcomingEvents({
  data,
  title = 'À venir',
  limit,
  carousel = false,
}: ProfileUpcomingEventsProps): React.JSX.Element {
  const { theme } = useAppTheme();
  const styles = useStyles(createStyles);
  const hasEvents = data.events.length > 0;
  const isLimited = limit !== undefined;
  const visibleEvents = isLimited ? data.events.slice(0, limit) : data.events;
  const [rawIndex, setRawIndex] = useState(0);
  const total = data.events.length;
  const index = Math.min(rawIndex, Math.max(total - 1, 0));
  const currentEvent = data.events[index];
  const { hasNextPage, fetchNextPage, isFetchingNextPage } = data;

  useEffect(() => {
    if (carousel && hasNextPage && !isFetchingNextPage && total > 0 && index === total - 1) {
      fetchNextPage();
    }
  }, [carousel, hasNextPage, isFetchingNextPage, total, index, fetchNextPage]);

  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <AppText style={styles.label} accessibilityRole="header">
          {title}
        </AppText>
        {hasEvents && (
          <View style={styles.count}>
            <AppText style={styles.countText}>{String(data.events.length)}</AppText>
          </View>
        )}
        {carousel && hasEvents && (
          <View style={styles.nav}>
            <ProfileEventsCarouselNav
              index={index}
              total={total}
              onPrevious={() => {
                setRawIndex(Math.max(index - 1, 0));
              }}
              onNext={() => {
                setRawIndex(Math.min(index + 1, total - 1));
              }}
            />
          </View>
        )}
      </View>

      {data.isLoading ? (
        <ActivityIndicator testID="upcoming-events-loader" color={theme.colors.primaryEco} />
      ) : carousel && currentEvent !== undefined ? (
        <UpcomingEventCard event={currentEvent} featured />
      ) : hasEvents ? (
        <>
          <FlatList
            data={visibleEvents}
            keyExtractor={keyExtractor}
            renderItem={renderEvent}
            ItemSeparatorComponent={Separator}
            scrollEnabled={false}
          />
          {data.hasNextPage && !isLimited && (
            <View style={styles.more}>
              <AppButton
                variant="eco"
                size="small"
                text={data.isFetchingNextPage ? 'Chargement...' : 'Voir plus'}
                disabled={data.isFetchingNextPage}
                onPress={data.fetchNextPage}
              />
            </View>
          )}
        </>
      ) : (
        <EmptyState />
      )}
    </View>
  );
}

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    section: {
      marginBottom: theme.spacing.xl,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: theme.spacing.md,
    },
    label: {
      fontSize: theme.typography.fontSize.sm,
      fontWeight: theme.typography.fontWeight.bold,
      color: theme.colors.grey,
      textTransform: 'uppercase',
      letterSpacing: 1,
    },
    count: {
      marginLeft: theme.spacing.sm,
      minWidth: 22,
      alignItems: 'center',
      paddingHorizontal: theme.spacing.sm - 2,
      paddingVertical: 2,
      borderRadius: theme.radius.full,
      backgroundColor: theme.colors.badgeSocioBackground,
    },
    countText: {
      fontSize: theme.typography.fontSize.xs,
      fontWeight: theme.typography.fontWeight.bold,
      color: theme.colors.primarySocio,
    },
    nav: {
      marginLeft: 'auto',
    },
    separator: {
      height: theme.spacing.md,
    },
    more: {
      alignItems: 'center',
      marginTop: theme.spacing.md,
    },
    empty: {
      alignItems: 'center',
      padding: theme.spacing.xl,
      borderRadius: theme.radius.lg,
      backgroundColor: theme.colors.badgeSocioBackground,
    },
    emptyTitle: {
      marginTop: theme.spacing.md,
      fontSize: theme.typography.fontSize.md,
      fontWeight: theme.typography.fontWeight.bold,
    },
    emptyText: {
      marginTop: theme.spacing.xs,
      textAlign: 'center',
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.grey,
    },
  });
