import React from 'react';
import { View, StyleSheet, ScrollView, Pressable } from 'react-native';
import { theme } from '@/shared/themes/theme';
import { AdminStatBadge } from '../../../components/admin/ui/AdminStatBadge';
import { AppText } from '@/components/typography/AppText';
import { AppButton } from '@/components/buttons/AppButton';
import { useQuery } from '@tanstack/react-query';
import { adminHealthApi } from '@/api/admin/admin.health.api';
import { adminUserApi } from '@/api/admin/admin.user.api';
import { adminEventApi } from '@/api/admin/admin.event.api';
import { useNavigation } from '@react-navigation/native';
import type { ListUsersWebResponse, SearchEventsResponse } from '@volontariapp/contracts';

type AdminNavigationProp = {
  navigate: (screen: string) => void;
};

export default function AdminDashboardScreen(): React.JSX.Element {
  const navigation = useNavigation<AdminNavigationProp>();

  const { data: usersData, error: usersError } = useQuery<ListUsersWebResponse>({
    queryKey: ['admin', 'users', 'count'],
    queryFn: async () => await adminUserApi.listUsers({ pagination: { page: 1, limit: 10 } }),
  });

  const { data: eventsData, error: eventsError } = useQuery<SearchEventsResponse>({
    queryKey: ['admin', 'events', 'count'],
    queryFn: async () => await adminEventApi.listEvents({ onlyAvailable: false }),
  });

  const { isSuccess: isHealthOk } = useQuery({
    queryKey: ['admin', 'health'],
    queryFn: async () => {
      await adminHealthApi.checkHealth();
      return true;
    },
  });

  if (usersError) console.error('Users API Error:', usersError);
  if (eventsError) console.error('Events API Error:', eventsError);

  const usersCount = usersData?.pagination?.total ?? usersData?.users.length ?? 0;
  const eventsCount = eventsData?.totalCount ?? eventsData?.events.length ?? 0;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <AppText style={styles.headerTitle}>Tableau de bord</AppText>
        <AppText style={styles.headerSubtitle}>Vue d'ensemble de la plateforme</AppText>
      </View>

      <View style={styles.statsGrid}>
        <AdminStatBadge
          title="Utilisateurs Actifs"
          value={usersCount.toString()}
          trend="neutral"
          trendValue="À l'instant"
        />
        <AdminStatBadge
          title="Nouveaux Événements"
          value={eventsCount.toString()}
          trend="neutral"
          trendValue="À l'instant"
        />
      </View>

      <View style={styles.statsGrid}>
        <AdminStatBadge
          title="Signalements (Reports)"
          value="0"
          trend="neutral"
          trendValue="Bientôt dispo"
        />
        <AdminStatBadge
          title="Santé du Serveur"
          value={isHealthOk ? 'OK' : 'Vérif...'}
          trend={isHealthOk ? 'up' : 'neutral'}
          trendValue={isHealthOk ? 'En ligne' : 'En attente'}
        />
      </View>

      <AppText style={styles.sectionTitle}>Raccourcis & Actions Rapides</AppText>

      <View style={styles.actionsContainer}>
        <Pressable
          style={styles.actionCard}
          onPress={() => {
            navigation.navigate('Users');
          }}
        >
          <AppText style={styles.actionCardTitle}>Gestion des Utilisateurs</AppText>
          <AppText style={styles.actionCardDesc}>
            Consulter les profils, modifier les rôles et attribuer des badges.
          </AppText>
          <AppButton
            text="Gérer les Utilisateurs"
            variant="eco"
            icon="users"
            onPress={() => {
              navigation.navigate('Users');
            }}
          />
        </Pressable>

        <Pressable
          style={styles.actionCard}
          onPress={() => {
            navigation.navigate('Events');
          }}
        >
          <AppText style={styles.actionCardTitle}>Gestion des Événements</AppText>
          <AppText style={styles.actionCardDesc}>
            Publier, annuler, mettre à jour ou supprimer des opportunités de bénévolat.
          </AppText>
          <AppButton
            text="Gérer les Événements"
            variant="eco"
            icon="calendar"
            onPress={() => {
              navigation.navigate('Events');
            }}
          />
        </Pressable>

        <Pressable
          style={styles.actionCard}
          onPress={() => {
            navigation.navigate('System');
          }}
        >
          <AppText style={styles.actionCardTitle}>État du Système</AppText>
          <AppText style={styles.actionCardDesc}>
            Vérifier la latence de l'API, les endpoints et la santé du serveur.
          </AppText>
          <AppButton
            text="Vérifier le Système"
            variant="eco"
            icon="server"
            onPress={() => {
              navigation.navigate('System');
            }}
          />
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  content: {
    padding: theme.spacing.lg,
    gap: theme.spacing.lg,
  },
  header: {
    marginBottom: theme.spacing.xs,
  },
  headerTitle: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: '700',
    color: theme.colors.black,
  },
  headerSubtitle: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.grey,
    marginTop: theme.spacing.xs,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: '600',
    color: theme.colors.grey,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: theme.spacing.md,
  },
  actionsContainer: {
    gap: theme.spacing.md,
  },
  actionCard: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.radius.md,
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.lightGrey,
    ...theme.shadows.card,
  },
  actionCardTitle: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: '700',
    color: theme.colors.black,
  },
  actionCardDesc: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.grey,
  },
});
