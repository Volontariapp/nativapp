import React from 'react';
import { View, StyleSheet, TextInput, Alert } from 'react-native';
import { AppKeyboardScrollView } from '@/components/layout/AppKeyboardScrollView';
import { AppText } from '@/components/typography/AppText';
import { AppButton } from '@/components/buttons/AppButton';
import AppHeader from '@/components/layout/AppHeader';
import { useStyles } from '@/context/ThemeContext';
import type { AppTheme } from '@/shared/themes/theme';

import type { CreateEventRequest } from '@volontariapp/contracts';
import { EventType } from '@volontariapp/contracts';
import type { WithOptionalIdempotencyKey } from '@/api/idempotency.types';

import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { eventSchema, type EventFormValues } from '@/api/event/event.schema';
import { mapEventType } from '@/shared/lib/event-mappers.utils';
import { useCreateEvent } from '@/api/event/hooks/use-create-event';
import { EventInput, AppChipSelector, type AppChipOption } from '@/components/inputs';
import { AppFormController, EventInfoGrid, EventRequirementItem } from '@/components/forms';
import { eventApi } from '@/api/event/event.api';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import { useDebug } from '@/context/DebugContext';
import { useEventCover } from '@/api/event/hooks/use-event-cover';
import { EventCoverPicker } from '@/components/event/event-cover-picker';
import { generateIdempotencyKey } from '@/shared/lib/idempotency.utils';

const UPLOADING_HINT = 'Envoi de la photo en cours...';
const BLOCKING_HINT = 'Retirez ou renvoyez la photo en échec ou refusée avant de publier.';

const EVENT_TYPE_OPTIONS: AppChipOption<EventType>[] = [
  {
    value: EventType.EVENT_TYPE_ECOLOGY,
    label: mapEventType(EventType.EVENT_TYPE_ECOLOGY),
    color: '#22C55E', // primaryEco
  },
  {
    value: EventType.EVENT_TYPE_SOCIAL,
    label: mapEventType(EventType.EVENT_TYPE_SOCIAL),
    color: '#3B82F6', // primarySocio
  },
];

function getDefaultEventDates(): { startAt: Date; endAt: Date } {
  const startAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  startAt.setHours(10, 0, 0, 0);
  const endAt = new Date(startAt);
  endAt.setHours(18, 0, 0, 0);
  return { startAt, endAt };
}

export function EventFormScreen(): React.JSX.Element {
  const styles = useStyles(createStyles);

  const mutation = useCreateEvent();
  const queryClient = useQueryClient();
  const navigation = useNavigation();
  const { isDebugMode } = useDebug();
  const [isBatching, setIsBatching] = React.useState(false);
  const eventCover = useEventCover();
  // Une seule clé par formulaire : un réessai après échec reste idempotent côté serveur.
  const [idempotencyKey] = React.useState(generateIdempotencyKey);

  const defaultDates = React.useMemo(() => getDefaultEventDates(), []);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<EventFormValues>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      title: 'Nettoyage de la plage',
      description: 'Rejoignez-nous pour nettoyer la plage et protéger notre environnement !',
      localisationName: 'Plage du Prado, Marseille',
      type: undefined as unknown as EventType,
      awardedImpactScore: 100,
      maxParticipants: 50,
      startAt: defaultDates.startAt,
      endAt: defaultDates.endAt,
      requirements: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'requirements',
  });

  const onSubmit = handleSubmit((data) => {
    mutation.mutate(
      { ...data, coverFileId: eventCover.coverFileId, idempotencyKey },
      {
        onSuccess: () => {
          navigation.goBack();
        },
      },
    );
  });

  const cannotPublish =
    mutation.isPending || isBatching || eventCover.isUploading || eventCover.hasBlockingImage;

  const handleCreate50Events = React.useCallback(async (): Promise<void> => {
    setIsBatching(true);
    try {
      const payload: WithOptionalIdempotencyKey<CreateEventRequest> = {
        title: 'Batch Event',
        description: 'Évènement généré automatiquement pour des tests.',
        localisationName: 'Paris, France',
        type: EventType.EVENT_TYPE_UNSPECIFIED,
        maxParticipants: 10,
        awardedImpactScore: 100,
        tagIds: [],
        startAt: new Date(),
        endAt: new Date(Date.now() + 86400000 * 2),
      };

      const adjectives = ['Solidaire', 'Écologique', 'Communautaire', 'Local', 'Engagé', 'Citoyen'];
      const nouns = [
        'Nettoyage',
        'Atelier',
        'Collecte',
        'Rencontre',
        'Distribution',
        'Sensibilisation',
      ];

      const promises = [];
      for (let i = 0; i < 50; i++) {
        const randomAdj = adjectives[Math.floor(Math.random() * adjectives.length)] ?? '';
        const randomNoun = nouns[Math.floor(Math.random() * nouns.length)] ?? '';
        promises.push(
          eventApi.createEvent({
            ...payload,
            title: `${randomNoun} ${randomAdj} #${String(i + 1)}`,
          }),
        );
      }

      await Promise.all(promises);
      void queryClient.invalidateQueries({ queryKey: ['events'] });
      Alert.alert('Succès', 'Les 50 événements ont été créés avec succès !', [
        {
          text: 'OK',
          onPress: () => {
            navigation.goBack();
          },
        },
      ]);
    } catch {
      Alert.alert('Erreur', 'Impossible de créer les événements.');
    } finally {
      setIsBatching(false);
    }
  }, [queryClient, navigation]);

  return (
    <View style={styles.container}>
      <AppHeader showBack />
      <AppKeyboardScrollView
        contentContainerStyle={styles.scrollContent}
        contentInsetAdjustmentBehavior="automatic"
        bottomOffset={16}
      >
        <AppText style={styles.title}>Créer un Évènement</AppText>

        <EventCoverPicker
          cover={eventCover.cover}
          onAdd={() => {
            void eventCover.addImages();
          }}
          onRetry={eventCover.retryImage}
          onRemove={eventCover.removeImage}
        />

        <AppFormController
          control={control}
          name="title"
          label="Titre de l'évènement"
          errors={errors}
          render={({ field: { onChange, value } }) => (
            <EventInput
              value={value}
              onChangeText={onChange}
              placeholder="Ex: Nettoyage de la plage"
            />
          )}
        />

        <AppFormController
          control={control}
          name="description"
          label="Description"
          errors={errors}
          render={({ field: { onChange, value } }) => (
            <TextInput
              style={[styles.input, styles.textArea]}
              value={value}
              onChangeText={onChange}
              multiline
              numberOfLines={4}
            />
          )}
        />

        <AppFormController
          control={control}
          name="localisationName"
          label="Lieu"
          errors={errors}
          render={({ field: { onChange, value } }) => (
            <EventInput
              value={value}
              onChangeText={onChange}
              placeholder="Ex: Plage du Prado, Marseille"
            />
          )}
        />

        <AppFormController
          control={control}
          name="type"
          label="Type d'évènement"
          errors={errors}
          render={({ field: { onChange, value } }) => (
            <AppChipSelector options={EVENT_TYPE_OPTIONS} value={value} onChange={onChange} />
          )}
        />

        <EventInfoGrid control={control} errors={errors} />

        <View style={styles.requirementsSection}>
          <View style={styles.requirementsHeader}>
            <AppText style={styles.requirementsTitle}>Matériels Requis</AppText>
            <AppButton
              variant="secondary"
              size="small"
              text="Ajouter"
              icon="plus"
              onPress={() => {
                append({ name: '', description: '', neededQuantity: 1 });
              }}
            />
          </View>

          {fields.length === 0 ? (
            <AppText style={styles.noRequirementsText}>
              Aucun besoin matériel spécifié pour cet événement.
            </AppText>
          ) : (
            fields.map((field, index) => (
              <EventRequirementItem
                key={field.id}
                control={control}
                errors={errors}
                index={index}
                onRemove={remove}
              />
            ))
          )}
        </View>

        <View style={styles.publishContainer}>
          {eventCover.isUploading && <AppText style={styles.hint}>{UPLOADING_HINT}</AppText>}
          {eventCover.hasBlockingImage && (
            <AppText style={styles.hintError}>{BLOCKING_HINT}</AppText>
          )}
          <AppButton
            text={mutation.isPending || isBatching ? 'Publication...' : "Publier l'évènement"}
            icon="send"
            onPress={() => {
              void onSubmit();
            }}
            disabled={cannotPublish}
            style={styles.publishButton}
            textStyle={styles.publishButtonText}
          />
        </View>

        {isDebugMode && (
          <View style={styles.testSection}>
            <AppText style={styles.testTitle}>Debug: Outils de test</AppText>
            <AppButton
              text={isBatching ? 'Création en cours...' : 'Créer 50 événements'}
              variant="socio"
              onPress={() => {
                void handleCreate50Events();
              }}
              disabled={mutation.isPending || isBatching}
            />
          </View>
        )}

        <View style={styles.bottomSpacer} />
      </AppKeyboardScrollView>
    </View>
  );
}

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    scrollContent: {
      padding: theme.spacing.xl,
    },
    hint: {
      marginBottom: theme.spacing.sm,
      fontSize: 13,
      color: theme.colors.grey,
    },
    hintError: {
      marginBottom: theme.spacing.sm,
      fontSize: 13,
      color: theme.colors.danger,
    },
    title: {
      fontSize: 28,
      fontWeight: 'bold',
      color: theme.colors.text,
      marginBottom: theme.spacing.xl,
    },
    inputGroup: {
      marginBottom: theme.spacing.lg,
    },
    label: {
      fontSize: 14,
      color: theme.colors.grey,
      marginBottom: theme.spacing.xs,
      fontWeight: '600',
    },
    input: {
      backgroundColor: theme.colors.white,
      borderWidth: 1,
      borderColor: theme.colors.lightGrey,
      borderRadius: theme.radius.md,
      padding: theme.spacing.md,
      fontSize: 16,
      color: theme.colors.text,
    },
    textArea: {
      height: 100,
      textAlignVertical: 'top',
    },
    bottomSpacer: {
      height: theme.spacing.xxl,
    },
    requirementsSection: {
      marginTop: theme.spacing.lg,
      marginBottom: theme.spacing.xl,
    },
    requirementsHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: theme.spacing.md,
    },
    requirementsTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme.colors.text,
    },
    noRequirementsText: {
      color: theme.colors.grey,
      fontStyle: 'italic',
      textAlign: 'center',
      paddingVertical: theme.spacing.md,
    },
    publishContainer: {
      marginTop: theme.spacing.md,
      alignItems: 'center',
      width: '100%',
    },
    publishButton: {
      width: '100%',
    },
    publishButtonText: {
      fontWeight: 'bold',
      fontSize: 16,
    },
    testSection: {
      marginTop: theme.spacing.xxl,
      padding: theme.spacing.md,
      backgroundColor: theme.colors.white,
      borderRadius: theme.radius.md,
      borderWidth: 1,
      borderColor: theme.colors.lightGrey,
      borderStyle: 'dashed',
    },
    testTitle: {
      fontSize: 12,
      color: theme.colors.grey,
      marginBottom: theme.spacing.sm,
      fontWeight: 'bold',
      textTransform: 'uppercase',
    },
  });
