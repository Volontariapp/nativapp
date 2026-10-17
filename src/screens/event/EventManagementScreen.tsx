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
import { EventCoverEditor } from '@/components/event/event-cover-editor';
import { EventCoverCropper } from '@/components/event/event-cover-cropper';

type EventManagementRouteProp = RouteProp<
  { EventManagement: { eventId: string; initialEvent?: AppEvent } },
  'EventManagement'
>;

type TabKey = 'details' | 'participants';

export function EventManagementScreen(): React.JSX.Element {
  const route = useRoute<EventManagementRouteProp>();
  const rootNavigation = useNavigation<NativeStackNavigationProp<MainStackParamList>>();
  const { theme } = useAppTheme();
  const styles = useStyles(createStyles);

  const eventId = route.params.eventId;
  const initialEvent = route.params.initialEvent;

  const [activeTab, setActiveTab] = useState<TabKey>('details');
  const [modalTargetState, setModalTargetState] = useState<EventState | null>(null);

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

  const updateMutation = useUpdateEvent();
  const stateMutation = useChangeEventState();

  // Form setup
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<UpdateEventFormValues>({
    resolver: zodResolver(updateEventSchema),
    defaultValues: {
      title: currentEvent?.title ?? '',
      description: currentEvent?.description ?? '',
      localisationName: currentEvent?.localisationName ?? '',
      maxParticipants: currentEvent?.maxParticipants ?? 10,
    },
  });

  useEffect(() => {
    if (currentEvent) {
      reset({
        title: currentEvent.title,
        description: currentEvent.description,
        localisationName: currentEvent.localisationName,
        maxParticipants: currentEvent.maxParticipants,
      });
    }
  }, [currentEvent, reset]);

  // Handle Form Submit
  const onSaveDetails = handleSubmit(async (values) => {
    try {
      await updateMutation.mutateAsync({
        id: eventId,
        payload: {
          title: values.title,
          description: values.description,
          localisationName: values.localisationName,
          maxParticipants: values.maxParticipants,
          coverFileId: eventCover.coverFileId,
        },
      });

      if (eventCover.cover !== undefined) {
        eventCover.removeImage(eventCover.cover.id);
      }
      Alert.alert('Succès', 'Les informations de votre événement ont été mises à jour.');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Une erreur réseau est survenue.';
      Alert.alert('Erreur', msg);
    }
  });

  // Handle State Change Confirm
  const handleConfirmStateChange = async () => {
    if (modalTargetState === null) return;
    try {
      await stateMutation.mutateAsync({
        id: eventId,
        newState: modalTargetState,
      });
      setModalTargetState(null);
      Alert.alert('Statut mis à jour', 'Le statut de l’événement a été actualisé.');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Impossible de changer le statut.';
      Alert.alert('Erreur de transition', msg);
    }
  };

  const handleParticipantPress = useCallback(
    (userId: string) => {
      rootNavigation.navigate('PublicProfile', { userId });
    },
    [rootNavigation],
  );

  if (isEventLoading && !currentEvent) {
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

  if (isEventError && !currentEvent) {
    return (
      <View style={styles.loadingContainer}>
        <AppHeader showBack />
        <View style={styles.centerBox}>
          <Feather name="alert-circle" size={40} color={theme.colors.danger} />
          <AppText style={styles.errorTitle}>Événement introuvable</AppText>
          <AppButton
            text="Réessayer"
            onPress={() => {
              void refetchEvent();
            }}
            style={styles.retryBtn}
          />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <AppHeader showBack />

      {/* Screen Title & Status Banner */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.titleCol}>
            <AppText style={styles.subtitle}>Espace organisateur</AppText>
            <AppText style={styles.screenTitle} numberOfLines={1}>
              {currentEvent?.title ?? 'Gestion d’événement'}
            </AppText>
          </View>
          {currentEvent && (
            <EventStatusBadge
              state={currentEvent.state}
              endDate={currentEvent.endAt}
              startDate={currentEvent.startAt}
            />
          )}
        </View>

        {/* Tab switcher */}
        <View style={styles.tabBar}>
          <Pressable
            style={[styles.tabItem, activeTab === 'details' && styles.tabItemActive]}
            onPress={() => {
              setActiveTab('details');
            }}
            accessibilityRole="tab"
            accessibilityState={{ selected: activeTab === 'details' }}
          >
            <Feather
              name="edit"
              size={15}
              color={activeTab === 'details' ? theme.colors.primaryEco : theme.colors.grey}
            />
            <AppText style={[styles.tabLabel, activeTab === 'details' && styles.tabLabelActive]}>
              Informations
            </AppText>
          </Pressable>

          <Pressable
            style={[styles.tabItem, activeTab === 'participants' && styles.tabItemActive]}
            onPress={() => {
              setActiveTab('participants');
            }}
            accessibilityRole="tab"
            accessibilityState={{ selected: activeTab === 'participants' }}
          >
            <Feather
              name="users"
              size={15}
              color={activeTab === 'participants' ? theme.colors.primaryEco : theme.colors.grey}
            />
            <AppText
              style={[styles.tabLabel, activeTab === 'participants' && styles.tabLabelActive]}
            >
              Participants
              {participantsData?.participants &&
                ` (${String(participantsData.participants.length)})`}
            </AppText>
          </Pressable>
        </View>
      </View>

      {/* Tab 1: Informations & Cycle de vie */}
      {activeTab === 'details' ? (
        <EventDetailsTab
          currentEvent={currentEvent}
          control={control}
          errors={errors}
          isDirty={isDirty || hasNewCover}
          isSubmitting={updateMutation.isPending || eventCover.isUploading}
          saveDisabled={eventCover.hasBlockingImage}
          coverSection={
            <EventCoverEditor
              event={currentEvent}
              cover={eventCover.cover}
              onAdd={() => {
                void eventCover.addImages();
              }}
              onRetry={eventCover.retryImage}
              onRemove={eventCover.removeImage}
            />
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
        isPending={stateMutation.isPending}
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
