import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, Alert, ActivityIndicator, Pressable } from 'react-native';
import { useRoute, useNavigation, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { MainStackParamList } from '@/navigation/stacks/MainStack';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Feather from 'react-native-vector-icons/Feather';

import { AppText } from '@/components/typography/AppText';
import AppHeader from '@/components/layout/AppHeader';
import { AppButton } from '@/components/buttons/AppButton';
import {
  EventStatusBadge,
  ConfirmStateChangeModal,
  EventDetailsTab,
  EventParticipantsTab,
} from '@/components/event';
import { useAppTheme, useStyles } from '@/context/ThemeContext';
import type { AppTheme } from '@/shared/themes/theme';
import type { EventState } from '@volontariapp/contracts';
import { updateEventSchema, type UpdateEventFormValues } from '@/api/event/event.schema';
import type { AppEvent } from '@/api/event/event.api';
import {
  useGetEvent,
  useUpdateEvent,
  useChangeEventState,
  useEventParticipants,
} from '@/api/event/hooks';
import { useEventCover } from '@/api/event/hooks/use-event-cover';
import { useCoverAdjuster } from '@/api/event/hooks/use-cover-adjuster';
import { isEventEditable } from '@/components/event/event-status.utils';
import { EventCoverEditor } from '@/components/event/event-cover-editor';
import { EventCoverCropper } from '@/components/event/event-cover-cropper';

type EventManagementRouteProp = RouteProp<
  { EventManagement: { eventId: string; initialEvent?: AppEvent } },
  'EventManagement'
>;

type TabKey = 'details' | 'participants';

function useStateChangeModal(eventId: string) {
  const [modalTargetState, setModalTargetState] = useState<EventState | null>(null);
  const stateMutation = useChangeEventState();

  const handleConfirmStateChange = async (): Promise<void> => {
    if (modalTargetState === null) return;
    try {
      await stateMutation.mutateAsync({ id: eventId, newState: modalTargetState });
      setModalTargetState(null);
      Alert.alert('Statut mis à jour', 'Le statut de l’événement a été actualisé.');
    } catch (err) {
      Alert.alert('Erreur de transition', errorMessageOf(err, 'Impossible de changer le statut.'));
    }
  };

  return {
    modalTargetState,
    setModalTargetState,
    handleConfirmStateChange,
    isStatePending: stateMutation.isPending,
  };
}

interface EventDetailsFormParams {
  eventId: string;
  currentEvent: AppEvent | undefined;
  eventCover: ReturnType<typeof useEventCover>;
}

const EMPTY_FORM_VALUES: UpdateEventFormValues = {
  title: '',
  description: '',
  localisationName: '',
  maxParticipants: 10,
};

const toFormValues = (event: AppEvent | undefined): UpdateEventFormValues =>
  event === undefined
    ? EMPTY_FORM_VALUES
    : {
        title: event.title,
        description: event.description,
        localisationName: event.localisationName,
        maxParticipants: event.maxParticipants,
      };

const errorMessageOf = (error: unknown, fallback: string): string =>
  error instanceof Error ? error.message : fallback;

type UpdateEventMutation = ReturnType<typeof useUpdateEvent>;

async function saveEventDetails(
  values: UpdateEventFormValues,
  { eventId, eventCover }: Pick<EventDetailsFormParams, 'eventId' | 'eventCover'>,
  updateMutation: UpdateEventMutation,
): Promise<void> {
  try {
    await updateMutation.mutateAsync({
      id: eventId,
      payload: { ...values, coverFileId: eventCover.coverFileId },
    });

    if (eventCover.cover !== undefined) {
      eventCover.removeImage(eventCover.cover.id);
    }
    Alert.alert('Succès', 'Les informations de votre événement ont été mises à jour.');
  } catch (err) {
    Alert.alert('Erreur', errorMessageOf(err, 'Une erreur réseau est survenue.'));
  }
}

function useEventDetailsForm({ eventId, currentEvent, eventCover }: EventDetailsFormParams) {
  const updateMutation = useUpdateEvent();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<UpdateEventFormValues>({
    resolver: zodResolver(updateEventSchema),
    defaultValues: toFormValues(currentEvent),
  });

  useEffect(() => {
    if (currentEvent) {
      reset(toFormValues(currentEvent));
    }
  }, [currentEvent, reset]);

  const onSaveDetails = handleSubmit((values) =>
    saveEventDetails(values, { eventId, eventCover }, updateMutation),
  );

  return { control, errors, isDirty, onSaveDetails, isSaving: updateMutation.isPending };
}

function EventLoadingState(): React.JSX.Element {
  const { theme } = useAppTheme();
  const styles = useStyles(createStyles);

  return (
    <View style={styles.loadingContainer}>
      <AppHeader showBack />
      <View style={styles.centerBox}>
        <ActivityIndicator size="large" color={theme.colors.primaryEco} />
        <AppText style={styles.loadingText}>Chargement de l'événement...</AppText>
      </View>
    </View>
  );
}

function EventErrorState({ onRetry }: { onRetry: () => void }): React.JSX.Element {
  const { theme } = useAppTheme();
  const styles = useStyles(createStyles);

  return (
    <View style={styles.loadingContainer}>
      <AppHeader showBack />
      <View style={styles.centerBox}>
        <Feather name="alert-circle" size={40} color={theme.colors.danger} />
        <AppText style={styles.errorTitle}>Événement introuvable</AppText>
        <AppButton text="Réessayer" onPress={onRetry} style={styles.retryBtn} />
      </View>
    </View>
  );
}

interface TabBarItem {
  key: TabKey;
  icon: string;
  label: string;
}

const TAB_ITEMS: TabBarItem[] = [
  { key: 'details', icon: 'edit', label: 'Informations' },
  { key: 'participants', icon: 'users', label: 'Participants' },
];

interface EventManagementTabBarProps {
  activeTab: TabKey;
  onChange: (tab: TabKey) => void;
  participantsCount: number | undefined;
}

const countSuffix = (key: TabKey, count: number | undefined): string =>
  key === 'participants' && count !== undefined ? ` (${String(count)})` : '';

interface TabButtonProps {
  item: TabBarItem;
  isActive: boolean;
  suffix: string;
  onPress: () => void;
}

function TabButton({ item, isActive, suffix, onPress }: TabButtonProps): React.JSX.Element {
  const { theme } = useAppTheme();
  const styles = useStyles(createStyles);

  return (
    <Pressable
      style={[styles.tabItem, isActive && styles.tabItemActive]}
      onPress={onPress}
      accessibilityRole="tab"
      accessibilityState={{ selected: isActive }}
    >
      <Feather
        name={item.icon}
        size={15}
        color={isActive ? theme.colors.primaryEco : theme.colors.grey}
      />
      <AppText style={[styles.tabLabel, isActive && styles.tabLabelActive]}>
        {item.label}
        {suffix}
      </AppText>
    </Pressable>
  );
}

function EventManagementTabBar({
  activeTab,
  onChange,
  participantsCount,
}: EventManagementTabBarProps): React.JSX.Element {
  const styles = useStyles(createStyles);

  return (
    <View style={styles.tabBar}>
      {TAB_ITEMS.map((item) => (
        <TabButton
          key={item.key}
          item={item}
          isActive={activeTab === item.key}
          suffix={countSuffix(item.key, participantsCount)}
          onPress={() => {
            onChange(item.key);
          }}
        />
      ))}
    </View>
  );
}

interface EventManagementHeaderProps {
  event: AppEvent | undefined;
  activeTab: TabKey;
  onChangeTab: (tab: TabKey) => void;
  participantsCount: number | undefined;
}

function EventManagementHeader({
  event,
  activeTab,
  onChangeTab,
  participantsCount,
}: EventManagementHeaderProps): React.JSX.Element {
  const styles = useStyles(createStyles);

  return (
    <View style={styles.header}>
      <View style={styles.headerTop}>
        <View style={styles.titleCol}>
          <AppText style={styles.subtitle}>Espace organisateur</AppText>
          <AppText style={styles.screenTitle} numberOfLines={1}>
            {event?.title ?? 'Gestion d’événement'}
          </AppText>
        </View>
        {event && (
          <EventStatusBadge state={event.state} endDate={event.endAt} startDate={event.startAt} />
        )}
      </View>

      <EventManagementTabBar
        activeTab={activeTab}
        onChange={onChangeTab}
        participantsCount={participantsCount}
      />
    </View>
  );
}

export function EventManagementScreen(): React.JSX.Element {
  const route = useRoute<EventManagementRouteProp>();
  const rootNavigation = useNavigation<NativeStackNavigationProp<MainStackParamList>>();
  const styles = useStyles(createStyles);

  const eventId = route.params.eventId;
  const initialEvent = route.params.initialEvent;

  const [activeTab, setActiveTab] = useState<TabKey>('details');

  // Queries & Mutations
  const {
    data: eventData,
    isLoading: isEventLoading,
    isError: isEventError,
    refetch: refetchEvent,
    isRefetching: isEventRefetching,
  } = useGetEvent(eventId);

  const currentEvent = eventData ?? initialEvent;

  const {
    data: participantsData,
    isLoading: isParticipantsLoading,
    refetch: refetchParticipants,
    isRefetching: isParticipantsRefetching,
  } = useEventParticipants(eventId);

  const coverAdjuster = useCoverAdjuster();
  const eventCover = useEventCover({ adjustImage: coverAdjuster.adjustImage });
  const hasNewCover = eventCover.cover !== undefined;

  const { modalTargetState, setModalTargetState, handleConfirmStateChange, isStatePending } =
    useStateChangeModal(eventId);

  const { control, errors, isDirty, onSaveDetails, isSaving } = useEventDetailsForm({
    eventId,
    currentEvent,
    eventCover,
  });

  const handleParticipantPress = useCallback(
    (userId: string) => {
      rootNavigation.navigate('PublicProfile', { userId });
    },
    [rootNavigation],
  );

  if (isEventLoading && !currentEvent) {
    return <EventLoadingState />;
  }

  if (isEventError && !currentEvent) {
    return (
      <EventErrorState
        onRetry={() => {
          void refetchEvent();
        }}
      />
    );
  }

  return (
    <View style={styles.container}>
      <AppHeader showBack />

      <EventManagementHeader
        event={currentEvent}
        activeTab={activeTab}
        onChangeTab={setActiveTab}
        participantsCount={participantsData?.participants.length}
      />

      {/* Tab 1: Informations & Cycle de vie */}
      {activeTab === 'details' ? (
        <EventDetailsTab
          currentEvent={currentEvent}
          control={control}
          errors={errors}
          isDirty={isDirty || hasNewCover}
          isSubmitting={isSaving || eventCover.isUploading}
          saveDisabled={eventCover.hasBlockingImage}
          coverSection={
            currentEvent !== undefined && !isEventEditable(currentEvent) ? undefined : (
              <EventCoverEditor
                event={currentEvent}
                cover={eventCover.cover}
                onAdd={() => {
                  void eventCover.addImages();
                }}
                onRetry={eventCover.retryImage}
                onRemove={eventCover.removeImage}
              />
            )
          }
          onSave={() => {
            void onSaveDetails();
          }}
          onSelectTargetState={(state) => {
            setModalTargetState(state);
          }}
          isRefetching={isEventRefetching}
          onRefresh={() => {
            void refetchEvent();
          }}
        />
      ) : (
        /* Tab 2: Participants */
        <EventParticipantsTab
          currentEvent={currentEvent}
          participants={participantsData?.participants ?? []}
          totalRegistered={
            participantsData?.participants.length ?? currentEvent?.currentParticipants ?? 0
          }
          isLoading={isParticipantsLoading}
          isRefetching={isParticipantsRefetching}
          onRefresh={() => {
            void refetchParticipants();
          }}
          onParticipantPress={handleParticipantPress}
        />
      )}

      <EventCoverCropper image={coverAdjuster.pendingImage} onSettle={coverAdjuster.settle} />

      {/* Confirmation Modal */}
      <ConfirmStateChangeModal
        visible={modalTargetState !== null}
        targetState={modalTargetState}
        eventTitle={currentEvent?.title ?? ''}
        isPending={isStatePending}
        onConfirm={() => {
          void handleConfirmStateChange();
        }}
        onCancel={() => {
          setModalTargetState(null);
        }}
      />
    </View>
  );
}

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    loadingContainer: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    centerBox: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: theme.spacing.xl,
    },
    loadingText: {
      marginTop: theme.spacing.md,
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.grey,
    },
    errorTitle: {
      marginTop: theme.spacing.md,
      fontSize: theme.typography.fontSize.md,
      fontWeight: theme.typography.fontWeight.semibold,
      color: theme.colors.black,
      marginBottom: theme.spacing.lg,
    },
    retryBtn: {
      minWidth: 140,
    },
    header: {
      backgroundColor: theme.colors.white,
      paddingHorizontal: theme.spacing.lg,
      paddingTop: theme.spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.separator,
    },
    headerTop: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: theme.spacing.md,
    },
    titleCol: {
      flex: 1,
      marginRight: theme.spacing.md,
    },
    subtitle: {
      fontSize: theme.typography.fontSize.xs,
      fontWeight: theme.typography.fontWeight.semibold,
      color: theme.colors.primaryEco,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      marginBottom: 2,
    },
    screenTitle: {
      fontSize: theme.typography.fontSize.xl,
      fontWeight: theme.typography.fontWeight.bold,
      color: theme.colors.black,
    },
    tabBar: {
      flexDirection: 'row',
      borderTopWidth: 1,
      borderTopColor: theme.colors.separator,
    },
    tabItem: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: theme.spacing.md,
      borderBottomWidth: 2,
      borderBottomColor: 'transparent',
      gap: theme.spacing.xs,
    },
    tabItemActive: {
      borderBottomColor: theme.colors.primaryEco,
    },
    tabLabel: {
      fontSize: theme.typography.fontSize.sm,
      fontWeight: theme.typography.fontWeight.medium,
      color: theme.colors.grey,
    },
    tabLabelActive: {
      color: theme.colors.primaryEco,
      fontWeight: theme.typography.fontWeight.semibold,
    },
  });
