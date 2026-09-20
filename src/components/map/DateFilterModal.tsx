import React, { useState } from 'react';
import { View, StyleSheet, Modal, Pressable } from 'react-native';
import { AppText } from '@/components/typography/AppText';
import { AppCalendar } from '@/components/ui/AppCalendar';
import { AppButton } from '@/components/buttons/AppButton';
import { AppIconsButton } from '@/components/buttons/AppIconsButton';
import { AppBadgeButton } from '@/components/buttons/AppBadgeButton';
import { useAppTheme, useStyles } from '@/context/ThemeContext';
import type { AppTheme } from '@/shared/themes/theme';

export interface DateFilterModalProps {
  visible: boolean;
  onClose: () => void;
  selectedDate: string | null;
  onApply: (date: string | null) => void;
}

const normalizeToIsoDate = (date: string | null | undefined): string | null => {
  if (date == null || date.length === 0) return null;
  if (date.includes('-')) return date;
  const parts = date.split('/');
  if (parts.length === 3 && parts[0] != null && parts[1] != null && parts[2] != null) {
    const day = parts[0].padStart(2, '0');
    const month = parts[1].padStart(2, '0');
    let year = parts[2];
    if (year.length === 2) {
      year = `20${year}`;
    }
    return `${year}-${month}-${day}`;
  }
  return null;
};

const formatFrenchDisplay = (isoDate: string): string => {
  const parts = isoDate.split('-');
  if (parts.length === 3 && parts[0] != null && parts[1] != null && parts[2] != null) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return isoDate;
};

const getTodayString = (): string => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${String(year)}-${month}-${day}`;
};

interface DateFilterContentProps {
  selectedDate: string | null;
  onClose: () => void;
  onApply: (date: string | null) => void;
}

function DateFilterContent({
  selectedDate,
  onClose,
  onApply,
}: DateFilterContentProps): React.JSX.Element {
  const { theme } = useAppTheme();
  const styles = useStyles(createStyles);
  const [tempDate, setTempDate] = useState<string | null>(() => normalizeToIsoDate(selectedDate));

  const handleDayPress = (day: { dateString: string }): void => {
    setTempDate(day.dateString);
  };

  const handleSelectToday = (): void => {
    setTempDate(getTodayString());
  };

  const handleSelectAll = (): void => {
    setTempDate(null);
  };

  const handleConfirm = (): void => {
    onApply(tempDate);
    onClose();
  };

  const markedDates =
    tempDate !== null
      ? {
          [tempDate]: {
            customStyles: {
              container: {
                backgroundColor: theme.colors.primaryEco,
                borderRadius: 20,
              },
              text: {
                color: theme.colors.white,
                fontWeight: 'bold' as const,
              },
            },
          },
        }
      : undefined;

  return (
    <Pressable style={styles.overlay} onPress={onClose}>
      <Pressable
        style={styles.card}
        onPress={(e) => {
          e.stopPropagation();
        }}
      >
        {/* Header */}
        <View style={styles.header}>
          <AppText style={styles.title}>Filtrer par date</AppText>
          <AppIconsButton
            icon="x"
            size={28}
            variant="white"
            iconColor={theme.colors.grey}
            onPress={onClose}
            accessibilityLabel="Fermer"
          />
        </View>

        {/* Value Display */}
        <View style={styles.valueContainer}>
          <AppText style={styles.valueText}>
            {tempDate !== null ? formatFrenchDisplay(tempDate) : 'Toutes les dates'}
          </AppText>
          <AppText style={styles.subText}>
            {tempDate !== null
              ? 'Afficher les initiatives à cette date'
              : 'Afficher toutes les initiatives sans filtre de date'}
          </AppText>
        </View>

        {/* Quick presets */}
        <View style={styles.presetsRow}>
          <AppBadgeButton
            label="Toutes les dates"
            variant="all"
            selected={tempDate === null}
            onPress={handleSelectAll}
          />
          <AppBadgeButton
            label="Aujourd'hui"
            variant="eco"
            selected={tempDate === getTodayString()}
            onPress={handleSelectToday}
          />
        </View>

        {/* Calendar */}
        <View style={styles.calendarWrapper}>
          <AppCalendar
            current={tempDate ?? getTodayString()}
            markedDates={markedDates}
            onDayPress={handleDayPress}
            containerStyle={styles.calendarContainer}
          />
        </View>

        {/* Actions */}
        <View style={styles.actionContainer}>
          <AppButton
            text="Appliquer"
            variant="eco"
            size="default"
            onPress={handleConfirm}
          />
        </View>
      </Pressable>
    </Pressable>
  );
}

export function DateFilterModal({
  visible,
  onClose,
  selectedDate,
  onApply,
}: DateFilterModalProps): React.JSX.Element {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      {visible && (
        <DateFilterContent
          key={selectedDate ?? 'all'}
          selectedDate={selectedDate}
          onClose={onClose}
          onApply={onApply}
        />
      )}
    </Modal>
  );
}

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: theme.colors.blackOverlay,
      justifyContent: 'center',
      alignItems: 'center',
      padding: theme.spacing.lg,
    },
    card: {
      width: '100%',
      maxWidth: 380,
      backgroundColor: theme.colors.white,
      borderRadius: theme.radius.lg,
      padding: theme.spacing.xl,
      boxShadow: '0 4px 14px rgba(0, 0, 0, 0.25)',
      gap: theme.spacing.md,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    title: {
      fontSize: 18,
      fontWeight: theme.typography.fontWeight.bold,
      color: theme.colors.text,
    },
    valueContainer: {
      alignItems: 'center',
      paddingVertical: theme.spacing.xs,
    },
    valueText: {
      fontSize: 22,
      fontWeight: '700',
      color: theme.colors.primaryEco,
    },
    subText: {
      fontSize: 12,
      color: theme.colors.grey,
      marginTop: 4,
      textAlign: 'center',
    },
    presetsRow: {
      flexDirection: 'row',
      justifyContent: 'center',
      gap: 10,
    },
    calendarWrapper: {
      borderRadius: theme.radius.md,
      overflow: 'hidden',
    },
    calendarContainer: {
      boxShadow: 'none',
    },
    actionContainer: {
      marginTop: theme.spacing.xs,
    },
  });
