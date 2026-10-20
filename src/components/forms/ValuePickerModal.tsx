import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  StyleSheet,
  Pressable,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme, useStyles } from '@/context/ThemeContext';
import type { AppTheme } from '@/shared/themes/theme';
import { AppText } from '@/components/typography/AppText';
import { AppIcons } from '@/components/media/AppIcons';
import { AppButton } from '@/components/buttons/AppButton';
import type { ButtonVariant } from '@/shared/types/components';

export interface ValuePickerPreset {
  value: number;
  label: string;
  sublabel?: string;
}

export interface ValuePickerPreviewDetails {
  label: string;
  value: string;
  hint?: string;
}

export interface ValuePickerModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  subtitle: string;
  currentValue: number;
  presets: ValuePickerPreset[];
  onConfirm: (value: number) => void;
  // Option Personnalisée
  customOptionLabel?: string;
  customOptionSublabel?: string;
  customInputLabel?: string;
  customUnit?: string;
  customPlaceholder?: string;
  minValue?: number;
  maxValue?: number;
  allowDecimals?: boolean;
  // Aperçu personnalisé
  previewTitle?: string;
  previewIcon?: string;
  renderPreview?: (currentVal: number) => React.ReactNode;
  formatPreviewDetails?: (currentVal: number) => ValuePickerPreviewDetails;
  // Bouton et thème
  confirmButtonText?: string;
  variant?: ButtonVariant;
}

export function ValuePickerModal({
  visible,
  onClose,
  title,
  subtitle,
  currentValue,
  presets,
  onConfirm,
  customOptionLabel = 'Autre',
  customOptionSublabel = 'Personnalisé',
  customInputLabel = 'Entrez une valeur personnalisée :',
  customUnit,
  customPlaceholder = 'Ex: 10',
  minValue = 1,
  maxValue = 10000,
  allowDecimals = false,
  previewTitle = 'Récapitulatif',
  previewIcon = 'check-circle',
  renderPreview,
  formatPreviewDetails,
  confirmButtonText = 'Valider',
  variant = 'eco',
}: ValuePickerModalProps): React.JSX.Element {
  const insets = useSafeAreaInsets();
  const { theme } = useAppTheme();
  const styles = useStyles(createStyles);

  const [selectedValue, setSelectedValue] = useState<number>(currentValue);
  const [isCustomMode, setIsCustomMode] = useState<boolean>(false);
  const [customInputText, setCustomInputText] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const isSocio = variant === 'socio';
  const accentColor = isSocio ? theme.colors.primarySocio : theme.colors.primaryEco;
  const selectedBgColor = isSocio ? '#eff6ff' : '#f0fdf4';
  const iconBgColor = isSocio ? '#e6f0f3' : '#eef3ef';

  // Synchronisation à l'ouverture de la modale
  useEffect(() => {
    if (visible) {
      setSelectedValue(currentValue);
      const isPreset = presets.some((p) => p.value === currentValue);
      if (!isPreset && currentValue > 0) {
        setIsCustomMode(true);
        setCustomInputText(String(currentValue));
      } else {
        setIsCustomMode(false);
        setCustomInputText('');
      }
      setErrorMessage('');
    }
  }, [visible, currentValue, presets]);

  const handleSelectPreset = (val: number) => {
    setSelectedValue(val);
    setIsCustomMode(false);
    setCustomInputText('');
    setErrorMessage('');
  };

  const handleEnableCustom = () => {
    setIsCustomMode(true);
    if (customInputText.trim().length === 0) {
      const fallback = selectedValue > 0 ? selectedValue : (presets[0]?.value ?? 1);
      setCustomInputText(String(fallback));
    }
  };

  const handleCustomInputChange = (text: string) => {
    setCustomInputText(text);

    const cleanText = allowDecimals ? text.replace(',', '.') : text.replace(/[^0-9]/g, '');

    const parsed = allowDecimals ? parseFloat(cleanText) : parseInt(cleanText, 10);

    if (Number.isNaN(parsed) || parsed < minValue) {
      setErrorMessage(`Veuillez entrer une valeur supérieure ou égale à ${String(minValue)}`);
    } else if (parsed > maxValue) {
      setErrorMessage(`La valeur maximale autorisée est de ${String(maxValue)}`);
    } else {
      setErrorMessage('');
      setSelectedValue(parsed);
    }
  };

  const handleValidate = () => {
    let finalValue = selectedValue;

    if (isCustomMode) {
      const cleanText = allowDecimals
        ? customInputText.replace(',', '.')
        : customInputText.replace(/[^0-9]/g, '');
      const parsed = allowDecimals ? parseFloat(cleanText) : parseInt(cleanText, 10);

      if (Number.isNaN(parsed) || parsed < minValue) {
        setErrorMessage(`Veuillez entrer une valeur valide (min: ${String(minValue)})`);
        return;
      }
      if (parsed > maxValue) {
        setErrorMessage(`La valeur maximale autorisée est de ${String(maxValue)}`);
        return;
      }
      finalValue = parsed;
    }

    if (finalValue < minValue) {
      setErrorMessage(`La valeur doit être au moins de ${String(minValue)}`);
      return;
    }

    onConfirm(finalValue);
    onClose();
  };

  const effectivePreviewValue = isCustomMode
    ? (allowDecimals
        ? parseFloat(customInputText.replace(',', '.'))
        : parseInt(customInputText.replace(/[^0-9]/g, ''), 10)) || selectedValue
    : selectedValue;

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={[styles.container, { paddingTop: insets.top }]}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={onClose} style={styles.closeButton} hitSlop={12}>
            <AppIcons icon="x" size={24} color={theme.colors.text} />
          </Pressable>
          <View style={styles.headerTitleContainer}>
            <AppText style={styles.headerTitle}>{title}</AppText>
            <AppText style={styles.headerSubtitle}>{subtitle}</AppText>
          </View>
          <View style={styles.headerRightSpacer} />
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 24 }]}
          keyboardShouldPersistTaps="handled"
        >
          {/* Options prédéfinies */}
          <AppText style={styles.sectionLabel}>Choix rapides :</AppText>
          <View style={styles.presetsGrid}>
            {presets.map((preset) => {
              const isSelected = !isCustomMode && selectedValue === preset.value;
              return (
                <Pressable
                  key={preset.value}
                  onPress={() => {
                    handleSelectPreset(preset.value);
                  }}
                  style={({ pressed }) => [
                    styles.presetCard,
                    isSelected && {
                      borderColor: accentColor,
                      backgroundColor: selectedBgColor,
                    },
                    pressed && { opacity: 0.8 },
                  ]}
                >
                  <AppText
                    style={[
                      styles.presetLabel,
                      isSelected && { color: accentColor, fontWeight: 'bold' },
                    ]}
                  >
                    {preset.label}
                  </AppText>
                  {preset.sublabel !== undefined && preset.sublabel.length > 0 && (
                    <AppText style={[styles.presetSublabel, isSelected && { color: accentColor }]}>
                      {preset.sublabel}
                    </AppText>
                  )}
                </Pressable>
              );
            })}

            {/* Option Autre / Personnalisé */}
            <Pressable
              onPress={handleEnableCustom}
              style={({ pressed }) => [
                styles.presetCard,
                isCustomMode && {
                  borderColor: accentColor,
                  backgroundColor: selectedBgColor,
                },
                pressed && { opacity: 0.8 },
              ]}
            >
              <AppText
                style={[
                  styles.presetLabel,
                  isCustomMode && { color: accentColor, fontWeight: 'bold' },
                ]}
              >
                {customOptionLabel}
              </AppText>
              <AppText style={[styles.presetSublabel, isCustomMode && { color: accentColor }]}>
                {customOptionSublabel}
              </AppText>
            </Pressable>
          </View>

          {/* Saisie personnalisée si mode Autre */}
          {isCustomMode && (
            <View style={[styles.customContainer, { borderColor: accentColor }]}>
              <AppText style={styles.customLabel}>{customInputLabel}</AppText>
              <View style={styles.customInputRow}>
                <TextInput
                  style={styles.customInput}
                  value={customInputText}
                  onChangeText={handleCustomInputChange}
                  keyboardType={allowDecimals ? 'decimal-pad' : 'number-pad'}
                  placeholder={customPlaceholder}
                  placeholderTextColor={theme.colors.grey}
                  autoFocus
                />
                {customUnit !== undefined && customUnit.length > 0 && (
                  <AppText style={styles.customUnitText}>{customUnit}</AppText>
                )}
              </View>
              {errorMessage.length > 0 && (
                <AppText style={styles.errorText}>{errorMessage}</AppText>
              )}
            </View>
          )}

          {/* Aperçu / Récapitulatif */}
          <View style={styles.previewCard}>
            <View style={styles.previewHeader}>
              <View style={[styles.previewIconBox, { backgroundColor: iconBgColor }]}>
                <AppIcons icon={previewIcon} size={20} color={accentColor} />
              </View>
              <AppText style={styles.previewTitle}>{previewTitle}</AppText>
            </View>

            {renderPreview !== undefined ? (
              renderPreview(effectivePreviewValue)
            ) : formatPreviewDetails !== undefined ? (
              (() => {
                const details = formatPreviewDetails(effectivePreviewValue);
                return (
                  <View style={styles.previewDetailsContainer}>
                    <AppText style={styles.previewDetailsLabel}>{details.label}</AppText>
                    <AppText style={[styles.previewDetailsValue, { color: accentColor }]}>
                      {details.value}
                    </AppText>
                    {details.hint !== undefined && details.hint.length > 0 && (
                      <AppText style={styles.previewDetailsHint}>{details.hint}</AppText>
                    )}
                  </View>
                );
              })()
            ) : (
              <View style={styles.previewDetailsContainer}>
                <AppText style={styles.previewDetailsLabel}>VALEUR SÉLECTIONNÉE :</AppText>
                <AppText style={[styles.previewDetailsValue, { color: accentColor }]}>
                  {String(effectivePreviewValue)} {customUnit ?? ''}
                </AppText>
              </View>
            )}
          </View>

          {/* Bouton de confirmation */}
          <AppButton
            text={confirmButtonText}
            variant={variant}
            icon="check"
            onPress={handleValidate}
            style={styles.confirmButton}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.lightGrey,
      backgroundColor: theme.colors.background,
      zIndex: 10,
    },
    closeButton: {
      padding: theme.spacing.xs,
    },
    headerTitleContainer: {
      alignItems: 'center',
    },
    headerTitle: {
      fontSize: 17,
      fontWeight: 'bold',
      color: theme.colors.text,
    },
    headerSubtitle: {
      fontSize: 12,
      color: theme.colors.grey,
      marginTop: 2,
    },
    headerRightSpacer: {
      width: 32,
    },
    scroll: {
      flex: 1,
    },
    scrollContent: {
      padding: theme.spacing.lg,
    },
    sectionLabel: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: theme.spacing.sm,
    },
    presetsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.spacing.sm,
      marginBottom: theme.spacing.lg,
    },
    presetCard: {
      flexBasis: '48%',
      flexGrow: 1,
      backgroundColor: theme.colors.white,
      borderWidth: 1.5,
      borderColor: theme.colors.lightGrey,
      borderRadius: theme.radius.md,
      paddingVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.sm,
      alignItems: 'center',
      justifyContent: 'center',
    },
    presetLabel: {
      fontSize: 15,
      fontWeight: '600',
      color: theme.colors.text,
    },
    presetSublabel: {
      fontSize: 12,
      color: theme.colors.grey,
      marginTop: 3,
    },
    customContainer: {
      backgroundColor: theme.colors.white,
      borderRadius: theme.radius.md,
      padding: theme.spacing.md,
      borderWidth: 1.5,
      marginBottom: theme.spacing.lg,
    },
    customLabel: {
      fontSize: 13,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: theme.spacing.xs,
    },
    customInputRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    customInput: {
      flex: 1,
      borderWidth: 1,
      borderColor: theme.colors.lightGrey,
      borderRadius: theme.radius.sm,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      fontSize: 18,
      fontWeight: 'bold',
      color: theme.colors.text,
      backgroundColor: '#fbfbfb',
    },
    customUnitText: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.grey,
      marginLeft: theme.spacing.sm,
    },
    errorText: {
      color: theme.colors.danger,
      fontSize: 12,
      marginTop: 6,
    },
    previewCard: {
      backgroundColor: theme.colors.white,
      borderRadius: theme.radius.md,
      padding: theme.spacing.md,
      borderWidth: 1,
      borderColor: theme.colors.lightGrey,
      marginBottom: theme.spacing.xl,
    },
    previewHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: theme.spacing.md,
    },
    previewIconBox: {
      width: 32,
      height: 32,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: theme.spacing.xs,
    },
    previewTitle: {
      fontSize: 14,
      fontWeight: '700',
      color: theme.colors.text,
    },
    previewDetailsContainer: {
      gap: 4,
    },
    previewDetailsLabel: {
      fontSize: 11,
      fontWeight: '600',
      color: theme.colors.grey,
      letterSpacing: 0.5,
    },
    previewDetailsValue: {
      fontSize: 16,
      fontWeight: 'bold',
    },
    previewDetailsHint: {
      fontSize: 12,
      color: theme.colors.grey,
      fontStyle: 'italic',
      marginTop: 2,
    },
    confirmButton: {
      width: '100%',
    },
  });
