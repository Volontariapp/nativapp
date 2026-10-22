import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  Pressable,
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  type ListRenderItemInfo,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Feather from 'react-native-vector-icons/Feather';
import { EventType, EventState } from '@volontariapp/contracts';
import { normalizeEventState } from '@/shared/lib/event-mappers.utils';

import AppHeader from '@/components/layout/AppHeader';
import { AppText } from '@/components/typography/AppText';
import { AppButton } from '@/components/buttons/AppButton';
import { EventCard } from '@/components/dataDisplay/EventCard';
import { WishedEventCard } from '@/components/dataDisplay/WishedEventCard';
import { MyEventItem } from '@/components/event/my-event-item';
import { AppCalendar } from '@/components/ui/AppCalendar';
import { useAppTheme, useStyles } from '@/context/ThemeContext';
import type { AppTheme } from '@/shared/themes/theme';
import { useTabBarContentInset } from '@/navigation/hooks/useTabBarContentInset';
import { getEventStatusConfig, isEventDatePast } from '@/components/event/event-status.utils';

import { useGetParticipatedEvents } from '@/api/event/hooks/use-get-participated-events';
import { useGetWishedEvents } from '@/api/event/hooks/use-get-wished-events';
import { useGetMyEvents } from '@/api/event/hooks/use-get-my-events';
import type { AppEvent } from '@/api/event/event.api';
import type { MainStackParamList } from '@/navigation/stacks/MainStack';
import type { CreateEventStackParamList } from '@/navigation/stacks/CreateEventStack';

type ManageTabType = 'participated' | 'wished' | 'created';
type EventTypeFilter = 'all' | 'social' | 'ecology';
type ParticipatedScope = 'all' | 'live' | 'upcoming';

/**
 * Tri pour afficher toujours l'événement qui arrive le plus vite :
 * 1. Événements en direct (en cours en ce moment) -> en tête
 * 2. Événements à venir (startAt > now) -> triés par date de début croissante (le plus proche en premier)
 * 3. Événements passés (endAt < now) -> placés à la fin, triés du plus récent au plus ancien
 */
export function sortEventsByEarliestUpcoming(a: AppEvent, b: AppEvent, now = Date.now()): number {
  const startA = new Date(a.startAt).getTime();
  const endA = new Date(a.endAt || a.startAt).getTime();
  const startB = new Date(b.startAt).getTime();
  const endB = new Date(b.endAt || b.startAt).getTime();

  const isInvalidA = Number.isNaN(startA);
  const isInvalidB = Number.isNaN(startB);
  if (isInvalidA && isInvalidB) return 0;
  if (isInvalidA) return 1;
  if (isInvalidB) return -1;

  const isLiveA =
    (now >= startA && now <= endA) ||
    normalizeEventState(a.state) === EventState.EVENT_STATE_IN_PROGRESS;
  const isPastA =
    !isLiveA && (endA < now || normalizeEventState(a.state) === EventState.EVENT_STATE_FINISHED);
  const catA = isLiveA ? 0 : isPastA ? 2 : 1;

  const isLiveB =
    (now >= startB && now <= endB) ||
    normalizeEventState(b.state) === EventState.EVENT_STATE_IN_PROGRESS;
  const isPastB =
    !isLiveB && (endB < now || normalizeEventState(b.state) === EventState.EVENT_STATE_FINISHED);
  const catB = isLiveB ? 0 : isPastB ? 2 : 1;

  if (catA !== catB) {
    return catA - catB;
  }

  // Pour En direct ou À venir : celui qui arrive le plus vite en premier (startAt croissant)
  if (catA === 0 || catA === 1) {
    return startA - startB;
  }

  // Pour les événements passés : le plus récent en premier
  return endB - endA;
}

/**
 * Vérifie si un événement est considéré comme annulé :
 * - Statut explicite EventState.EVENT_STATE_CANCELLED
 * - Ou statut 'Annulé' calculé par la configuration de statut (ex: événement publié dont la date est passée)
 */
export function isEventCancelled(event: AppEvent): boolean {
  const state = normalizeEventState(event.state);
  if (state === EventState.EVENT_STATE_CANCELLED) {
    return true;
  }
  const isPast = isEventDatePast(event.endAt, event.startAt);
  const statusConfig = getEventStatusConfig(event.state, isPast);
  return statusConfig.label === 'Annulé';
}

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

  // Hooks pour les 3 catégories d'événements
  const {
    data: participatedData,
    isLoading: isParticipatedLoading,
    hasNextPage: hasNextParticipated,
    fetchNextPage: fetchNextParticipated,
    isFetchingNextPage: isFetchingNextParticipated,
    refetch: refetchParticipated,
    isRefetching: isRefetchingParticipated,
  } = useGetParticipatedEvents(10);

  const {
    data: wishedData,
    isLoading: isWishedLoading,
    hasNextPage: hasNextWished,
    fetchNextPage: fetchNextWished,
    isFetchingNextPage: isFetchingNextWished,
    refetch: refetchWished,
    isRefetching: isRefetchingWished,
  } = useGetWishedEvents(10);

  const {
    data: myEventsData,
    isLoading: isMyEventsLoading,
    hasNextPage: hasNextMyEvents,
    fetchNextPage: fetchNextMyEvents,
    isFetchingNextPage: isFetchingNextMyEvents,
    refetch: refetchMyEvents,
    isRefetching: isRefetchingMyEvents,
  } = useGetMyEvents(10);

  // Listes aplaties des événements (les événements annulés ne doivent jamais apparaître dans "En cours")
  const participatedEvents = useMemo(
    () =>
      (participatedData?.pages.flatMap((page) => page.events) ?? []).filter(
        (event) => !isEventCancelled(event),
      ),
    [participatedData],
  );

  const wishedEvents = useMemo(
    () => wishedData?.pages.flatMap((page) => page.events) ?? [],
    [wishedData],
  );

  const myEvents = useMemo(
    () => myEventsData?.pages.flatMap((page) => page.events) ?? [],
    [myEventsData],
  );

  // Compteurs totaux
  const participatedCount = participatedEvents.length;
  const wishedCount = wishedData?.pages[0]?.totalCount ?? wishedEvents.length;
  const myEventsCount = myEventsData?.pages[0]?.totalCount ?? myEvents.length;

  // Compteurs spécifiques aux événements en direct vs à venir
  const liveCount = useMemo(() => {
    const now = Date.now();
    return participatedEvents.filter((event) => {
      const start = new Date(event.startAt).getTime();
      const end = new Date(event.endAt).getTime();
      const isLiveByTime = now >= start && now <= end;
      const isLiveByState = normalizeEventState(event.state) === EventState.EVENT_STATE_IN_PROGRESS;
      return isLiveByTime || isLiveByState;
    }).length;
  }, [participatedEvents]);

  const upcomingCount = useMemo(() => {
    const now = Date.now();
    return participatedEvents.filter((event) => {
      const start = new Date(event.startAt).getTime();
      const isUpcomingByTime = now < start;
      const state = normalizeEventState(event.state);
      return (
        isUpcomingByTime &&
        state !== EventState.EVENT_STATE_FINISHED &&
        state !== EventState.EVENT_STATE_CANCELLED
      );
    }).length;
  }, [participatedEvents]);

  // Filtrage et tri des événements
  const filteredEvents = useMemo(() => {
    let list =
      activeTab === 'participated'
        ? participatedEvents
        : activeTab === 'wished'
          ? wishedEvents
          : myEvents;

    // 1. Distinction "En direct" vs "À venir" (spécifique à l'onglet En cours)
    if (activeTab === 'participated') {
      const now = Date.now();
      // Exclusion formelle des événements annulés dans l'onglet En cours
      list = list.filter((event) => !isEventCancelled(event));

      if (participatedScope === 'live') {
        list = list.filter((event) => {
          const start = new Date(event.startAt).getTime();
          const end = new Date(event.endAt).getTime();
          const isLiveByTime = now >= start && now <= end;
          const isLiveByState =
            normalizeEventState(event.state) === EventState.EVENT_STATE_IN_PROGRESS;
          return isLiveByTime || isLiveByState;
        });
      } else if (participatedScope === 'upcoming') {
        list = list.filter((event) => {
          const start = new Date(event.startAt).getTime();
          const isUpcomingByTime = now < start;
          const state = normalizeEventState(event.state);
          return isUpcomingByTime && state !== EventState.EVENT_STATE_FINISHED;
        });
      }
    }

    // 2. Filtre Type (Tous / Social / Écologie)
    if (typeFilter === 'social') {
      list = list.filter(
        (event) =>
          event.type === EventType.EVENT_TYPE_SOCIAL ||
          String(event.type) === EventType[EventType.EVENT_TYPE_SOCIAL],
      );
    } else if (typeFilter === 'ecology') {
      list = list.filter(
        (event) =>
          event.type === EventType.EVENT_TYPE_ECOLOGY ||
          String(event.type) === EventType[EventType.EVENT_TYPE_ECOLOGY],
      );
    }

    // 3. Tri : Toujours l'événement qui arrive le plus vite en premier
    const now = Date.now();
    const sorted = [...list].sort((a, b) => sortEventsByEarliestUpcoming(a, b, now));

    return sorted;
  }, [activeTab, participatedEvents, wishedEvents, myEvents, participatedScope, typeFilter]);

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

  const onRefresh = useCallback(() => {
    if (activeTab === 'participated') {
      void refetchParticipated();
    } else if (activeTab === 'wished') {
      void refetchWished();
    } else {
      void refetchMyEvents();
    }
  }, [activeTab, refetchParticipated, refetchWished, refetchMyEvents]);

  const isRefreshing =
    activeTab === 'participated'
      ? isRefetchingParticipated
      : activeTab === 'wished'
        ? isRefetchingWished
        : isRefetchingMyEvents;

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

  // Gestion du chargement suivant (pagination)
  const handleEndReached = useCallback(() => {
    if (activeTab === 'participated' && hasNextParticipated && !isFetchingNextParticipated) {
      void fetchNextParticipated();
    } else if (activeTab === 'wished' && hasNextWished && !isFetchingNextWished) {
      void fetchNextWished();
    } else if (activeTab === 'created' && hasNextMyEvents && !isFetchingNextMyEvents) {
      void fetchNextMyEvents();
    }
  }, [
    activeTab,
    hasNextParticipated,
    isFetchingNextParticipated,
    fetchNextParticipated,
    hasNextWished,
    isFetchingNextWished,
    fetchNextWished,
    hasNextMyEvents,
    isFetchingNextMyEvents,
    fetchNextMyEvents,
  ]);

  // État vide dédié à chaque onglet
  const renderEmptyComponent = () => {
    if (activeTab === 'participated') {
      return (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyBadgeHeader}>
            <Feather name="calendar" size={18} color={theme.colors.primaryEco} />
            <AppText style={styles.emptyBadgeTitle}>Mon Calendrier</AppText>
          </View>

          <AppText style={styles.emptyTitle}>Aucune mission en cours</AppText>
          <AppText style={styles.emptySubtitle}>
            Vous n'avez pas de mission active. Consultez votre calendrier ou trouvez votre prochain
            engagement :
          </AppText>

          {/* Calendrier interactif intégré dans l'état vide */}
          <View style={styles.calendarCard}>
            <AppCalendar
              markedDates={markedDates}
              onDayPress={(day) => {
                setSelectedCalendarDate(day.dateString);
              }}
              style={styles.calendarStyle}
            />
          </View>

          <AppButton
            variant="eco"
            text="Explorer les événements"
            icon="compass"
            iconLibrary="Feather"
            onPress={handleExplorePress}
            style={styles.emptyButton}
          />
        </View>
      );
    }

    if (activeTab === 'wished') {
      return (
        <View style={styles.emptyContainer}>
          <View style={[styles.emptyIconCircle, styles.emptyIconCircleSocio]}>
            <Feather name="heart" size={28} color={theme.colors.primarySocio} />
          </View>
          <AppText style={styles.emptyTitle}>Votre wishlist est vide</AppText>
          <AppText style={styles.emptySubtitle}>
            Enregistrez les initiatives qui vous inspirent depuis la carte pour les retrouver ici.
          </AppText>
          <AppButton
            variant="socio"
            text="Découvrir des missions"
            icon="map"
            iconLibrary="Feather"
            onPress={handleExplorePress}
            style={styles.emptyButton}
          />
        </View>
      );
    }

    return (
      <View style={styles.emptyContainer}>
        <View style={[styles.emptyIconCircle, styles.emptyIconCircleEco]}>
          <Feather name="plus-circle" size={28} color={theme.colors.primaryEco} />
        </View>
        <AppText style={styles.emptyTitle}>Aucun événement créé</AppText>
        <AppText style={styles.emptySubtitle}>
          Passez à l'action en créant votre propre mission bénévole sur le terrain.
        </AppText>
        <AppButton
          variant="eco"
          text="Créer un événement"
          icon="plus"
          iconLibrary="Feather"
          onPress={handleCreatePress}
          style={styles.emptyButton}
        />
      </View>
    );
  };

  const currentIsInitialLoading =
    activeTab === 'participated'
      ? isParticipatedLoading
      : activeTab === 'wished'
        ? isWishedLoading
        : isMyEventsLoading;

  const currentIsFetchingNext =
    activeTab === 'participated'
      ? isFetchingNextParticipated
      : activeTab === 'wished'
        ? isFetchingNextWished
        : isFetchingNextMyEvents;

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

        {/* Barre de navigation d'onglets (Segmented Control) */}
        <View style={styles.tabBarContainer}>
          {/* Onglet 1 : En cours */}
          <Pressable
            style={[styles.tabButton, activeTab === 'participated' && styles.tabButtonActive]}
            onPress={() => {
              setActiveTab('participated');
            }}
            accessibilityRole="tab"
            accessibilityState={{ selected: activeTab === 'participated' }}
            accessibilityLabel={`En cours, ${String(participatedCount)} événements`}
          >
            <Feather
              name="activity"
              size={15}
              color={activeTab === 'participated' ? theme.colors.white : theme.colors.grey}
            />
            <AppText style={[styles.tabText, activeTab === 'participated' && styles.tabTextActive]}>
              En cours
            </AppText>
            <View
              style={[
                styles.countBadge,
                activeTab === 'participated' ? styles.countBadgeActive : styles.countBadgeInactive,
              ]}
            >
              <AppText
                style={[
                  styles.countBadgeText,
                  activeTab === 'participated' && styles.countBadgeTextActive,
                ]}
              >
                {String(participatedCount)}
              </AppText>
            </View>
          </Pressable>

          {/* Onglet 2 : Wishlist */}
          <Pressable
            style={[styles.tabButton, activeTab === 'wished' && styles.tabButtonActive]}
            onPress={() => {
              setActiveTab('wished');
            }}
            accessibilityRole="tab"
            accessibilityState={{ selected: activeTab === 'wished' }}
            accessibilityLabel={`Wishlist, ${String(wishedCount)} événements`}
          >
            <Feather
              name="heart"
              size={15}
              color={activeTab === 'wished' ? theme.colors.white : theme.colors.grey}
            />
            <AppText style={[styles.tabText, activeTab === 'wished' && styles.tabTextActive]}>
              Wishlist
            </AppText>
            <View
              style={[
                styles.countBadge,
                activeTab === 'wished' ? styles.countBadgeActive : styles.countBadgeInactive,
              ]}
            >
              <AppText
                style={[
                  styles.countBadgeText,
                  activeTab === 'wished' && styles.countBadgeTextActive,
                ]}
              >
                {String(wishedCount)}
              </AppText>
            </View>
          </Pressable>

          {/* Onglet 3 : Créés */}
          <Pressable
            style={[styles.tabButton, activeTab === 'created' && styles.tabButtonActive]}
            onPress={() => {
              setActiveTab('created');
            }}
            accessibilityRole="tab"
            accessibilityState={{ selected: activeTab === 'created' }}
            accessibilityLabel={`Créés, ${String(myEventsCount)} événements`}
          >
            <Feather
              name="layers"
              size={15}
              color={activeTab === 'created' ? theme.colors.white : theme.colors.grey}
            />
            <AppText style={[styles.tabText, activeTab === 'created' && styles.tabTextActive]}>
              Créés
            </AppText>
            <View
              style={[
                styles.countBadge,
                activeTab === 'created' ? styles.countBadgeActive : styles.countBadgeInactive,
              ]}
            >
              <AppText
                style={[
                  styles.countBadgeText,
                  activeTab === 'created' && styles.countBadgeTextActive,
                ]}
              >
                {String(myEventsCount)}
              </AppText>
            </View>
          </Pressable>
        </View>

        {/* Sous-filtres spécifiques à "En cours" (En direct vs À venir) */}
        {activeTab === 'participated' && (
          <View style={styles.subFilterRow}>
            <Pressable
              style={[
                styles.subFilterChip,
                participatedScope === 'all' && styles.subFilterChipActive,
              ]}
              onPress={() => {
                setParticipatedScope('all');
              }}
            >
              <AppText
                style={[
                  styles.subFilterText,
                  participatedScope === 'all' && styles.subFilterTextActive,
                ]}
              >
                Toutes ({String(participatedCount)})
              </AppText>
            </Pressable>

            <Pressable
              style={[
                styles.subFilterChip,
                participatedScope === 'live' && styles.subFilterChipLiveActive,
              ]}
              onPress={() => {
                setParticipatedScope('live');
              }}
            >
              <View
                style={[styles.liveDot, participatedScope === 'live' && styles.liveDotActive]}
              />
              <AppText
                style={[
                  styles.subFilterText,
                  participatedScope === 'live' && styles.subFilterTextActive,
                ]}
              >
                En direct ({String(liveCount)})
              </AppText>
            </Pressable>

            <Pressable
              style={[
                styles.subFilterChip,
                participatedScope === 'upcoming' && styles.subFilterChipActive,
              ]}
              onPress={() => {
                setParticipatedScope('upcoming');
              }}
            >
              <Feather
                name="clock"
                size={12}
                color={participatedScope === 'upcoming' ? theme.colors.white : theme.colors.grey}
              />
              <AppText
                style={[
                  styles.subFilterText,
                  participatedScope === 'upcoming' && styles.subFilterTextActive,
                ]}
              >
                À venir ({String(upcomingCount)})
              </AppText>
            </Pressable>
          </View>
        )}

        {/* Barre de filtres génériques (Type & Tri) */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScrollContainer}
          style={styles.filterScrollView}
        >
          {/* Filtre Type : Tous */}
          <Pressable
            style={[styles.filterPill, typeFilter === 'all' && styles.filterPillActive]}
            onPress={() => {
              setTypeFilter('all');
            }}
          >
            <AppText
              style={[styles.filterPillText, typeFilter === 'all' && styles.filterPillTextActive]}
            >
              Tous
            </AppText>
          </Pressable>

          {/* Filtre Type : Écologie */}
          <Pressable
            style={[styles.filterPill, typeFilter === 'ecology' && styles.filterPillEcoActive]}
            onPress={() => {
              setTypeFilter(typeFilter === 'ecology' ? 'all' : 'ecology');
            }}
          >
            <Feather
              name="feather"
              size={12}
              color={typeFilter === 'ecology' ? theme.colors.white : theme.colors.primaryEco}
            />
            <AppText
              style={[
                styles.filterPillText,
                typeFilter === 'ecology' && styles.filterPillTextActive,
              ]}
            >
              Écologie
            </AppText>
          </Pressable>

          {/* Filtre Type : Social */}
          <Pressable
            style={[styles.filterPill, typeFilter === 'social' && styles.filterPillSocioActive]}
            onPress={() => {
              setTypeFilter(typeFilter === 'social' ? 'all' : 'social');
            }}
          >
            <Feather
              name="users"
              size={12}
              color={typeFilter === 'social' ? theme.colors.white : theme.colors.primarySocio}
            />
            <AppText
              style={[
                styles.filterPillText,
                typeFilter === 'social' && styles.filterPillTextActive,
              ]}
            >
              Social
            </AppText>
          </Pressable>
        </ScrollView>
      </View>

      {/* Astuce d'interaction Wishlist (Démo A validée) */}
      {activeTab === 'wished' && wishedEvents.length > 0 && (
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
        <FlatList
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
          ListEmptyComponent={renderEmptyComponent}
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
    tabBarContainer: {
      flexDirection: 'row',
      borderRadius: 16,
      padding: 4,
      backgroundColor:
        theme.colors.text === '#000' ? 'rgba(0, 0, 0, 0.05)' : 'rgba(255, 255, 255, 0.08)',
      marginBottom: 10,
    },
    tabButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 10,
      paddingHorizontal: 6,
      borderRadius: 12,
      gap: 6,
    },
    tabButtonActive: {
      backgroundColor: theme.colors.primaryEco,
      boxShadow: '0 4px 10px rgba(47, 110, 62, 0.3)',
      elevation: 4,
    },
    tabText: {
      fontSize: 13,
      fontWeight: '600',
      color: theme.colors.grey,
    },
    tabTextActive: {
      color: theme.colors.white,
      fontWeight: '700',
    },
    countBadge: {
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 10,
    },
    countBadgeInactive: {
      backgroundColor:
        theme.colors.text === '#000' ? 'rgba(0, 0, 0, 0.06)' : 'rgba(255, 255, 255, 0.1)',
    },
    countBadgeActive: {
      backgroundColor: 'rgba(255, 255, 255, 0.25)',
    },
    countBadgeText: {
      fontSize: 11,
      fontWeight: '700',
      color: theme.colors.grey,
    },
    countBadgeTextActive: {
      color: theme.colors.white,
    },
    subFilterRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginBottom: 10,
    },
    subFilterChip: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 5,
      paddingVertical: 7,
      paddingHorizontal: 8,
      borderRadius: 10,
      backgroundColor:
        theme.colors.text === '#000' ? 'rgba(0, 0, 0, 0.04)' : 'rgba(255, 255, 255, 0.06)',
      borderWidth: 1,
      borderColor:
        theme.colors.text === '#000' ? 'rgba(0, 0, 0, 0.06)' : 'rgba(255, 255, 255, 0.08)',
    },
    subFilterChipActive: {
      backgroundColor: theme.colors.primaryEco,
      borderColor: theme.colors.primaryEco,
    },
    subFilterChipLiveActive: {
      backgroundColor: theme.colors.danger,
      borderColor: theme.colors.danger,
    },
    subFilterText: {
      fontSize: 12,
      fontWeight: '600',
      color: theme.colors.grey,
    },
    subFilterTextActive: {
      color: theme.colors.white,
      fontWeight: '700',
    },
    liveDot: {
      width: 7,
      height: 7,
      borderRadius: 4,
      backgroundColor: theme.colors.danger,
    },
    liveDotActive: {
      backgroundColor: theme.colors.white,
    },
    filterScrollView: {
      marginBottom: 4,
    },
    filterScrollContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      paddingVertical: 4,
    },
    filterPill: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      paddingVertical: 6,
      paddingHorizontal: 12,
      borderRadius: 14,
      backgroundColor:
        theme.colors.text === '#000' ? 'rgba(0, 0, 0, 0.04)' : 'rgba(255, 255, 255, 0.06)',
      borderWidth: 1,
      borderColor:
        theme.colors.text === '#000' ? 'rgba(0, 0, 0, 0.06)' : 'rgba(255, 255, 255, 0.08)',
    },
    filterPillActive: {
      backgroundColor:
        theme.colors.text === '#000' ? 'rgba(0, 0, 0, 0.12)' : 'rgba(255, 255, 255, 0.18)',
      borderColor: theme.colors.text,
    },
    filterPillEcoActive: {
      backgroundColor: theme.colors.primaryEco,
      borderColor: theme.colors.primaryEco,
    },
    filterPillSocioActive: {
      backgroundColor: theme.colors.primarySocio,
      borderColor: theme.colors.primarySocio,
    },
    filterPillText: {
      fontSize: 12,
      fontWeight: '600',
      color: theme.colors.grey,
    },
    filterPillTextActive: {
      color: theme.colors.white,
      fontWeight: '700',
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
    emptyContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 16,
      paddingVertical: 24,
    },
    emptyBadgeHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
      backgroundColor:
        theme.colors.text === '#000' ? 'rgba(47, 110, 62, 0.12)' : 'rgba(47, 110, 62, 0.22)',
      marginBottom: 12,
    },
    emptyBadgeTitle: {
      fontSize: 13,
      fontWeight: '700',
      color: theme.colors.primaryEco,
    },
    emptyIconCircle: {
      width: 60,
      height: 60,
      borderRadius: 30,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 14,
    },
    emptyIconCircleEco: {
      backgroundColor:
        theme.colors.text === '#000' ? 'rgba(47, 110, 62, 0.12)' : 'rgba(47, 110, 62, 0.22)',
    },
    emptyIconCircleSocio: {
      backgroundColor:
        theme.colors.text === '#000' ? 'rgba(31, 111, 139, 0.12)' : 'rgba(31, 111, 139, 0.22)',
    },
    emptyTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: theme.colors.text,
      textAlign: 'center',
      marginBottom: 6,
    },
    emptySubtitle: {
      fontSize: 13,
      color: theme.colors.grey,
      textAlign: 'center',
      lineHeight: 18,
      marginBottom: 18,
      maxWidth: 320,
    },
    calendarCard: {
      width: '100%',
      borderRadius: 18,
      overflow: 'hidden',
      marginBottom: 20,
      borderWidth: 1,
      borderColor:
        theme.colors.text === '#000' ? 'rgba(0, 0, 0, 0.08)' : 'rgba(255, 255, 255, 0.12)',
      backgroundColor: theme.colors.white,
      boxShadow: '0 8px 24px rgba(0, 0, 0, 0.08)',
      elevation: 4,
    },
    calendarStyle: {
      borderRadius: 18,
    },
    emptyButton: {
      minWidth: 220,
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
