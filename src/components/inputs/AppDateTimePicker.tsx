import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { View, StyleSheet, Pressable, Platform, Modal, type ViewStyle } from 'react-native';
import RNDateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import Icon from 'react-native-vector-icons/Feather';

import { AppText } from '@/components/typography/AppText';
import { theme } from '@/shared/themes/theme';

export interface AppDateTimePickerProps {
  value: Date;
  onChange: (date: Date) => void;
  label?: string;
  mode?: 'date' | 'time' | 'datetime';
  inputStyle?: ViewStyle | ViewStyle[];
  hideIcon?: boolean;
}

export const AppDateTimePicker = React.memo(function AppDateTimePicker({
  value,
  onChange,
  label,
  mode = 'datetime',
  inputStyle,
  hideIcon = false,
}: AppDateTimePickerProps): React.JSX.Element {
  const [showPicker, setShowPicker] = useState(false);
  const [pickerMode, setPickerMode] = useState<'date' | 'time' | 'datetime'>(
    mode === 'datetime' ? 'date' : mode,
  );
  const webInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (showPicker && Platform.OS === 'web' && webInputRef.current) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        (webInputRef.current as HTMLInputElement & { showPicker?: () => void }).showPicker?.();
      } catch {
        webInputRef.current.click();
      }
    }
  }, [showPicker]);

  const handlePress = useCallback(() => {
    if (mode === 'datetime') {
      setPickerMode(Platform.OS === 'ios' ? 'datetime' : 'date');
    }
    setShowPicker(true);
  }, [mode]);

  const handleChange = useCallback(
    (_event: DateTimePickerEvent, selectedDate?: Date) => {
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
    },
    [mode, pickerMode, onChange],
  );

  const closePicker = useCallback(() => {
    setShowPicker(false);
  }, []);

  const handleWebChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newDate = new Date(e.target.value);
      if (!isNaN(newDate.getTime())) {
        onChange(newDate);
      }
      setShowPicker(false);
    },
    [onChange],
  );

  // Mémoïsation du formatage pour ne pas recalculer à chaque interaction UI
  const displayFormat = useMemo(() => {
    if (mode === 'date') return value.toLocaleDateString('fr-FR');
    if (mode === 'time')
      return value.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    return value.toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }, [value, mode]);

  const webInputValue = useMemo(() => {
    if (mode === 'time') return value.toTimeString().slice(0, 5);
    if (mode === 'date') return value.toISOString().slice(0, 10);
    return value.toISOString().slice(0, 16);
  }, [value, mode]);

  const webAriaLabel =
    label ?? (mode === 'time' ? 'Heure' : mode === 'date' ? 'Date' : 'Date et heure');
  const webInputType = mode === 'time' ? 'time' : mode === 'date' ? 'date' : 'datetime-local';

  return (
    <View style={styles.container}>
      {label !== undefined && label.trim() !== '' ? (
        <AppText style={styles.label}>{label}</AppText>
      ) : null}

      <Pressable
        style={({ pressed }) => [styles.inputWrapper, inputStyle, pressed && styles.pressed]}
        onPress={handlePress}
        accessibilityRole="button"
        accessibilityLabel={`Ouvrir le sélecteur de ${webAriaLabel}`}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        {!hideIcon && (
          <Icon
            name={mode === 'time' ? 'clock' : 'calendar'}
            size={theme.typography.fontSize.md}
            color={theme.colors.grey}
          />
        )}
        <AppText style={[styles.dateText, hideIcon && styles.noPadding]}>{displayFormat}</AppText>
      </Pressable>

      {Platform.OS === 'web' ? (
        showPicker && (
          <input
            ref={webInputRef}
            aria-label={webAriaLabel}
            type={webInputType}
            value={webInputValue}
            onChange={handleWebChange}
            style={{ position: 'absolute', opacity: 0, width: '100%', height: '100%' }}
            onBlur={closePicker}
          />
        )
      ) : Platform.OS === 'ios' ? (
        <Modal visible={showPicker} transparent={true} animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Pressable
                  style={({ pressed }) => [pressed && styles.pressed]}
                  onPress={closePicker}
                  accessibilityRole="button"
                  accessibilityLabel="Valider la sélection"
                  hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
                >
                  <AppText style={styles.doneText}>Valider</AppText>
                </Pressable>
              </View>
              <RNDateTimePicker
                value={value}
                mode={pickerMode}
                locale="fr-FR"
                display="spinner"
                themeVariant="light"
                textColor={theme.colors.black}
                style={styles.iosPicker}
                onChange={handleChange}
              />
            </View>
          </View>
        </Modal>
      ) : (
        showPicker && (
          <RNDateTimePicker
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
});

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  label: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.grey,
    marginBottom: theme.spacing.xs,
    fontWeight: theme.typography.fontWeight.semibold,
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
    minHeight: 48,
  },
  pressed: {
    opacity: 0.7,
  },
  dateText: {
    flex: 1,
    paddingLeft: theme.spacing.sm,
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.black,
  },
  noPadding: {
    paddingLeft: 0,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: theme.colors.blackOverlay,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: theme.colors.white,
    paddingBottom: Platform.OS === 'ios' ? theme.spacing.xl : 0,
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
    fontWeight: theme.typography.fontWeight.bold,
    fontSize: theme.typography.fontSize.md,
  },
  iosPicker: {
    height: 216,
    width: '100%',
  },
});
