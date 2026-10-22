import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  type ListRenderItemInfo,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Feather from 'react-native-vector-icons/Feather';
import Animated, { LinearTransition } from 'react-native-reanimated';

import AppHeader from '@/components/layout/AppHeader';
import { AppText } from '@/components/typography/AppText';
import { EventCard } from '@/components/dataDisplay/EventCard';
import { WishedEventCard } from '@/components/dataDisplay/WishedEventCard';
import { MyEventItem } from '@/components/event/my-event-item';
import { useAppTheme, useStyles } from '@/context/ThemeContext';
import type { AppTheme } from '@/shared/themes/theme';
import { useTabBarContentInset } from '@/navigation/hooks/useTabBarContentInset';

import type { AppEvent } from '@/api/event/event.api';
import type { MainStackParamList } from '@/navigation/stacks/MainStack';
import type { CreateEventStackParamList } from '@/navigation/stacks/CreateEventStack';
import type { DateData } from 'react-native-calendars';
import { ManageHubFilters } from './ManageHubFilters';
import { ManageHubEmptyState } from './ManageHubEmptyState';
import { useManageHubData } from './hooks/use-manage-hub-data';
import type { EventTypeFilter, ManageTabType, ParticipatedScope } from './manage-hub.utils';

export function ManageHubScreen(): React.JSX.Element {
  const { theme } = useAppTheme();
  const styles = useStyles(createStyles);
  const tabBarInset = useTabBarContentInset();

  const [activeTab, setActiveTab] = useState<ManageTabType>('participated');
  const [typeFilter, setTypeFilter] = useState<EventTypeFilter>('all');
  const [participatedScope, setParticipatedScope] = useState<ParticipatedScope>('all');
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<string | undefined>(undefined);

  const rootNavigation = useNavigation<NativeStackNavigationProp<MainStackParamList>>();
  const stackNavigation = useNavigation<NativeStackNavigationProp<CreateEventStackParamList>>();

  const {
    participatedEvents,
    filteredEvents,
    participatedCount,
    wishedCount,
    myEventsCount,
    liveCount,
    upcomingCount,
    onRefresh,
    isRefreshing,
    handleEndReached,
    currentIsInitialLoading,
    currentIsFetchingNext,
  } = useManageHubData(activeTab, typeFilter, participatedScope);

  // Calcul des dates marquées pour le calendrier
  const markedDates = useMemo(() => {
    const dates: Record<
      string,
      { customStyles: { container: Record<string, unknown>; text: Record<string, unknown> } }
    > = {};

    participatedEvents.forEach((event) => {
      if (event.startAt.length > 0) {
        const dateStr = event.startAt.split('T')[0];
        if (dateStr != null && dateStr.length > 0) {
          dates[dateStr] = {
            customStyles: {
              container: {
                backgroundColor: theme.colors.primaryEco,
                borderRadius: 18,
              },
              text: {
                color: theme.colors.white,
                fontWeight: 'bold',
              },
            },
          };
        }
      }
    });

    if (selectedCalendarDate != null && selectedCalendarDate.length > 0) {
      dates[selectedCalendarDate] = {
        customStyles: {
          container: {
            borderWidth: 2,
            borderColor: theme.colors.primarySocio,
            borderRadius: 18,
          },
          text: {
            color: theme.colors.text,
            fontWeight: 'bold',
          },
        },
      };
    }

    return dates;
  }, [participatedEvents, selectedCalendarDate, theme]);

  const handleEventPress = useCallback(
    (event: AppEvent) => {
      rootNavigation.navigate('EventDetail', { event });
    },
    [rootNavigation],
  );

  const handleEventEdit = useCallback(
    (event: AppEvent) => {
      rootNavigation.navigate('EventManagement', { eventId: event.id, initialEvent: event });
    },
    [rootNavigation],
  );

  const handleExplorePress = useCallback(() => {
    rootNavigation.navigate('MainTabs', { screen: 'explorer' });
  }, [rootNavigation]);

  const handleCreatePress = useCallback(() => {
    stackNavigation.navigate('EventForm');
  }, [stackNavigation]);

  // Rendu des cartes selon l'onglet actif
  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<AppEvent>) => {
      if (activeTab === 'participated') {
        return (
          <View style={styles.cardItemWrapper}>
            <EventCard
              event={item}
              onPress={() => {
                handleEventPress(item);
              }}
            />
          </View>
        );
      }
      if (activeTab === 'wished') {
        return <WishedEventCard event={item} variant="A" />;
      }
      return (
        <View style={styles.cardItemWrapper}>
          <MyEventItem
            event={item}
            onPress={() => {
              handleEventPress(item);
            }}
            onEdit={() => {
              handleEventEdit(item);
            }}
          />
        </View>
      );
    },
    [activeTab, handleEventPress, handleEventEdit, styles.cardItemWrapper],
  );

  const keyExtractor = useCallback((item: AppEvent) => item.id, []);

  const handleDayPress = useCallback((day: DateData) => {
    setSelectedCalendarDate(day.dateString);
  }, []);

  return (
    <View style={styles.container}>
      <AppHeader />

      {/* Titre et en-tête de page */}
      <View style={styles.headerSection}>
        <View style={styles.headerRow}>
          <View>
            <AppText style={styles.pageTitle}>Gérer mes activités</AppText>
            <AppText style={styles.pageSubtitle}>
              Missions, sauvegardes et initiatives organisées
            </AppText>
          </View>
        </View>

        <ManageHubFilters
          activeTab={activeTab}
          onTabChange={setActiveTab}
          participatedCount={participatedCount}
          wishedCount={wishedCount}
          myEventsCount={myEventsCount}
          participatedScope={participatedScope}
          onScopeChange={setParticipatedScope}
          liveCount={liveCount}
          upcomingCount={upcomingCount}
          typeFilter={typeFilter}
          onTypeFilterChange={setTypeFilter}
        />
      </View>

      {/* Astuce d'interaction Wishlist (Démo A validée) */}
      {activeTab === 'wished' && wishedCount > 0 && (
        <View style={styles.wishlistHintContainer}>
          <View style={styles.wishlistHintBanner}>
            <Feather name="info" size={13} color={theme.colors.primaryEco} />
            <AppText style={styles.wishlistHintText}>
              Glissez à droite pour participer, à gauche pour retirer (ou utilisez les boutons
              directs).
            </AppText>
          </View>
        </View>
      )}

      {/* Contenu de la liste avec pull-to-refresh et pagination */}
      {currentIsInitialLoading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={theme.colors.primaryEco} />
        </View>
      ) : (
        <Animated.FlatList
          itemLayoutAnimation={LinearTransition.duration(220)}
          data={filteredEvents}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          contentContainerStyle={[styles.listContent, tabBarInset]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={onRefresh}
              tintColor={theme.colors.primaryEco}
              colors={[theme.colors.primaryEco]}
            />
          }
          onEndReached={handleEndReached}
          onEndReachedThreshold={0.5}
          ListEmptyComponent={
            <ManageHubEmptyState
              activeTab={activeTab}
              markedDates={markedDates}
              onDayPress={handleDayPress}
              onExplorePress={handleExplorePress}
              onCreatePress={handleCreatePress}
            />
          }
          ListFooterComponent={
            currentIsFetchingNext ? (
              <View style={styles.footerLoader}>
                <ActivityIndicator size="small" color={theme.colors.primaryEco} />
              </View>
            ) : null
          }
        />
      )}
    </View>
  );
}

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    headerSection: {
      paddingHorizontal: 16,
      paddingTop: 8,
      paddingBottom: 8,
    },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 12,
    },
    pageTitle: {
      fontSize: 22,
      fontWeight: '800',
      color: theme.colors.text,
      letterSpacing: -0.3,
    },
    pageSubtitle: {
      fontSize: 13,
      color: theme.colors.grey,
      marginTop: 2,
    },
    listContent: {
      paddingHorizontal: 16,
      paddingBottom: 24,
    },
    cardItemWrapper: {
      marginBottom: 12,
    },
    loaderContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    footerLoader: {
      paddingVertical: 16,
      alignItems: 'center',
    },
    wishlistHintContainer: {
      paddingHorizontal: 16,
      marginBottom: 10,
    },
    wishlistHintBanner: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: 12,
      paddingVertical: 8,
      backgroundColor:
        theme.colors.text === '#000' ? 'rgba(47, 110, 62, 0.08)' : 'rgba(47, 110, 62, 0.18)',
      borderRadius: 12,
    },
    wishlistHintText: {
      flex: 1,
      fontSize: 12,
      color: theme.colors.primaryEco,
      fontWeight: '600',
    },
  });
