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
import { EventType, EventState } from '@volontariapp/contracts';
import type { Event, UpdateEventRequest } from '@volontariapp/contracts';

const editEventSchema = z.object({
  title: z.string().min(3, 'Le titre est requis'),
  description: z.string().min(10, 'La description est trop courte'),
  localisationName: z.string().min(2, 'Le lieu est requis'),
  type: z.enum(EventType),
  maxParticipants: z.string().regex(/^\d+$/, 'Doit être un nombre').transform(Number),
  awardedImpactScore: z.string().regex(/^\d+$/, 'Doit être un nombre').transform(Number),
  state: z.enum(EventState),
});

type EditEventFormData = z.infer<typeof editEventSchema>;

interface AdminEventEditModalProps {
  visible: boolean;
  event: Event | null;
  onClose: () => void;
  onSubmit: (eventId: string, data: UpdateEventRequest, newState: EventState) => void;
  isLoading?: boolean;
}

interface ChipOption {
  label: string;
  value: number;
  name: string;
  color: string;
}

const TYPE_OPTIONS: ChipOption[] = [
  {
    label: '🤝  Social',
    value: EventType.EVENT_TYPE_SOCIAL,
    name: EventType[EventType.EVENT_TYPE_SOCIAL],
    color: theme.colors.primarySocio,
  },
  {
    label: '🌿  Écologie',
    value: EventType.EVENT_TYPE_ECOLOGY,
    name: EventType[EventType.EVENT_TYPE_ECOLOGY],
    color: theme.colors.primaryEco,
  },
];

const STATE_OPTIONS: ChipOption[] = [
  {
    label: 'Brouillon',
    value: EventState.EVENT_STATE_DRAFT,
    name: EventState[EventState.EVENT_STATE_DRAFT],
    color: theme.colors.grey,
  },
  {
    label: 'Publié',
    value: EventState.EVENT_STATE_PUBLISHED,
    name: EventState[EventState.EVENT_STATE_PUBLISHED],
    color: theme.colors.primaryEco,
  },
  {
    label: 'Annulé',
    value: EventState.EVENT_STATE_CANCELLED,
    name: EventState[EventState.EVENT_STATE_CANCELLED],
    color: theme.colors.danger,
  },
];

const NUMERIC_FIELDS = [
  { name: 'maxParticipants', label: 'Participants Max *', placeholder: '10' },
  { name: 'awardedImpactScore', label: "Score d'impact *", placeholder: '100' },
] as const;

interface ChipGroupProps {
  label: string;
  options: ChipOption[];
  value: unknown;
  onChange: (value: number) => void;
}

function ChipGroup({ label, options, value, onChange }: ChipGroupProps): React.JSX.Element {
  return (
    <View style={styles.inputGroup}>
      <AppText style={styles.label}>{label}</AppText>
      <View style={styles.themeChips}>
        {options.map((option) => (
          <FilterChip
            key={option.name}
            label={option.label}
            selected={value === option.value || String(value) === option.name}
            color={option.color}
            onPress={() => {
              onChange(option.value);
            }}
          />
        ))}
      </View>
    </View>
  );
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
          type:
            typeof event.type === 'string'
              ? EventType[event.type as unknown as keyof typeof EventType]
              : event.type,
          maxParticipants: String(event.maxParticipants),
          awardedImpactScore: String(event.awardedImpactScore),
          state:
            typeof event.state === 'string'
              ? EventState[event.state as unknown as keyof typeof EventState]
              : event.state,
        }
      : {
          title: '',
          description: '',
          localisationName: '',
          type: EventType.EVENT_TYPE_SOCIAL,
          maxParticipants: '10',
          awardedImpactScore: '100',
          state: EventState.EVENT_STATE_DRAFT,
        },
  });

  const handleClose = (): void => {
    reset();
    onClose();
  };

  const submitForm = (data: EditEventFormData): void => {
    if (!event) return;
    onSubmit(
      event.id,
      {
        title: data.title,
        description: data.description,
        localisationName: data.localisationName,
        type: data.type,
        maxParticipants: data.maxParticipants,
        awardedImpactScore: data.awardedImpactScore,
      },
      data.state,
    );
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
          <ChipGroup
            label="Thématique *"
            options={TYPE_OPTIONS}
            value={value}
            onChange={onChange}
          />
        )}
      />

      <Controller
        control={control}
        name="state"
        render={({ field: { onChange, value } }) => (
          <ChipGroup label="Statut *" options={STATE_OPTIONS} value={value} onChange={onChange} />
        )}
      />

      <View style={styles.rowInputs}>
        {NUMERIC_FIELDS.map((field) => (
          <View key={field.name} style={styles.flex1}>
            <Controller
              control={control}
              name={field.name}
              render={({ field: { onChange, onBlur, value } }) => (
                <AppInput
                  label={field.label}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  errorMessage={errors[field.name]?.message}
                  placeholder={field.placeholder}
                  keyboardType="numeric"
                />
              )}
            />
          </View>
        ))}
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
