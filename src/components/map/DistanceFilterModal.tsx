import React, { useState } from 'react';
import { View, StyleSheet, Modal, Pressable } from 'react-native';
import { AppText } from '@/components/typography/AppText';
import { AppSlider } from '@/components/inputs/AppSlider';
import { AppButton } from '@/components/buttons/AppButton';
import { AppIconsButton } from '@/components/buttons/AppIconsButton';
import { AppBadgeButton } from '@/components/buttons/AppBadgeButton';
import { useAppTheme, useStyles } from '@/context/ThemeContext';
import type { AppTheme } from '@/shared/themes/theme';

export interface DistanceFilterModalProps {
  visible: boolean;
  onClose: () => void;
  distanceKm: number | null;
  onApply: (distance: number | null) => void;
}

const PRESET_DISTANCES = [5, 10, 20, 50];

interface DistanceFilterContentProps {
  distanceKm: number | null;
  onClose: () => void;
  onApply: (distance: number | null) => void;
}

function DistanceFilterContent({
  distanceKm,
  onClose,
  onApply,
}: DistanceFilterContentProps): React.JSX.Element {
  const { theme } = useAppTheme();
  const styles = useStyles(createStyles);
  const [tempDistance, setTempDistance] = useState<number>(distanceKm ?? 5);
  const [isUnlimited, setIsUnlimited] = useState<boolean>(distanceKm === null);

  const handleSelectPreset = (dist: number): void => {
    setIsUnlimited(false);
    setTempDistance(dist);
  };

  const handleSelectUnlimited = (): void => {
    setIsUnlimited(true);
  };

  const handleSliderChange = (val: number): void => {
    setIsUnlimited(false);
    setTempDistance(val);
  };

  const handleConfirm = (): void => {
    onApply(isUnlimited ? null : tempDistance);
    onClose();
  };

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
          <AppText style={styles.title}>Rayon de recherche</AppText>
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
            {isUnlimited ? 'Toutes les distances' : `${String(tempDistance)} km`}
          </AppText>
          <AppText style={styles.subText}>
            {isUnlimited
              ? 'Afficher les initiatives partout'
              : `Autour de votre position actuelle (${String(tempDistance)} km max)`}
          </AppText>
        </View>

        {/* Slider */}
        <View style={styles.sliderContainer}>
          <AppSlider
            value={tempDistance}
            minimumValue={1}
            maximumValue={50}
            step={1}
            disabled={isUnlimited}
            onValueChange={handleSliderChange}
          />
          <View style={styles.sliderLabels}>
            <AppText style={styles.sliderLabel}>1 km</AppText>
            <AppText style={styles.sliderLabel}>50 km</AppText>
          </View>
        </View>

        {/* Presets */}
        <View style={styles.presetsRow}>
          {PRESET_DISTANCES.map((preset) => (
            <AppBadgeButton
              key={preset}
              label={`${String(preset)} km`}
              variant="eco"
              selected={!isUnlimited && tempDistance === preset}
              onPress={() => {
                handleSelectPreset(preset);
              }}
            />
          ))}
          <AppBadgeButton
            label="Illimité"
            variant="all"
            selected={isUnlimited}
            onPress={handleSelectUnlimited}
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

export function DistanceFilterModal({
  visible,
  onClose,
  distanceKm,
  onApply,
}: DistanceFilterModalProps): React.JSX.Element {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      {visible && (
        <DistanceFilterContent
          key={String(distanceKm)}
          distanceKm={distanceKm}
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
      fontSize: 28,
      fontWeight: '700',
      color: theme.colors.primaryEco,
    },
    subText: {
      fontSize: 12,
      color: theme.colors.grey,
      marginTop: 4,
      textAlign: 'center',
    },
    sliderContainer: {
      width: '100%',
      paddingHorizontal: 4,
    },
    sliderLabels: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 2,
    },
    sliderLabel: {
      fontSize: 11,
      color: theme.colors.grey,
    },
    presetsRow: {
      flexDirection: 'row',
      justifyContent: 'center',
      gap: 8,
      flexWrap: 'wrap',
    },
    actionContainer: {
      marginTop: theme.spacing.xs,
    },
  });
