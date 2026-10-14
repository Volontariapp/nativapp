import React, { useMemo } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import type { Control, FieldErrors } from 'react-hook-form';
import { Controller } from 'react-hook-form';
import Feather from 'react-native-vector-icons/Feather';

import { AppText } from '@/components/typography/AppText';
import { AppButton } from '@/components/buttons/AppButton';
import { AppInput } from '@/components/inputs/AppInput';
import { useAppTheme, useStyles } from '@/context/ThemeContext';
import type { AppTheme } from '@/shared/themes/theme';
import { EventState } from '@volontariapp/contracts';
import { normalizeEventState } from '@/shared/lib/event-mappers.utils';
import type { UpdateEventFormValues } from '@/api/event/event.schema';
import type { AppEvent } from '@/api/event/event.api';

export interface EventDetailsTabProps {
  currentEvent?: AppEvent;
  control: Control<UpdateEventFormValues>;
  errors: FieldErrors<UpdateEventFormValues>;
  isDirty: boolean;
  isSubmitting: boolean;
  onSave: () => void;
  onSelectTargetState: (state: EventState) => void;
  isRefetching: boolean;
  onRefresh: () => void;
}

export function EventDetailsTab({
  currentEvent,
  control,
  errors,
  isDirty,
  isSubmitting,
  onSave,
  onSelectTargetState,
  isRefetching,
  onRefresh,
}: EventDetailsTabProps): React.JSX.Element {
  const { theme } = useAppTheme();
  const styles = useStyles(createStyles);

  const normalizedState = normalizeEventState(currentEvent?.state);
  const isDraft = normalizedState === EventState.EVENT_STATE_DRAFT;
  const isPublished = normalizedState === EventState.EVENT_STATE_PUBLISHED;
  const isInProgress = normalizedState === EventState.EVENT_STATE_IN_PROGRESS;
  const isFinished = normalizedState === EventState.EVENT_STATE_FINISHED;
  const isCancelled = normalizedState === EventState.EVENT_STATE_CANCELLED;

  const refreshControl = useMemo(
    () => (
      <RefreshControl
        refreshing={isRefetching}
        onRefresh={onRefresh}
        colors={[theme.colors.primaryEco]}
      />
    ),
    [isRefetching, onRefresh, theme.colors.primaryEco],
  );

  return (
    <ScrollView
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
      refreshControl={refreshControl}
    >
      {/* Lifecycle Actions Card */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Feather name="activity" size={18} color={theme.colors.primaryEco} />
          <AppText style={styles.cardTitle}>Cycle de vie de l’événement</AppText>
        </View>

        <AppText style={styles.cardSubtitle}>
          Gérez l’état d’avancement de votre mission solidaire.
        </AppText>

        <View style={styles.actionButtonsRow}>
          {isDraft && (
            <AppButton
              text="Publier l’événement"
              variant="eco"
              icon="check-circle"
              onPress={() => {
                onSelectTargetState(EventState.EVENT_STATE_PUBLISHED);
              }}
              style={styles.fullWidthButton}
            />
          )}

          {isPublished && (
            <>
              <AppButton
                text="Démarrer l'événement"
                variant="socio"
                icon="play"
                onPress={() => {
                  onSelectTargetState(EventState.EVENT_STATE_IN_PROGRESS);
                }}
                style={styles.fullWidthButton}
              />
              <AppButton
                text="Annuler l'événement"
                variant="danger"
                icon="slash"
                onPress={() => {
                  onSelectTargetState(EventState.EVENT_STATE_CANCELLED);
                }}
                style={styles.fullWidthButton}
              />
            </>
          )}

          {isInProgress && (
            <>
              <AppButton
                text="Clôturer la mission"
                variant="eco"
                icon="flag"
                onPress={() => {
                  onSelectTargetState(EventState.EVENT_STATE_FINISHED);
                }}
                style={styles.fullWidthButton}
              />
              <AppButton
                text="Annuler l'événement"
                variant="danger"
                icon="slash"
                onPress={() => {
                  onSelectTargetState(EventState.EVENT_STATE_CANCELLED);
                }}
                style={styles.fullWidthButton}
              />
            </>
          )}

          {isFinished && (
            <View style={styles.finalStateBox}>
              <Feather name="check-circle" size={18} color={theme.colors.goldText} />
              <AppText style={styles.finalStateText}>
                Cette mission est terminée. Les points d'impact ont été attribués.
              </AppText>
            </View>
          )}

          {isCancelled && (
            <View style={styles.finalStateBox}>
              <Feather name="x-circle" size={18} color={theme.colors.danger} />
              <AppText style={[styles.finalStateText, { color: theme.colors.danger }]}>
                Cet événement a été annulé.
              </AppText>
            </View>
          )}
        </View>
      </View>

      {/* Form Card */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Feather name="file-text" size={18} color={theme.colors.primaryEco} />
          <AppText style={styles.cardTitle}>Modifier les informations</AppText>
        </View>

        <View style={styles.formContent}>
          <Controller
            control={control}
            name="title"
            render={({ field: { onChange, value } }) => (
              <AppInput
                label="Titre de l’événement"
                variant="outlined"
                value={value}
                onChangeText={onChange}
                errorMessage={errors.title?.message}
                placeholder="Ex: Nettoyage de la plage"
              />
            )}
          />

          <Controller
            control={control}
            name="description"
            render={({ field: { onChange, value } }) => (
              <AppInput
                label="Description détaillée"
                variant="outlined"
                value={value}
                onChangeText={onChange}
                errorMessage={errors.description?.message}
                placeholder="Précisez le déroulement, le matériel..."
                multiline
                numberOfLines={4}
                style={styles.multilineInput}
              />
            )}
          />

          <Controller
            control={control}
            name="localisationName"
            render={({ field: { onChange, value } }) => (
              <AppInput
                label="Lieu / Adresse"
                variant="outlined"
                value={value}
                onChangeText={onChange}
                errorMessage={errors.localisationName?.message}
                placeholder="Ex: Parc Monceau, Paris"
              />
            )}
          />

          <Controller
            control={control}
            name="maxParticipants"
            render={({ field: { onChange, value } }) => (
              <AppInput
                label="Nombre max de participants"
                variant="outlined"
                value={String(value ?? '')}
                onChangeText={(txt) => {
                  const num = parseInt(txt, 10);
                  onChange(isNaN(num) ? 0 : num);
                }}
                errorMessage={errors.maxParticipants?.message}
                keyboardType="numeric"
                placeholder="Ex: 20"
              />
            )}
          />

          <AppButton
            text={isSubmitting ? 'Enregistrement...' : 'Enregistrer les modifications'}
            variant="eco"
            disabled={!isDirty || isSubmitting}
            onPress={onSave}
            style={styles.submitButton}
          />
        </View>
      </View>
    </ScrollView>
  );
}

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    scrollContent: {
      padding: theme.spacing.lg,
      paddingBottom: theme.spacing.xxl * 2,
    },
    card: {
      backgroundColor: theme.colors.white,
      borderRadius: theme.radius.lg,
      padding: theme.spacing.lg,
      marginBottom: theme.spacing.lg,
      borderWidth: 1,
      borderColor: theme.colors.separator,
      ...theme.shadows.card,
    },
    cardHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: theme.spacing.xs,
    },
    cardTitle: {
      fontSize: theme.typography.fontSize.md,
      fontWeight: theme.typography.fontWeight.bold,
      color: theme.colors.black,
      marginLeft: theme.spacing.xs,
    },
    cardSubtitle: {
      fontSize: theme.typography.fontSize.xs,
      color: theme.colors.grey,
      marginBottom: theme.spacing.md,
    },
    actionButtonsRow: {
      gap: theme.spacing.sm,
    },
    fullWidthButton: {
      width: '100%',
    },
    finalStateBox: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: theme.spacing.md,
      backgroundColor: theme.colors.lightGrey,
      borderRadius: theme.radius.md,
      gap: theme.spacing.sm,
    },
    finalStateText: {
      flex: 1,
      fontSize: theme.typography.fontSize.xs,
      fontWeight: theme.typography.fontWeight.medium,
      color: theme.colors.goldText,
    },
    formContent: {
      gap: theme.spacing.md,
    },
    multilineInput: {
      height: 100,
      textAlignVertical: 'top',
    },
    submitButton: {
      marginTop: theme.spacing.sm,
      width: '100%',
    },
  });
