import React from 'react';
import { View, StyleSheet, TextInput } from 'react-native';
import { AppKeyboardScrollView } from '@/components/layout/AppKeyboardScrollView';
import { AppText } from '@/components/typography/AppText';
import { AppButton } from '@/components/buttons/AppButton';
import AppHeader from '@/components/layout/AppHeader';
import { theme } from '@/shared/themes/theme';

import type { CreateEventRequest } from '@volontariapp/contracts';
import { EventType } from '@volontariapp/contracts';

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ScrollView, Pressable } from 'react-native';
import { eventSchema, type EventFormValues } from '@/api/event/event.schema';
import { mapEventType } from '@/shared/lib/event-mappers.utils';
import { useCreateEvent } from '@/api/event/hooks/use-create-event';
import { AppDateTimePicker, EventInput } from '@/components/inputs';

export function EventFormScreen(): React.JSX.Element {
  const mutation = useCreateEvent();

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
      type: EventType.EVENT_TYPE_ECOLOGY,
      awardedImpactScore: 100,
      maxParticipants: 50,
      startAt: new Date('2026-06-01T10:00:00Z'),
      endAt: new Date('2026-06-01T18:00:00Z'),
    },
  });

  const onSubmit = handleSubmit((data) => {
    const payload: CreateEventRequest = {
      title: data.title,
      description: data.description,
      localisationName: data.localisationName,
      type: data.type,
      awardedImpactScore: data.awardedImpactScore,
      maxParticipants: data.maxParticipants,
      startAt: data.startAt,
      endAt: data.endAt,
      tagIds: [],
    };
    mutation.mutate(payload);
  });

  return (
    <View style={styles.container}>
      <AppHeader showBack />
      <AppKeyboardScrollView
        contentContainerStyle={styles.scrollContent}
        contentInsetAdjustmentBehavior="automatic"
        bottomOffset={16}
      >
        <AppText style={styles.title}>Créer un Évènement</AppText>

        <View style={styles.inputGroup}>
          <AppText style={styles.label}>Titre de l'évènement</AppText>
          <Controller
            control={control}
            name="title"
            render={({ field: { onChange, value } }) => (
              <EventInput
                value={value}
                onChangeText={onChange}
                placeholder="Ex: Nettoyage de la plage"
              />
            )}
          />
          {errors.title ? <AppText style={styles.errorText}>{errors.title.message}</AppText> : null}
        </View>

        <View style={styles.inputGroup}>
          <AppText style={styles.label}>Description</AppText>
          <Controller
            control={control}
            name="description"
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
          {errors.description ? (
            <AppText style={styles.errorText}>{errors.description.message}</AppText>
          ) : null}
        </View>

        <View style={styles.inputGroup}>
          <AppText style={styles.label}>Lieu</AppText>
          <Controller
            control={control}
            name="localisationName"
            render={({ field: { onChange, value } }) => (
              <EventInput
                value={value}
                onChangeText={onChange}
                placeholder="Ex: Plage du Prado, Marseille"
              />
            )}
          />
          {errors.localisationName ? (
            <AppText style={styles.errorText}>{errors.localisationName.message}</AppText>
          ) : null}
        </View>

        <View style={styles.inputGroup}>
          <AppText style={styles.label}>Type d'évènement</AppText>
          <Controller
            control={control}
            name="type"
            render={({ field: { onChange, value } }) => (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.typeScroll}
              >
                {Object.values(EventType).reduce<React.ReactNode[]>((acc, typeVal) => {
                  if (typeof typeVal === 'number' && typeVal !== EventType.EVENT_TYPE_UNSPECIFIED) {
                    const isSelected = value === typeVal;
                    acc.push(
                      <Pressable
                        key={typeVal}
                        style={({ pressed }) => [
                          styles.typeButton,
                          isSelected && styles.typeButtonSelected,
                          pressed && { opacity: 0.7 },
                        ]}
                        onPress={() => {
                          onChange(typeVal);
                        }}
                      >
                        <AppText
                          style={[
                            styles.typeButtonText,
                            isSelected && styles.typeButtonTextSelected,
                          ]}
                        >
                          {mapEventType(typeVal)}
                        </AppText>
                      </Pressable>,
                    );
                  }
                  return acc;
                }, [])}
              </ScrollView>
            )}
          />
          {errors.type ? <AppText style={styles.errorText}>{errors.type.message}</AppText> : null}
        </View>

        <View style={styles.row}>
          <View style={styles.rowItem}>
            <Controller
              control={control}
              name="startAt"
              render={({ field: { onChange, value } }) => (
                <AppDateTimePicker
                  label="Début"
                  value={value}
                  onChange={onChange}
                  mode="datetime"
                />
              )}
            />
            {errors.startAt ? (
              <AppText style={styles.errorText}>{errors.startAt.message}</AppText>
            ) : null}
          </View>
          <View style={styles.rowItem}>
            <Controller
              control={control}
              name="endAt"
              render={({ field: { onChange, value } }) => (
                <AppDateTimePicker label="Fin" value={value} onChange={onChange} mode="datetime" />
              )}
            />
            {errors.endAt ? (
              <AppText style={styles.errorText}>{errors.endAt.message}</AppText>
            ) : null}
          </View>
        </View>

        <View style={styles.row}>
          <View style={styles.rowItem}>
            <AppText style={styles.label}>Participants Max</AppText>
            <Controller
              control={control}
              name="maxParticipants"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  style={styles.input}
                  value={String(value)}
                  keyboardType="numeric"
                  onChangeText={onChange}
                />
              )}
            />
            {errors.maxParticipants ? (
              <AppText style={styles.errorText}>{errors.maxParticipants.message}</AppText>
            ) : null}
          </View>
          <View style={styles.rowItem}>
            <AppText style={styles.label}>Score d'impact</AppText>
            <Controller
              control={control}
              name="awardedImpactScore"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  style={styles.input}
                  value={String(value)}
                  keyboardType="numeric"
                  onChangeText={onChange}
                />
              )}
            />
            {errors.awardedImpactScore ? (
              <AppText style={styles.errorText}>{errors.awardedImpactScore.message}</AppText>
            ) : null}
          </View>
        </View>

        <AppButton
          text={mutation.isPending ? 'Création en cours...' : "Créer l'évènement"}
          onPress={() => {
            void onSubmit();
          }}
          disabled={mutation.isPending}
        />
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
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: theme.spacing.sm,
  },
  rowItem: {
    flex: 1,
    marginBottom: theme.spacing.lg,
  },
  errorText: {
    color: theme.colors.danger,
    fontSize: 12,
    marginTop: 4,
  },
  bottomSpacer: {
    height: theme.spacing.xxl,
  },
  typeScroll: {
    flexDirection: 'row',
    marginTop: theme.spacing.xs,
  },
  typeButton: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radius.full,
    borderWidth: 1,
    borderColor: theme.colors.lightGrey,
    marginRight: theme.spacing.sm,
    backgroundColor: theme.colors.white,
  },
  typeButtonSelected: {
    backgroundColor: theme.colors.primaryEco,
    borderColor: theme.colors.primaryEco,
  },
  typeButtonText: {
    fontSize: 14,
    color: theme.colors.black,
    fontWeight: '500',
  },
  typeButtonTextSelected: {
    color: theme.colors.white,
  },
});
