import React from 'react';
import { View, StyleSheet } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import type { CalendarProps, DateData } from 'react-native-calendars';
import { AppText } from '@/components/typography/AppText';
import { AppButton } from '@/components/buttons/AppButton';
import { AppCalendar } from '@/components/ui/AppCalendar';
import { useAppTheme, useStyles } from '@/context/ThemeContext';
import type { AppTheme } from '@/shared/themes/theme';
import type { ManageTabType } from './manage-hub.utils';

interface ManageHubEmptyStateProps {
  activeTab: ManageTabType;
  markedDates: CalendarProps['markedDates'];
  onDayPress: (day: DateData) => void;
  onExplorePress: () => void;
  onCreatePress: () => void;
}

/** État vide dédié à chaque onglet de la page de gestion. */
export function ManageHubEmptyState({
  activeTab,
  markedDates,
  onDayPress,
  onExplorePress,
  onCreatePress,
}: ManageHubEmptyStateProps): React.JSX.Element {
  const { theme } = useAppTheme();
  const styles = useStyles(createStyles);

  if (activeTab === 'participated') {
    return (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyBadgeHeader}>
          <Feather name="calendar" size={18} color={theme.colors.primaryEco} />
          <AppText style={styles.emptyBadgeTitle}>Mon Calendrier</AppText>
        </View>

        <AppText style={styles.emptyTitle}>Aucune mission en cours</AppText>
        <AppText style={styles.emptySubtitle}>
          Vous n'avez pas de mission active. Consultez votre calendrier ou trouvez votre prochain
          engagement :
        </AppText>

        {/* Calendrier interactif intégré dans l'état vide */}
        <View style={styles.calendarCard}>
          <AppCalendar
            markedDates={markedDates}
            onDayPress={onDayPress}
            style={styles.calendarStyle}
          />
        </View>

        <AppButton
          variant="eco"
          text="Explorer les événements"
          icon="compass"
          iconLibrary="Feather"
          onPress={onExplorePress}
          style={styles.emptyButton}
        />
      </View>
    );
  }

  if (activeTab === 'wished') {
    return (
      <View style={styles.emptyContainer}>
        <View style={[styles.emptyIconCircle, styles.emptyIconCircleSocio]}>
          <Feather name="heart" size={28} color={theme.colors.primarySocio} />
        </View>
        <AppText style={styles.emptyTitle}>Votre wishlist est vide</AppText>
        <AppText style={styles.emptySubtitle}>
          Enregistrez les initiatives qui vous inspirent depuis la carte pour les retrouver ici.
        </AppText>
        <AppButton
          variant="socio"
          text="Découvrir des missions"
          icon="map"
          iconLibrary="Feather"
          onPress={onExplorePress}
          style={styles.emptyButton}
        />
      </View>
    );
  }

  return (
    <View style={styles.emptyContainer}>
      <View style={[styles.emptyIconCircle, styles.emptyIconCircleEco]}>
        <Feather name="plus-circle" size={28} color={theme.colors.primaryEco} />
      </View>
      <AppText style={styles.emptyTitle}>Aucun événement créé</AppText>
      <AppText style={styles.emptySubtitle}>
        Passez à l'action en créant votre propre mission bénévole sur le terrain.
      </AppText>
      <AppButton
        variant="eco"
        text="Créer un événement"
        icon="plus"
        iconLibrary="Feather"
        onPress={onCreatePress}
        style={styles.emptyButton}
      />
    </View>
  );
}

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    emptyContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 16,
      paddingVertical: 24,
    },
    emptyBadgeHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
      backgroundColor:
        theme.colors.text === '#000' ? 'rgba(47, 110, 62, 0.12)' : 'rgba(47, 110, 62, 0.22)',
      marginBottom: 12,
    },
    emptyBadgeTitle: {
      fontSize: 13,
      fontWeight: '700',
      color: theme.colors.primaryEco,
    },
    emptyIconCircle: {
      width: 60,
      height: 60,
      borderRadius: 30,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 14,
    },
    emptyIconCircleEco: {
      backgroundColor:
        theme.colors.text === '#000' ? 'rgba(47, 110, 62, 0.12)' : 'rgba(47, 110, 62, 0.22)',
    },
    emptyIconCircleSocio: {
      backgroundColor:
        theme.colors.text === '#000' ? 'rgba(31, 111, 139, 0.12)' : 'rgba(31, 111, 139, 0.22)',
    },
    emptyTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: theme.colors.text,
      textAlign: 'center',
      marginBottom: 6,
    },
    emptySubtitle: {
      fontSize: 13,
      color: theme.colors.grey,
      textAlign: 'center',
      lineHeight: 18,
      marginBottom: 18,
      maxWidth: 320,
    },
    calendarCard: {
      width: '100%',
      borderRadius: 18,
      overflow: 'hidden',
      marginBottom: 20,
      borderWidth: 1,
      borderColor:
        theme.colors.text === '#000' ? 'rgba(0, 0, 0, 0.08)' : 'rgba(255, 255, 255, 0.12)',
      backgroundColor: theme.colors.white,
      boxShadow: '0 8px 24px rgba(0, 0, 0, 0.08)',
    },
    calendarStyle: {
      borderRadius: 18,
    },
    emptyButton: {
      minWidth: 220,
    },
  });
