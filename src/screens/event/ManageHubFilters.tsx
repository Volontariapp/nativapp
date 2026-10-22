import React from 'react';
import { View, StyleSheet, Pressable, ScrollView } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { AppText } from '@/components/typography/AppText';
import { useAppTheme, useStyles } from '@/context/ThemeContext';
import type { AppTheme } from '@/shared/themes/theme';
import type { EventTypeFilter, ManageTabType, ParticipatedScope } from './manage-hub.utils';

interface ManageHubFiltersProps {
  activeTab: ManageTabType;
  onTabChange: (tab: ManageTabType) => void;
  participatedCount: number;
  wishedCount: number;
  myEventsCount: number;
  participatedScope: ParticipatedScope;
  onScopeChange: (scope: ParticipatedScope) => void;
  liveCount: number;
  upcomingCount: number;
  typeFilter: EventTypeFilter;
  onTypeFilterChange: (filter: EventTypeFilter) => void;
}

const TABS: { key: ManageTabType; label: string; icon: string }[] = [
  { key: 'participated', label: 'En cours', icon: 'activity' },
  { key: 'wished', label: 'Wishlist', icon: 'heart' },
  { key: 'created', label: 'Créés', icon: 'layers' },
];

interface TabButtonProps {
  label: string;
  icon: string;
  count: number;
  selected: boolean;
  styles: ReturnType<typeof createStyles>;
  onPress: () => void;
}

function TabButton({
  label,
  icon,
  count,
  selected,
  styles,
  onPress,
}: TabButtonProps): React.JSX.Element {
  const { theme } = useAppTheme();
  return (
    <Pressable
      style={[styles.tabButton, selected && styles.tabButtonActive]}
      onPress={onPress}
      accessibilityRole="tab"
      accessibilityState={{ selected }}
      accessibilityLabel={`${label}, ${String(count)} événements`}
    >
      <Feather name={icon} size={15} color={selected ? theme.colors.white : theme.colors.grey} />
      <AppText style={[styles.tabText, selected && styles.tabTextActive]}>{label}</AppText>
      <View
        style={[styles.countBadge, selected ? styles.countBadgeActive : styles.countBadgeInactive]}
      >
        <AppText style={[styles.countBadgeText, selected && styles.countBadgeTextActive]}>
          {String(count)}
        </AppText>
      </View>
    </Pressable>
  );
}

interface ScopeFiltersProps {
  participatedScope: ParticipatedScope;
  onScopeChange: (scope: ParticipatedScope) => void;
  participatedCount: number;
  liveCount: number;
  upcomingCount: number;
  styles: ReturnType<typeof createStyles>;
}

/** Sous-filtres spécifiques à "En cours" (En direct vs À venir). */
function ScopeFilters({
  participatedScope,
  onScopeChange,
  participatedCount,
  liveCount,
  upcomingCount,
  styles,
}: ScopeFiltersProps): React.JSX.Element {
  const { theme } = useAppTheme();
  return (
    <View style={styles.subFilterRow}>
      <Pressable
        style={[styles.subFilterChip, participatedScope === 'all' && styles.subFilterChipActive]}
        onPress={() => {
          onScopeChange('all');
        }}
      >
        <AppText
          style={[styles.subFilterText, participatedScope === 'all' && styles.subFilterTextActive]}
        >
          Toutes ({String(participatedCount)})
        </AppText>
      </Pressable>

      <Pressable
        style={[
          styles.subFilterChip,
          participatedScope === 'live' && styles.subFilterChipLiveActive,
        ]}
        onPress={() => {
          onScopeChange('live');
        }}
      >
        <View style={[styles.liveDot, participatedScope === 'live' && styles.liveDotActive]} />
        <AppText
          style={[styles.subFilterText, participatedScope === 'live' && styles.subFilterTextActive]}
        >
          En direct ({String(liveCount)})
        </AppText>
      </Pressable>

      <Pressable
        style={[
          styles.subFilterChip,
          participatedScope === 'upcoming' && styles.subFilterChipActive,
        ]}
        onPress={() => {
          onScopeChange('upcoming');
        }}
      >
        <Feather
          name="clock"
          size={12}
          color={participatedScope === 'upcoming' ? theme.colors.white : theme.colors.grey}
        />
        <AppText
          style={[
            styles.subFilterText,
            participatedScope === 'upcoming' && styles.subFilterTextActive,
          ]}
        >
          À venir ({String(upcomingCount)})
        </AppText>
      </Pressable>
    </View>
  );
}

interface TypeFiltersProps {
  typeFilter: EventTypeFilter;
  onTypeFilterChange: (filter: EventTypeFilter) => void;
  styles: ReturnType<typeof createStyles>;
}

/** Filtres par type (Tous / Écologie / Social). */
function TypeFilters({
  typeFilter,
  onTypeFilterChange,
  styles,
}: TypeFiltersProps): React.JSX.Element {
  const { theme } = useAppTheme();
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.filterScrollContainer}
      style={styles.filterScrollView}
    >
      {/* Filtre Type : Tous */}
      <Pressable
        style={[styles.filterPill, typeFilter === 'all' && styles.filterPillActive]}
        onPress={() => {
          onTypeFilterChange('all');
        }}
      >
        <AppText
          style={[styles.filterPillText, typeFilter === 'all' && styles.filterPillTextActive]}
        >
          Tous
        </AppText>
      </Pressable>

      {/* Filtre Type : Écologie */}
      <Pressable
        style={[styles.filterPill, typeFilter === 'ecology' && styles.filterPillEcoActive]}
        onPress={() => {
          onTypeFilterChange(typeFilter === 'ecology' ? 'all' : 'ecology');
        }}
      >
        <Feather
          name="feather"
          size={12}
          color={typeFilter === 'ecology' ? theme.colors.white : theme.colors.primaryEco}
        />
        <AppText
          style={[styles.filterPillText, typeFilter === 'ecology' && styles.filterPillTextActive]}
        >
          Écologie
        </AppText>
      </Pressable>

      {/* Filtre Type : Social */}
      <Pressable
        style={[styles.filterPill, typeFilter === 'social' && styles.filterPillSocioActive]}
        onPress={() => {
          onTypeFilterChange(typeFilter === 'social' ? 'all' : 'social');
        }}
      >
        <Feather
          name="users"
          size={12}
          color={typeFilter === 'social' ? theme.colors.white : theme.colors.primarySocio}
        />
        <AppText
          style={[styles.filterPillText, typeFilter === 'social' && styles.filterPillTextActive]}
        >
          Social
        </AppText>
      </Pressable>
    </ScrollView>
  );
}

/** Onglets (En cours / Wishlist / Créés), sous-filtres de période et filtres par type. */
export function ManageHubFilters({
  activeTab,
  onTabChange,
  participatedCount,
  wishedCount,
  myEventsCount,
  participatedScope,
  onScopeChange,
  liveCount,
  upcomingCount,
  typeFilter,
  onTypeFilterChange,
}: ManageHubFiltersProps): React.JSX.Element {
  const styles = useStyles(createStyles);
  const counts: Record<ManageTabType, number> = {
    participated: participatedCount,
    wished: wishedCount,
    created: myEventsCount,
  };

  return (
    <>
      {/* Barre de navigation d'onglets (Segmented Control) */}
      <View style={styles.tabBarContainer}>
        {TABS.map((tab) => (
          <TabButton
            key={tab.key}
            label={tab.label}
            icon={tab.icon}
            count={counts[tab.key]}
            selected={activeTab === tab.key}
            styles={styles}
            onPress={() => {
              onTabChange(tab.key);
            }}
          />
        ))}
      </View>

      {activeTab === 'participated' && (
        <ScopeFilters
          participatedScope={participatedScope}
          onScopeChange={onScopeChange}
          participatedCount={participatedCount}
          liveCount={liveCount}
          upcomingCount={upcomingCount}
          styles={styles}
        />
      )}

      <TypeFilters
        typeFilter={typeFilter}
        onTypeFilterChange={onTypeFilterChange}
        styles={styles}
      />
    </>
  );
}

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    tabBarContainer: {
      flexDirection: 'row',
      borderRadius: 16,
      padding: 4,
      backgroundColor:
        theme.colors.text === '#000' ? 'rgba(0, 0, 0, 0.05)' : 'rgba(255, 255, 255, 0.08)',
      marginBottom: 10,
    },
    tabButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 10,
      paddingHorizontal: 6,
      borderRadius: 12,
      gap: 6,
    },
    tabButtonActive: {
      backgroundColor: theme.colors.primaryEco,
      boxShadow: '0 4px 10px rgba(47, 110, 62, 0.3)',
    },
    tabText: {
      fontSize: 13,
      fontWeight: '600',
      color: theme.colors.grey,
    },
    tabTextActive: {
      color: theme.colors.white,
      fontWeight: '700',
    },
    countBadge: {
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 10,
    },
    countBadgeInactive: {
      backgroundColor:
        theme.colors.text === '#000' ? 'rgba(0, 0, 0, 0.06)' : 'rgba(255, 255, 255, 0.1)',
    },
    countBadgeActive: {
      backgroundColor: 'rgba(255, 255, 255, 0.25)',
    },
    countBadgeText: {
      fontSize: 11,
      fontWeight: '700',
      color: theme.colors.grey,
    },
    countBadgeTextActive: {
      color: theme.colors.white,
    },
    subFilterRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginBottom: 10,
    },
    subFilterChip: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 5,
      paddingVertical: 7,
      paddingHorizontal: 8,
      borderRadius: 10,
      backgroundColor:
        theme.colors.text === '#000' ? 'rgba(0, 0, 0, 0.04)' : 'rgba(255, 255, 255, 0.06)',
      borderWidth: 1,
      borderColor:
        theme.colors.text === '#000' ? 'rgba(0, 0, 0, 0.06)' : 'rgba(255, 255, 255, 0.08)',
    },
    subFilterChipActive: {
      backgroundColor: theme.colors.primaryEco,
      borderColor: theme.colors.primaryEco,
    },
    subFilterChipLiveActive: {
      backgroundColor: theme.colors.danger,
      borderColor: theme.colors.danger,
    },
    subFilterText: {
      fontSize: 12,
      fontWeight: '600',
      color: theme.colors.grey,
    },
    subFilterTextActive: {
      color: theme.colors.white,
      fontWeight: '700',
    },
    liveDot: {
      width: 7,
      height: 7,
      borderRadius: 4,
      backgroundColor: theme.colors.danger,
    },
    liveDotActive: {
      backgroundColor: theme.colors.white,
    },
    filterScrollView: {
      marginBottom: 4,
    },
    filterScrollContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      paddingVertical: 4,
    },
    filterPill: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      paddingVertical: 6,
      paddingHorizontal: 12,
      borderRadius: 14,
      backgroundColor:
        theme.colors.text === '#000' ? 'rgba(0, 0, 0, 0.04)' : 'rgba(255, 255, 255, 0.06)',
      borderWidth: 1,
      borderColor:
        theme.colors.text === '#000' ? 'rgba(0, 0, 0, 0.06)' : 'rgba(255, 255, 255, 0.08)',
    },
    filterPillActive: {
      backgroundColor:
        theme.colors.text === '#000' ? 'rgba(0, 0, 0, 0.12)' : 'rgba(255, 255, 255, 0.18)',
      borderColor: theme.colors.text,
    },
    filterPillEcoActive: {
      backgroundColor: theme.colors.primaryEco,
      borderColor: theme.colors.primaryEco,
    },
    filterPillSocioActive: {
      backgroundColor: theme.colors.primarySocio,
      borderColor: theme.colors.primarySocio,
    },
    filterPillText: {
      fontSize: 12,
      fontWeight: '600',
      color: theme.colors.grey,
    },
    filterPillTextActive: {
      color: theme.colors.white,
      fontWeight: '700',
    },
  });
