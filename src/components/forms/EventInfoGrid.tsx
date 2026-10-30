import React, { useState, useMemo, useCallback } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import type { Control, FieldErrors, UseFormSetValue, UseFormWatch } from 'react-hook-form';
import { computeEventScoring } from '@volontariapp/shared';
import { AppText } from '@/components/typography/AppText';
import { AppIcons } from '@/components/media/AppIcons';
import { AppDateTimePicker } from '@/components/inputs';
import { theme } from '@/shared/themes/theme';
import type { EventFormValues } from '@/api/event/event.schema';
import { EventDurationModal } from './EventDurationModal';
import { ValuePickerModal, type ValuePickerPreset } from './ValuePickerModal';
import { EventScoringInfoModal } from './EventScoringInfoModal';

interface EventInfoGridProps {
  control?: Control<EventFormValues>;
  errors: FieldErrors<EventFormValues>;
  setValue: UseFormSetValue<EventFormValues>;
  watch: UseFormWatch<EventFormValues>;
}

const PARTICIPANTS_PRESETS: ValuePickerPreset[] = [
  { value: 5, label: '5 personnes', sublabel: 'Petit comité' },
  { value: 10, label: '10 personnes', sublabel: 'Équipe restreinte' },
  { value: 20, label: '20 personnes', sublabel: 'Groupe standard' },
  { value: 50, label: '50 personnes', sublabel: 'Grande équipe' },
  { value: 100, label: '100 personnes', sublabel: 'Grand rassemblement' },
];

export function EventInfoGrid({ errors, setValue, watch }: EventInfoGridProps): React.JSX.Element {
  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const startAt = watch('startAt');
  const endAt = watch('endAt');
  const maxParticipants = watch('maxParticipants') || 0;

  // Détermine la durée initiale en heures
  const initialDuration = useMemo(() => {
    const diffMs = endAt.getTime() - startAt.getTime();
    const h = diffMs / (3600 * 1000);
    return h > 0 ? Math.round(h * 10) / 10 : 8;
  }, [startAt, endAt]);

  const [durationHours, setDurationHours] = useState<number>(initialDuration);
  const [isDurationModalVisible, setIsDurationModalVisible] = useState<boolean>(false);
  const [isParticipantsModalVisible, setIsParticipantsModalVisible] = useState<boolean>(false);
  const [isScoringInfoModalVisible, setIsScoringInfoModalVisible] = useState<boolean>(false);

  // Estimation dynamique des points selon la durée et la jauge
  const estimatedScoring = useMemo(() => {
    const attendeesCount = maxParticipants > 0 ? maxParticipants : 10;
    const dummyAttendees = Array.from({ length: attendeesCount }, (_, i) => ({
      userId: `sim-user-${String(i)}`,
      registeredAt: new Date(startAt.getTime() + i * 1000),
    }));

    return computeEventScoring({
      startAt,
      endAt,
      maxParticipants: attendeesCount,
      organizerId: 'sim-creator',
      attendees: dummyAttendees,
    });
  }, [startAt, endAt, maxParticipants]);

  const maxEstimatedPoints = estimatedScoring.participants[0]?.points ?? 0;
  const organizerBonusPoints = estimatedScoring.organizerPoints;

  // Applique la nouvelle durée et recalcule la date de fin
  const handleDurationChange = useCallback(
    (newHours: number) => {
      setDurationHours(newHours);
      const newEnd = new Date(startAt.getTime() + newHours * 3600 * 1000);
      setValue('endAt', newEnd, { shouldValidate: true });
    },
    [startAt, setValue],
  );

  // Mise à jour de startAt : conserve la durée et recalcule endAt
  const handleStartAtChange = useCallback(
    (newStart: Date) => {
      setValue('startAt', newStart, { shouldValidate: true });
      const newEnd = new Date(newStart.getTime() + durationHours * 3600 * 1000);
      setValue('endAt', newEnd, { shouldValidate: true });
    },
    [durationHours, setValue],
  );

  // Formatage texte de la durée
  const formatDurationText = (hours: number): string => {
    if (hours === 1) return '1 heure';
    if (hours === 2) return '2 heures';
    if (hours === 3) return '3 heures';
    if (hours === 4) return 'Demi-journée (4h)';
    if (hours === 8) return '1 journée (8h)';
    if (hours === 24) return '24 heures (1j)';
    if (hours % 1 === 0) return `${String(hours)} heures`;
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return `${String(h)}h${String(m).padStart(2, '0')}`;
  };

  // Aperçu du début de l'évènement
  const formatStartAtPreview = (start: Date): string => {
    const dateStr = start.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
    const timeStr = start.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    });
    return `${dateStr} à ${timeStr}`;
  };

  // Aperçu de la fin de l'évènement
  const formatEndTimePreview = (start: Date, end: Date): string => {
    const isSameDay =
      start.getFullYear() === end.getFullYear() &&
      start.getMonth() === end.getMonth() &&
      start.getDate() === end.getDate();

    const timeStr = end.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    if (isSameDay) {
      return `Fin à ${timeStr}`;
    }
    const dateStr = end.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
    return `Fin le ${dateStr} à ${timeStr}`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.listCard}>
        {/* 1. Début de l'évènement */}
        <AppDateTimePicker
          value={startAt}
          onChange={handleStartAtChange}
          mode="datetime"
          minimumDate={today}
          inputStyle={styles.rowPressable}
        >
          <View style={styles.rowLeft}>
            <View style={[styles.iconBox, { backgroundColor: '#eef3ef' }]}>
              <AppIcons icon="calendar" size={18} color={theme.colors.primaryEco} />
            </View>
            <View style={styles.textContainer}>
              <AppText style={styles.rowLabel}>Début de l'évènement</AppText>
              {errors.startAt?.message !== undefined ? (
                <AppText style={styles.errorText}>{errors.startAt.message}</AppText>
              ) : (
                <AppText style={styles.rowSubtitle}>Date et heure de début</AppText>
              )}
            </View>
          </View>
          <View style={styles.rowRight}>
            <AppText style={[styles.rowValue, { color: theme.colors.primaryEco }]}>
              {formatStartAtPreview(startAt)}
            </AppText>
            <AppIcons icon="chevron-right" size={16} color={theme.colors.grey} />
          </View>
        </AppDateTimePicker>

        <View style={styles.separator} />

        {/* 2. Durée de l'évènement */}
        <Pressable
          onPress={() => {
            setIsDurationModalVisible(true);
          }}
          style={({ pressed }) => [styles.rowPressable, pressed && styles.rowPressed]}
          accessibilityRole="button"
          accessibilityLabel="Modifier la durée de l'événement"
        >
          <View style={styles.rowLeft}>
            <View style={[styles.iconBox, { backgroundColor: '#eef3ef' }]}>
              <AppIcons icon="clock" size={18} color={theme.colors.primaryEco} />
            </View>
            <View style={styles.textContainer}>
              <AppText style={styles.rowLabel}>Durée de l'évènement</AppText>
              {errors.endAt?.message !== undefined ? (
                <AppText style={styles.errorText}>{errors.endAt.message}</AppText>
              ) : (
                <AppText style={styles.rowSubtitle}>{formatEndTimePreview(startAt, endAt)}</AppText>
              )}
            </View>
          </View>
          <View style={styles.rowRight}>
            <AppText style={[styles.rowValue, { color: theme.colors.primaryEco }]}>
              {formatDurationText(durationHours)}
            </AppText>
            <AppIcons icon="chevron-right" size={16} color={theme.colors.grey} />
          </View>
        </Pressable>

        <View style={styles.separator} />

        {/* 3. Nombre de personnes Max */}
        <Pressable
          onPress={() => {
            setIsParticipantsModalVisible(true);
          }}
          style={({ pressed }) => [styles.rowPressable, pressed && styles.rowPressed]}
          accessibilityRole="button"
          accessibilityLabel="Modifier le nombre de personnes max"
        >
          <View style={styles.rowLeft}>
            <View style={[styles.iconBox, { backgroundColor: '#e6f0f3' }]}>
              <AppIcons icon="users" size={18} color={theme.colors.primarySocio} />
            </View>
            <View style={styles.textContainer}>
              <AppText style={styles.rowLabel}>Participants max</AppText>
              {errors.maxParticipants?.message !== undefined ? (
                <AppText style={styles.errorText}>{errors.maxParticipants.message}</AppText>
              ) : (
                <AppText style={styles.rowSubtitle}>Capacité d'accueil</AppText>
              )}
            </View>
          </View>
          <View style={styles.rowRight}>
            <AppText style={[styles.rowValue, { color: theme.colors.primarySocio }]}>
              {maxParticipants > 0
                ? `${String(maxParticipants)} participant${maxParticipants > 1 ? 's' : ''}`
                : 'Non défini'}
            </AppText>
            <AppIcons icon="chevron-right" size={16} color={theme.colors.grey} />
          </View>
        </Pressable>

        <View style={styles.separator} />

        {/* 4. Points d'impact estimés */}
        <Pressable
          onPress={() => {
            setIsScoringInfoModalVisible(true);
          }}
          style={({ pressed }) => [styles.rowPressable, pressed && styles.rowPressed]}
          accessibilityRole="button"
          accessibilityLabel="Consulter l'estimation des points d'impact"
        >
          <View style={styles.rowLeft}>
            <View style={[styles.iconBox, { backgroundColor: '#eef3ef' }]}>
              <AppIcons icon="award" size={18} color={theme.colors.primaryEco} />
            </View>
            <View style={styles.textContainer}>
              <AppText style={styles.rowLabel}>Points d'impact estimés</AppText>
              <AppText style={styles.rowSubtitle}>Calcul automatique à la clôture</AppText>
            </View>
          </View>
          <View style={styles.rowRight}>
            <AppText style={[styles.rowValue, { color: theme.colors.primaryEco }]}>
              Jusqu'à +{String(maxEstimatedPoints)} pts
            </AppText>
            <AppIcons icon="chevron-right" size={16} color={theme.colors.grey} />
          </View>
        </Pressable>
      </View>

      {/* Modale de sélection de la durée */}
      <EventDurationModal
        visible={isDurationModalVisible}
        onClose={() => {
          setIsDurationModalVisible(false);
        }}
        currentHours={durationHours}
        startAt={startAt}
        onConfirm={handleDurationChange}
      />

      {/* Modale de sélection du Nombre de personnes Max */}
      <ValuePickerModal
        visible={isParticipantsModalVisible}
        onClose={() => {
          setIsParticipantsModalVisible(false);
        }}
        title="Nombre de personnes Max"
        subtitle="Définissez la capacité d'accueil de l'évènement"
        currentValue={maxParticipants}
        presets={PARTICIPANTS_PRESETS}
        onConfirm={(val) => {
          setValue('maxParticipants', val, { shouldValidate: true });
        }}
        customOptionLabel="Autre nombre"
        customOptionSublabel="Personnalisé"
        customInputLabel="Entrez le nombre de participants max :"
        customUnit="participants"
        customPlaceholder="Ex: 35"
        minValue={1}
        maxValue={5000}
        allowDecimals={false}
        previewTitle="Capacité d'accueil"
        previewIcon="users"
        formatPreviewDetails={(val) => ({
          label: 'PARTICIPANTS ATTENDUS :',
          value: `${String(val)} personne${val > 1 ? 's' : ''} max`,
          hint: 'Les inscriptions seront limitées à cette jauge',
        })}
        confirmButtonText="Valider le nombre"
        variant="socio"
      />

      {/* Modale d'information sur le scoring dynamique */}
      <EventScoringInfoModal
        visible={isScoringInfoModalVisible}
        onClose={() => {
          setIsScoringInfoModalVisible(false);
        }}
        maxEstimatedPoints={maxEstimatedPoints}
        organizerPoints={organizerBonusPoints}
        durationHours={durationHours}
        maxParticipants={maxParticipants}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing.lg,
  },
  listCard: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.lightGrey,
    overflow: 'hidden',
  },
  rowPressable: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.sm + 4,
    paddingHorizontal: theme.spacing.md,
    minHeight: 64,
    backgroundColor: 'transparent',
    borderWidth: 0,
    borderColor: 'transparent',
    borderRadius: 0,
  },
  rowPressed: {
    opacity: 0.7,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: theme.spacing.sm,
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: theme.radius.sm,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.sm,
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  rowLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  rowSubtitle: {
    fontSize: 12,
    color: theme.colors.grey,
    marginTop: 2,
  },
  rowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexShrink: 0,
  },
  rowValue: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'right',
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: theme.colors.lightGrey,
    marginLeft: 62,
  },
  errorText: {
    color: theme.colors.danger,
    fontSize: 11,
    marginTop: 2,
    fontWeight: '500',
  },
});
