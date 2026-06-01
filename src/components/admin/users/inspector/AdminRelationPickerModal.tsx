import React, { useState, useMemo } from 'react';
import { View, StyleSheet, FlatList, ActivityIndicator, Pressable, TextInput } from 'react-native';
import { theme } from '@/shared/themes/theme';
import { AppText } from '@/components/typography/AppText';
import { AdminModal } from '@/components/admin/ui/AdminModal';
import { AppIcons } from '@/components/media/AppIcons';
import { useAdminUsersQuery, normalizeUsersList } from '@/api/admin/hooks/use-admin-users';
import { useAdminEventsQuery, normalizeEventsList } from '@/api/admin/hooks/use-admin-events';

interface AdminRelationPickerModalProps {
  visible: boolean;
  mode: 'users' | 'events';
  excludeIds: string[];
  onSelect: (id: string) => void;
  onClose: () => void;
}

interface PickerItem {
  id: string;
  title: string;
  subtitle: string;
}

export function AdminRelationPickerModal({
  visible,
  mode,
  excludeIds,
  onSelect,
  onClose,
}: AdminRelationPickerModalProps): React.JSX.Element | null {
  const [searchQuery, setSearchQuery] = useState('');

  const { data: usersData, isLoading: usersLoading } = useAdminUsersQuery();
  const { data: eventsData, isLoading: eventsLoading } = useAdminEventsQuery();

  const isLoading = mode === 'users' ? usersLoading : eventsLoading;

  const filteredItems: PickerItem[] = useMemo(() => {
    if (mode === 'users') {
      const users = normalizeUsersList(usersData);
      return users.reduce<PickerItem[]>((acc, u) => {
        if (excludeIds.includes(u.id)) return acc;
        const query = searchQuery.toLowerCase();
        if (
          u.pseudo.toLowerCase().includes(query) ||
          u.email.toLowerCase().includes(query) ||
          u.id.includes(query)
        ) {
          acc.push({ id: u.id, title: u.pseudo, subtitle: u.email });
        }
        return acc;
      }, []);
    } else {
      const events = normalizeEventsList(eventsData);
      return events.reduce<PickerItem[]>((acc, e) => {
        if (excludeIds.includes(e.id)) return acc;
        const query = searchQuery.toLowerCase();
        if (e.title.toLowerCase().includes(query) || e.id.includes(query)) {
          acc.push({ id: e.id, title: e.title, subtitle: e.id });
        }
        return acc;
      }, []);
    }
  }, [mode, usersData, eventsData, excludeIds, searchQuery]);

  return (
    <AdminModal
      visible={visible}
      onClose={onClose}
      title={mode === 'users' ? 'Sélectionner un utilisateur' : 'Sélectionner un événement'}
      scrollable={false}
    >
      <View style={styles.searchContainer}>
        <AppIcons icon="search" size={20} color={theme.colors.grey} />
        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher..."
          placeholderTextColor={theme.colors.grey}
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoCapitalize="none"
        />
        {searchQuery.length > 0 && (
          <Pressable
            onPress={() => {
              setSearchQuery('');
            }}
          >
            <AppIcons icon="x" size={20} color={theme.colors.grey} />
          </Pressable>
        )}
      </View>

      {isLoading ? (
        <ActivityIndicator size="large" color={theme.colors.primarySocio} style={styles.loader} />
      ) : (
        <FlatList
          data={filteredItems}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <Pressable
              style={styles.itemCard}
              onPress={() => {
                onSelect(item.id);
              }}
            >
              <View style={styles.itemInfo}>
                <AppText style={styles.itemTitle}>{item.title}</AppText>
                <AppText style={styles.itemSubtitle}>{item.subtitle}</AppText>
              </View>
              <AppIcons icon="chevron-right" size={20} color={theme.colors.grey} />
            </Pressable>
          )}
          ListEmptyComponent={<AppText style={styles.emptyText}>Aucun résultat trouvé.</AppText>}
          style={styles.list}
          contentContainerStyle={styles.listContent}
        />
      )}
    </AdminModal>
  );
}

const styles = StyleSheet.create({
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.lightGrey + '30',
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.radius.md,
    marginBottom: theme.spacing.md,
    height: 48,
  },
  searchInput: {
    flex: 1,
    marginLeft: theme.spacing.sm,
    fontFamily: theme.typography.fonts.primary,
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.black,
  },
  loader: {
    padding: theme.spacing.xl,
  },
  list: {
    maxHeight: 400,
  },
  listContent: {
    paddingBottom: theme.spacing.lg,
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.lightGrey + '50',
  },
  itemInfo: {
    flex: 1,
  },
  itemTitle: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: '600',
    color: theme.colors.black,
  },
  itemSubtitle: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.grey,
    marginTop: 2,
  },
  emptyText: {
    textAlign: 'center',
    color: theme.colors.grey,
    fontStyle: 'italic',
    marginTop: theme.spacing.lg,
  },
});
