import React from 'react';
import { View, StyleSheet, TextInput, Alert, ScrollView, Pressable } from 'react-native';
import { AppKeyboardScrollView } from '@/components/layout/AppKeyboardScrollView';
import { AppText } from '@/components/typography/AppText';
import { AppButton } from '@/components/buttons/AppButton';
import AppHeader from '@/components/layout/AppHeader';
import { theme } from '@/shared/themes/theme';
import Feather from 'react-native-vector-icons/Feather';

import type { CreateEventRequest } from '@volontariapp/contracts';
import { EventType } from '@volontariapp/contracts';

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

const EVENT_TYPE_OPTIONS: AppChipOption<EventType>[] = [
  { value: EventType.EVENT_TYPE_UNSPECIFIED, label: mapEventType(EventType.EVENT_TYPE_UNSPECIFIED), color: theme.colors.grey },
  { value: EventType.EVENT_TYPE_ECOLOGY, label: mapEventType(EventType.EVENT_TYPE_ECOLOGY), color: theme.colors.primaryEco },
  { value: EventType.EVENT_TYPE_SOCIAL, label: mapEventType(EventType.EVENT_TYPE_SOCIAL), color: theme.colors.primarySocio },
];

export function EventFormScreen(): React.JSX.Element {
  const mutation = useCreateEvent();
  const queryClient = useQueryClient();
  const navigation = useNavigation();
  const [isBatching, setIsBatching] = React.useState(false);

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
      type: EventType.EVENT_TYPE_UNSPECIFIED,
      awardedImpactScore: 100,
      maxParticipants: 50,
      startAt: new Date('2026-06-01T10:00:00Z'),
      endAt: new Date('2026-06-01T18:00:00Z'),
      requirements: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'requirements',
  });

  const onSubmit = handleSubmit((data) => {
    mutation.mutate(data, {
      onSuccess: () => {
        navigation.goBack();
      },
    });
  });

  const handleCreate10Events = React.useCallback(async (): Promise<void> => {
    setIsBatching(true);
    try {
      const payload: CreateEventRequest = {
        title: 'Batch Event',
        description: 'Created 10 times via batch button',
        localisationName: 'Paris, France',
        type: EventType.EVENT_TYPE_UNSPECIFIED,
        maxParticipants: 10,
        awardedImpactScore: 100,
        tagIds: [],
        startAt: new Date(),
        endAt: new Date(Date.now() + 86400000 * 2),
      };

      const batchId = Date.now().toString().slice(-4);
      const promises = [];
      for (let i = 0; i < 10; i++) {
        promises.push(
          eventApi.createEvent({
            ...payload,
            title: `Event Batch ${batchId} #${String(i + 1)}`,
          }),
        );
      }

      await Promise.all(promises);
      void queryClient.invalidateQueries({ queryKey: ['events'] });
      Alert.alert('Succès', 'Les 10 événements ont été créés avec succès !', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch {
      Alert.alert('Erreur', 'Impossible de créer les événements.');
    } finally {
      setIsBatching(false);
    }
  }, [queryClient, navigation]);

  return (
    <View style={styles.container}>
      <AppHeader showBack showClose />
      <AppKeyboardScrollView
        contentContainerStyle={styles.scrollContent}
        contentInsetAdjustmentBehavior="automatic"
        bottomOffset={16}
      >
        <Pressable
          style={styles.imagePlaceholder}
          onPress={() => {
            Alert.alert('Info', "L'ajout d'image n'est pas encore disponible.");
          }}
        >
          <Feather name="plus" size={32} color={theme.colors.grey} />
          <AppText style={styles.imagePlaceholderText}>Ajouter une image</AppText>
        </Pressable>

        <AppText style={styles.title}>Créer un Évènement</AppText>

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
            <AppChipSelector
              options={EVENT_TYPE_OPTIONS}
              value={value}
              onChange={onChange}
            />
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
          <AppButton
            text={mutation.isPending || isBatching ? 'Publication...' : "Publier l'évènement"}
            icon="send"
            onPress={() => {
              void onSubmit();
            }}
            disabled={mutation.isPending || isBatching}
            style={styles.publishButton}
            textStyle={styles.publishButtonText}
          />
        </View>

        <View style={styles.testSection}>
          <AppText style={styles.testTitle}>Test (à supprimer)</AppText>
          <AppButton
            text={isBatching ? 'Patientez...' : 'Création x10'}
            variant="socio"
            onPress={() => {
              void handleCreate10Events();
            }}
            disabled={mutation.isPending || isBatching}
          />
        </View>

        <View style={styles.bottomSpacer} />
      </AppKeyboardScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    padding: theme.spacing.xl,
  },
  imagePlaceholder: {
    width: '100%',
    height: 180,
    borderRadius: theme.radius.md,
    borderWidth: 2,
    borderColor: theme.colors.lightGrey,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.white,
    marginBottom: theme.spacing.xl,
  },
  imagePlaceholderText: {
    marginTop: theme.spacing.sm,
    color: theme.colors.grey,
    fontSize: 14,
    fontWeight: '500',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.colors.black,
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
    color: theme.colors.black,
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
    color: theme.colors.black,
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
