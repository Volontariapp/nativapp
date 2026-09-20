import React, { useState, useMemo } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import { View, StyleSheet, Platform, LayoutAnimation } from 'react-native';
import { AppBadgeButton } from '@/components/buttons/AppBadgeButton';
import { AppIconsButton } from '@/components/buttons/AppIconsButton';
import { AppPillInput } from '@/components/inputs/AppPillInput';
import { useAppTheme, useStyles } from '@/context/ThemeContext';
import type { AppTheme } from '@/shared/themes/theme';
import { DistanceFilterModal } from './DistanceFilterModal';
import { DateFilterModal } from './DateFilterModal';

export type EventCategoryFilter = 'ALL' | 'ECOLOGY' | 'SOCIAL';

export interface MapFilterBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedCategory: EventCategoryFilter;
  onCategoryChange: (category: EventCategoryFilter) => void;
  distanceKm?: number | null;
  onDistanceChange?: (distance: number | null) => void;
  dateFilter?: string | null;
  onDateChange?: (date: string | null) => void;
  isOpen?: boolean;
  onToggleOpen?: (isOpen: boolean) => void;
  defaultOpen?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function MapFilterBar({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  distanceKm = 5,
  onDistanceChange,
  dateFilter = null,
  onDateChange,
  isOpen,
  onToggleOpen,
  defaultOpen = false,
  style,
}: MapFilterBarProps): React.JSX.Element {
  const { theme } = useAppTheme();
  const styles = useStyles(createStyles);
  const [internalIsOpen, setInternalIsOpen] = useState(defaultOpen);
  const [isDistanceModalVisible, setIsDistanceModalVisible] = useState(false);
  const [isDateModalVisible, setIsDateModalVisible] = useState(false);

  const resolvedIsOpen = isOpen ?? internalIsOpen;

  const handleToggle = (open: boolean): void => {
    if (Platform.OS !== 'web') {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    }
    setInternalIsOpen(open);
    onToggleOpen?.(open);
  };

  const handleDistancePress = (): void => {
    setIsDistanceModalVisible(true);
  };

  const handleDatePress = (): void => {
    setIsDateModalVisible(true);
  };

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (selectedCategory !== 'ALL') {
      count += 1;
    }
    if (searchQuery.trim().length > 0) {
      count += 1;
    }
    if (distanceKm !== null) {
      count += 1;
    }
    if (dateFilter !== null) {
      count += 1;
    }
    return count;
  }, [selectedCategory, searchQuery, distanceKm, dateFilter]);

  const distanceLabel =
    distanceKm === null ? 'Distance: Tout' : `Distance: ${String(distanceKm)} km`;

  const formatDateLabel = (date: string | null | undefined): string => {
    if (date == null || date.length === 0) return 'Date: Toutes';
    const parts = date.split('-');
    if (parts.length === 3 && parts[0] != null && parts[1] != null && parts[2] != null) {
      const shortYear = parts[0].slice(-2);
      return `Date: ${parts[2]}/${parts[1]}/${shortYear}`;
    }
    return `Date: ${date}`;
  };

  const collapsedLabel =
    activeFiltersCount > 0
      ? `Filtres (${String(activeFiltersCount)})`
      : 'Filtres';

  return (
    <>
      {resolvedIsOpen ? (
        <View style={[styles.container, style]}>
          {/* Top row: Category badge buttons + Collapse button */}
          <View style={styles.topRow}>
            {/* Middle row: Pill search input */}
            <AppPillInput
              value={searchQuery}
              onChangeText={onSearchChange}
              placeholder="Rechercher une initiative..."
              style={styles.searchBar}
            />
            <View style={styles.collapseButtonWrapper}>
              <AppIconsButton
                icon="chevron-up"
                size={30}
                variant="white"
                iconColor={theme.colors.text}
                onPress={() => {
                  handleToggle(false);
                }}
                accessibilityLabel="Masquer les filtres"
              />
            </View>
          </View>



          <View style={styles.categoriesRow}>
            <AppBadgeButton
              label="Tout"
              variant="all"
              selected={selectedCategory === 'ALL'}
              onPress={() => {
                onCategoryChange('ALL');
              }}
            />

            <AppBadgeButton
              label="Écologie"
              variant="eco"
              selected={selectedCategory === 'ECOLOGY'}
              onPress={() => {
                onCategoryChange('ECOLOGY');
              }}
            />

            <AppBadgeButton
              label="Social"
              variant="socio"
              selected={selectedCategory === 'SOCIAL'}
              onPress={() => {
                onCategoryChange('SOCIAL');
              }}
            />
          </View>

          {/* Bottom row: Distance and Date badge buttons */}
          <View style={styles.bottomRow}>
            <AppBadgeButton
              label={distanceLabel}
              variant="eco"
              bordered
              icon="navigation"
              onPress={handleDistancePress}
            />

            <AppBadgeButton
              label={formatDateLabel(dateFilter)}
              variant="eco"
              bordered
              icon="calendar"
              onPress={handleDatePress}
            />
          </View>
        </View>
      ) : (
        <View pointerEvents="box-none" style={[styles.collapsedWrapper, style]}>
          <AppBadgeButton
            label={collapsedLabel}
            variant='neutral'
            bordered
            selected={activeFiltersCount > 0}
            icon="sliders"
            onPress={() => {
              handleToggle(true);
            }}
            accessibilityLabel="Ouvrir les filtres"
          />
        </View>
      )}

      <DistanceFilterModal
        visible={isDistanceModalVisible}
        onClose={() => {
          setIsDistanceModalVisible(false);
        }}
        distanceKm={distanceKm ?? null}
        onApply={(dist) => {
          onDistanceChange?.(dist);
        }}
      />

      <DateFilterModal
        visible={isDateModalVisible}
        onClose={() => {
          setIsDateModalVisible(false);
        }}
        selectedDate={dateFilter ?? null}
        onApply={(date) => {
          onDateChange?.(date);
        }}
      />
    </>
  );
}

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      backgroundColor: theme.colors.background,
      borderRadius: 28,
      borderWidth: 1.2,
      borderColor: theme.colors.black,
      paddingVertical: 10,
      paddingHorizontal: 12,
      alignItems: 'center',
      shadowColor: theme.colors.black,
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.15,
      shadowRadius: 6,
      elevation: 5,
    },
    collapsedWrapper: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    topRow: {
      width: '100%',
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
      gap: 8,
    },
    searchBar: {
      flex: 1,
      width: 'auto',
    },
    collapseButtonWrapper: {
      flexShrink: 0,
      borderWidth: 1,
      borderColor: theme.colors.black,
      borderRadius: theme.radius.full,
      overflow: 'hidden',
    },
    categoriesRow: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      gap: 8,
      marginBottom: 8,
    },
    bottomRow: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      gap: 12,
    },
  });
