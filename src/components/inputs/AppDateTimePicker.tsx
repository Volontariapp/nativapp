import React, { useState } from 'react';
import { View, StyleSheet, Pressable, Platform, Modal } from 'react-native';
import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import Icon from 'react-native-vector-icons/Feather';
import { AppText } from '@/components/typography/AppText';
import { theme } from '@/shared/themes/theme';

export interface AppDateTimePickerProps {
  value: Date;
  onChange: (date: Date) => void;
  label?: string;
  mode?: 'date' | 'time' | 'datetime';
}

export function AppDateTimePicker({
  value,
  onChange,
  label,
  mode = 'datetime',
}: AppDateTimePickerProps): React.JSX.Element {
  const [showPicker, setShowPicker] = useState(false);
  const [pickerMode, setPickerMode] = useState<'date' | 'time' | 'datetime'>(
    mode === 'datetime' ? 'date' : mode,
  );

  const handlePress = () => {
    if (mode === 'datetime') {
      setPickerMode(Platform.OS === 'ios' ? 'datetime' : 'date');
    }
    setShowPicker(true);
  };

  const handleChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowPicker(false);
    }

    if (selectedDate) {
      if (mode === 'datetime' && pickerMode === 'date' && Platform.OS === 'android') {
        onChange(selectedDate);
        setPickerMode('time');
        setShowPicker(true);
      } else {
        onChange(selectedDate);
      }
    }
  };

  const displayFormat =
    mode === 'date'
      ? value.toLocaleDateString('fr-FR')
      : mode === 'time'
        ? value.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
        : value.toLocaleString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          });

  return (
    <View style={styles.container}>
      {label !== undefined && label.trim() !== '' ? (
        <AppText style={styles.label}>{label}</AppText>
      ) : null}

      <Pressable
        style={({ pressed }) => [styles.inputWrapper, pressed && { opacity: 0.7 }]}
        onPress={handlePress}
      >
        <Icon name={mode === 'time' ? 'clock' : 'calendar'} size={16} color={theme.colors.grey} />
        <AppText style={styles.dateText}>{displayFormat}</AppText>
      </Pressable>

      {Platform.OS === 'web' ? (
        showPicker && (
          <input
            type={mode === 'time' ? 'time' : mode === 'date' ? 'date' : 'datetime-local'}
            value={
              mode === 'time'
                ? value.toTimeString().slice(0, 5)
                : mode === 'date'
                  ? value.toISOString().slice(0, 10)
                  : value.toISOString().slice(0, 16)
            }
            onChange={(e) => {
              const newDate = new Date(e.target.value);
              if (!isNaN(newDate.getTime())) {
                onChange(newDate);
              }
              setShowPicker(false);
            }}
            style={{ position: 'absolute', opacity: 0, width: '100%', height: '100%' }}
            onBlur={() => {
              setShowPicker(false);
            }}
            autoFocus
          />
        )
      ) : Platform.OS === 'ios' ? (
        <Modal visible={showPicker} transparent={true} animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Pressable
                  style={({ pressed }) => [pressed && { opacity: 0.7 }]}
                  onPress={() => {
                    setShowPicker(false);
                  }}
                >
                  <AppText style={styles.doneText}>Valider</AppText>
                </Pressable>
              </View>
              <DateTimePicker
                value={value}
                mode={pickerMode}
                locale="fr-FR"
                display="spinner"
                themeVariant="light"
                textColor={theme.colors.black}
                style={{ height: 216, width: '100%' }}
                onChange={handleChange}
              />
            </View>
          </View>
        </Modal>
      ) : (
        showPicker && (
          <DateTimePicker
            value={value}
            mode={pickerMode}
            locale="fr-FR"
            display="default"
            onChange={handleChange}
          />
        )
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  label: {
    fontSize: 14,
    color: theme.colors.grey,
    marginBottom: theme.spacing.xs,
    fontWeight: '600',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.white,
    borderWidth: 1,
    borderColor: theme.colors.lightGrey,
    borderRadius: theme.radius.md,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.md,
    height: 48,
  },
  dateText: {
    flex: 1,
    paddingLeft: theme.spacing.sm,
    fontSize: 14,
    color: theme.colors.black,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: theme.colors.white,
    paddingBottom: Platform.OS === 'ios' ? 20 : 0,
    borderTopLeftRadius: theme.radius.lg,
    borderTopRightRadius: theme.radius.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.lightGrey,
  },
  doneText: {
    color: theme.colors.primaryEco,
    fontWeight: 'bold',
    fontSize: 16,
  },
});
