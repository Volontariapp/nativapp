import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useAppTheme, useStyles } from '@/context/ThemeContext';
import type { AppTheme } from '@/shared/themes/theme';
import { AppText } from '@/components/typography/AppText';
import { AppIcons } from '@/components/media/AppIcons';
import { ValuePickerModal, type ValuePickerPreset } from './ValuePickerModal';

export interface DurationPreset {
  hours: number;
  label: string;
  sublabel?: string;
}

export const DURATION_PRESETS: DurationPreset[] = [
  { hours: 1, label: '1 heure', sublabel: '1h' },
  { hours: 2, label: '2 heures', sublabel: '2h' },
  { hours: 3, label: '3 heures', sublabel: '3h' },
  { hours: 4, label: 'Demi-journée', sublabel: '4h' },
  { hours: 8, label: 'Journée complète', sublabel: '8h' },
  { hours: 24, label: '24 heures', sublabel: '1j' },
];

const VALUE_PICKER_PRESETS: ValuePickerPreset[] = DURATION_PRESETS.map((p) => ({
  value: p.hours,
  label: p.label,
  sublabel: p.sublabel,
}));

export interface EventDurationModalProps {
  visible: boolean;
  onClose: () => void;
  currentHours: number;
  startAt: Date;
  onConfirm: (hours: number) => void;
}

export function EventDurationModal({
  visible,
  onClose,
  currentHours,
  startAt,
  onConfirm,
}: EventDurationModalProps): React.JSX.Element {
  const { theme } = useAppTheme();
  const styles = useStyles(createStyles);

  const formatDateTime = (date: Date): string => {
    return date.toLocaleString('fr-FR', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderTimePreview = (hours: number): React.ReactNode => {
    const computedEndAt = new Date(startAt.getTime() + hours * 3600 * 1000);
    return (
      <View style={styles.previewTimes}>
        <View style={styles.timeBlock}>
          <AppText style={styles.timeBlockLabel}>DÉBUT :</AppText>
          <AppText style={styles.timeBlockValue}>{formatDateTime(startAt)}</AppText>
        </View>
        <View style={styles.timeArrow}>
          <AppIcons icon="arrow-right" size={18} color={theme.colors.grey} />
        </View>
        <View style={styles.timeBlock}>
          <AppText style={styles.timeBlockLabel}>FIN ESTIMÉE :</AppText>
          <AppText style={styles.timeBlockValue}>{formatDateTime(computedEndAt)}</AppText>
        </View>
      </View>
    );
  };

  return (
    <ValuePickerModal
      visible={visible}
      onClose={onClose}
      title="Durée de l'évènement"
      subtitle="Choisissez un format ou saisissez la durée"
      currentValue={currentHours}
      presets={VALUE_PICKER_PRESETS}
      onConfirm={onConfirm}
      customOptionLabel="Autre durée"
      customOptionSublabel="Personnalisé"
      customInputLabel="Entrez le temps en heures :"
      customUnit="heures"
      customPlaceholder="Ex: 5"
      minValue={0.5}
      maxValue={720}
      allowDecimals={true}
      previewTitle="Créneau horaire calculé"
      previewIcon="clock"
      renderPreview={renderTimePreview}
      confirmButtonText="Valider la durée"
      variant="eco"
    />
  );
}

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    previewTimes: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    timeBlock: {
      flex: 1,
    },
    timeBlockLabel: {
      fontSize: 11,
      fontWeight: '600',
      color: theme.colors.grey,
      marginBottom: 2,
    },
    timeBlockValue: {
      fontSize: 13,
      fontWeight: 'bold',
      color: theme.colors.text,
    },
    timeArrow: {
      paddingHorizontal: theme.spacing.xs,
    },
  });
