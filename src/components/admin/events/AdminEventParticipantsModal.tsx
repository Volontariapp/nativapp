import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TextInput, ActivityIndicator, Alert } from 'react-native';
import { theme } from '@/shared/themes/theme';
import { AppText } from '@/components/typography/AppText';
import { AppButton } from '@/components/buttons/AppButton';
import { AdminModal } from '@/components/admin/ui/AdminModal';
import { useAdminEventParticipants } from '@/api/admin/hooks/use-admin-event-participants';
import { normalizeUsersList, useAdminUsersQuery } from '@/api/admin/hooks/use-admin-users';
import { useAdminParticipateEvent } from '@/api/admin/hooks/use-admin-social';
import type { UserWeb } from '@volontariapp/contracts';

interface AdminEventParticipantsModalProps {
  visible: boolean;
  onClose: () => void;
  eventId: string | undefined;
  organizerId?: string;
}

const ParticipantItem = ({ item, organizerId }: { item: UserWeb; organizerId?: string }) => {
  const isOrganizer = item.id === organizerId;
  return (
    <View style={styles.userRow}>
      <View style={styles.userInfo}>
        <AppText style={[styles.userName, isOrganizer && styles.badgeTextOrganizer]}>
          {item.pseudo}
        </AppText>
        <AppText style={styles.userEmail}>{item.email}</AppText>
      </View>
      <View style={[styles.badge, isOrganizer && styles.badgeOrganizer]}>
        <AppText style={[styles.badgeText, isOrganizer && styles.badgeTextOrganizer]}>
          {isOrganizer ? 'Organisateur' : 'Participant'}
        </AppText>
      </View>
    </View>
  );
};

const AvailableUserItem = ({
  item,
  isAdding,
  onAdd,
}: {
  item: UserWeb;
  isAdding: boolean;
  onAdd: (userId: string) => void;
}) => (
  <View style={styles.userRow}>
    <View style={styles.userInfo}>
      <AppText style={styles.userName}>{item.pseudo}</AppText>
      <AppText style={styles.userEmail}>{item.email}</AppText>
    </View>
    <AppButton
      text="Ajouter"
      variant="eco"
      onPress={() => {
        onAdd(item.id);
      }}
      disabled={isAdding}
    />
  </View>
);

export function AdminEventParticipantsModal({
  visible,
  onClose,
  eventId,
  organizerId,
}: AdminEventParticipantsModalProps): React.JSX.Element | null {
  const [searchQuery, setSearchQuery] = useState('');

  const { data: participantsData, isLoading: isLoadingParticipants } = useAdminEventParticipants({
    eventId: eventId ?? '',
  });
  const participants = normalizeUsersList(participantsData);

  const { data: allUsersData, isLoading: isLoadingAllUsers } = useAdminUsersQuery();
  const allUsers = normalizeUsersList(allUsersData);

  const { mutate: addParticipant, isPending: isAdding } = useAdminParticipateEvent();

  if (eventId == null) return null;

  const participantIds = new Set(participants.map((p) => p.id));

  const availableUsers = allUsers.filter(
    (user) =>
      !participantIds.has(user.id) &&
      (user.pseudo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase())),
  );

  const handleAddParticipant = (userId: string) => {
    addParticipant(
      { userId, eventId },
      {
        onSuccess: () => {
          Alert.alert('Succès', 'Participant ajouté avec succès !');
          setSearchQuery('');
        },
        onError: (error) => {
          Alert.alert('Erreur', error.message || "Impossible d'ajouter le participant");
        },
      },
    );
  };

  return (
    <AdminModal visible={visible} onClose={onClose} title="Gérer les participants">
      <View style={styles.section}>
        <AppText style={styles.sectionTitle}>Participants actuels ({participants.length})</AppText>
        {isLoadingParticipants ? (
          <ActivityIndicator size="small" color={theme.colors.primaryEco} />
        ) : (
          <ScrollView
            style={styles.list}
            contentContainerStyle={styles.listContent}
            nestedScrollEnabled={true}
          >
            {participants.length === 0 ? (
              <AppText style={styles.emptyText}>Aucun participant</AppText>
            ) : (
              participants.map((item) => (
                <ParticipantItem key={item.id} item={item} organizerId={organizerId} />
              ))
            )}
          </ScrollView>
        )}
      </View>

      <View style={styles.section}>
        <AppText style={styles.sectionTitle}>Ajouter un participant</AppText>
        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher par pseudo ou email..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {isLoadingAllUsers ? (
          <ActivityIndicator size="small" color={theme.colors.primaryEco} />
        ) : (
          <ScrollView
            style={styles.list}
            contentContainerStyle={styles.listContent}
            nestedScrollEnabled={true}
          >
            {availableUsers.length === 0 ? (
              <AppText style={styles.emptyText}>
                {searchQuery ? 'Aucun utilisateur trouvé' : 'Commencez à chercher un utilisateur'}
              </AppText>
            ) : (
              availableUsers.map((item) => (
                <AvailableUserItem
                  key={item.id}
                  item={item}
                  isAdding={isAdding}
                  onAdd={handleAddParticipant}
                />
              ))
            )}
          </ScrollView>
        )}
      </View>

      <View style={styles.modalActions}>
        <AppButton text="Fermer" variant="eco" onPress={onClose} />
      </View>
    </AdminModal>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: theme.spacing.lg,
    maxHeight: 250,
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: '600',
    color: theme.colors.black,
    marginBottom: theme.spacing.sm,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: theme.colors.lightGrey,
    borderRadius: theme.radius.sm,
    padding: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
    fontSize: theme.typography.fontSize.sm,
  },
  list: {
    borderWidth: 1,
    borderColor: theme.colors.lightGrey,
    borderRadius: theme.radius.sm,
  },
  listContent: {
    padding: theme.spacing.sm,
  },
  userRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.lightGrey,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: '600',
    color: theme.colors.black,
  },
  userEmail: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.grey,
  },
  badge: {
    backgroundColor: theme.colors.background,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.radius.full,
  },
  badgeOrganizer: {
    backgroundColor: theme.colors.white,
    borderWidth: 1,
    borderColor: theme.colors.danger,
    paddingVertical: 3, // Adjust for border width
  },
  badgeText: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.primaryEco,
    fontWeight: '600',
  },
  badgeTextOrganizer: {
    color: theme.colors.danger,
  },
  emptyText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.grey,
    textAlign: 'center',
    padding: theme.spacing.md,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: theme.spacing.md,
  },
});
