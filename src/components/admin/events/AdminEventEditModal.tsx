import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { theme } from '@/shared/themes/theme';
import { AppText } from '@/components/typography/AppText';
import { AppButton } from '@/components/buttons/AppButton';
import { AppInput } from '@/components/inputs/AppInput';
import { FilterChip } from '@/components/ui/FilterChip';
import { AdminModal } from '@/components/admin/ui/AdminModal';
import { EventType } from '@volontariapp/contracts';
import type { Event, UpdateEventRequest } from '@volontariapp/contracts';

const editEventSchema = z.object({
  title: z.string().min(3, 'Le titre est requis'),
  description: z.string().min(10, 'La description est trop courte'),
  localisationName: z.string().min(2, 'Le lieu est requis'),
  type: z.enum(EventType),
  maxParticipants: z.string().regex(/^\d+$/, 'Doit être un nombre').transform(Number),
  awardedImpactScore: z.string().regex(/^\d+$/, 'Doit être un nombre').transform(Number),
});

type EditEventFormData = z.infer<typeof editEventSchema>;

interface AdminEventEditModalProps {
  visible: boolean;
  event: Event | null;
  onClose: () => void;
  onSubmit: (eventId: string, data: UpdateEventRequest) => void;
  isLoading?: boolean;
}

export function AdminEventEditModal({
  visible,
  event,
  onClose,
  onSubmit,
  isLoading,
}: AdminEventEditModalProps): React.JSX.Element {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(editEventSchema),
    values: event
      ? {
          title: event.title,
          description: event.description,
          localisationName: event.localisationName,
          type: event.type,
          maxParticipants: String(event.maxParticipants),
          awardedImpactScore: String(event.awardedImpactScore),
        }
      : {
          title: '',
          description: '',
          localisationName: '',
          type: EventType.EVENT_TYPE_SOCIAL,
          maxParticipants: '10',
          awardedImpactScore: '100',
        },
  });

  const handleClose = (): void => {
    reset();
    onClose();
  };

  const submitForm = (data: EditEventFormData): void => {
    if (!event) return;
    onSubmit(event.id, {
      title: data.title,
      description: data.description,
      localisationName: data.localisationName,
      type: data.type,
      maxParticipants: data.maxParticipants,
      awardedImpactScore: data.awardedImpactScore,
    });
  };

  return (
    <AdminModal visible={visible} onClose={handleClose} title="Modifier l'Événement">
      <Controller
        control={control}
        name="title"
        render={({ field: { onChange, onBlur, value } }) => (
          <AppInput
            label="Titre de l'événement *"
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
            errorMessage={errors.title?.message}
            placeholder="Ramassage de déchets..."
          />
        )}
      />

      <Controller
        control={control}
        name="description"
        render={({ field: { onChange, onBlur, value } }) => (
          <AppInput
            label="Description *"
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
            errorMessage={errors.description?.message}
            placeholder="Description détaillée..."
            multiline
            numberOfLines={3}
          />
        )}
      />

      <Controller
        control={control}
        name="localisationName"
        render={({ field: { onChange, onBlur, value } }) => (
          <AppInput
            label="Lieu / Ville *"
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
            errorMessage={errors.localisationName?.message}
            placeholder="Paris, France"
          />
        )}
      />

      <Controller
        control={control}
        name="type"
        render={({ field: { onChange, value } }) => (
          <View style={styles.inputGroup}>
            <AppText style={styles.label}>Thématique *</AppText>
            <View style={styles.themeChips}>
              <FilterChip
                label="🤝  Social"
                selected={
                  value === EventType.EVENT_TYPE_SOCIAL ||
                  String(value) === EventType[EventType.EVENT_TYPE_SOCIAL]
                }
                color={theme.colors.primarySocio}
                onPress={() => {
                  onChange(EventType.EVENT_TYPE_SOCIAL);
                }}
              />
              <FilterChip
                label="🌿  Écologie"
                selected={
                  value === EventType.EVENT_TYPE_ECOLOGY ||
                  String(value) === EventType[EventType.EVENT_TYPE_ECOLOGY]
                }
                color={theme.colors.primaryEco}
                onPress={() => {
                  onChange(EventType.EVENT_TYPE_ECOLOGY);
                }}
              />
            </View>
          </View>
        )}
      />

      <View style={styles.rowInputs}>
        <View style={styles.flex1}>
          <Controller
            control={control}
            name="maxParticipants"
            render={({ field: { onChange, onBlur, value } }) => (
              <AppInput
                label="Participants Max *"
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                errorMessage={errors.maxParticipants?.message}
                placeholder="10"
                keyboardType="numeric"
              />
            )}
          />
        </View>
        <View style={styles.flex1}>
          <Controller
            control={control}
            name="awardedImpactScore"
            render={({ field: { onChange, onBlur, value } }) => (
              <AppInput
                label="Score d'impact *"
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                errorMessage={errors.awardedImpactScore?.message}
                placeholder="100"
                keyboardType="numeric"
              />
            )}
          />
        </View>
      </View>

      <View style={styles.modalActions}>
        <AppButton text="Annuler" variant="eco" onPress={handleClose} disabled={isLoading} />
        <AppButton
          text="Enregistrer"
          variant="eco"
          onPress={() => {
            void handleSubmit(submitForm)();
          }}
          disabled={isLoading}
        />
      </View>
    </AdminModal>
  );
}

const styles = StyleSheet.create({
  flex1: { flex: 1 },
  inputGroup: { gap: theme.spacing.xs },
  label: { fontSize: theme.typography.fontSize.xs, fontWeight: '600', color: theme.colors.grey },
  themeChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.sm,
  },
  rowInputs: { flexDirection: 'row', gap: theme.spacing.md },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: theme.spacing.md,
    marginTop: theme.spacing.md,
  },
});
