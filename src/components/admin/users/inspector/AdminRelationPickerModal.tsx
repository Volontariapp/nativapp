import React, { useState, useMemo, useCallback } from 'react';
import { View, StyleSheet, FlatList, ActivityIndicator, Pressable, TextInput } from 'react-native';
import { theme } from '@/shared/themes/theme';
import { AppText } from '@/components/typography/AppText';
import { AdminModal } from '@/components/admin/ui/AdminModal';
import { AppIcons } from '@/components/media/AppIcons';
import { Badge, resolveBadgeVariant } from '@/components/dataDisplay/badge';
import {
  useAdminUsersQuery,
  normalizeUsersList,
  useAdminBadgesQuery,
  normalizeBadgesList,
} from '@/api/admin/hooks/use-admin-users';
import { useAdminEventsQuery, normalizeEventsList } from '@/api/admin/hooks/use-admin-events';

interface AdminRelationPickerModalProps {
  visible: boolean;
  mode: 'users' | 'events' | 'badges';
  excludeIds: string[];
  onSelect: (id: string) => void;
  onClose: () => void;
}

interface PickerItem {
  id: string;
  title: string;
  subtitle: string;
  slug?: string;
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
  const { data: badgesData, isLoading: badgesLoading } = useAdminBadgesQuery();

  const isLoading =
    mode === 'users' ? usersLoading : mode === 'events' ? eventsLoading : badgesLoading;

  const filteredItems: PickerItem[] = useMemo(() => {
    const excludeSet = new Set(excludeIds);
    if (mode === 'users') {
      const users = normalizeUsersList(usersData);
      return users.reduce<PickerItem[]>((acc, u) => {
        if (excludeSet.has(u.id)) return acc;
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
    } else if (mode === 'events') {
      const events = normalizeEventsList(eventsData);
      return events.reduce<PickerItem[]>((acc, e) => {
        if (excludeSet.has(e.id)) return acc;
        const query = searchQuery.toLowerCase();
        if (e.title.toLowerCase().includes(query) || e.id.includes(query)) {
          acc.push({ id: e.id, title: e.title, subtitle: e.id });
        }
        return acc;
      }, []);
    } else {
      const badges = normalizeBadgesList(badgesData);
      return badges.reduce<PickerItem[]>((acc, b) => {
        if (excludeSet.has(b.id)) return acc;
        const query = searchQuery.toLowerCase();
        if (
          b.name.toLowerCase().includes(query) ||
          b.slug.toLowerCase().includes(query) ||
          b.description.toLowerCase().includes(query) ||
          b.id.includes(query)
        ) {
          acc.push({
            id: b.id,
            title: b.name,
            subtitle:
              typeof b.description === 'string' && b.description !== ''
                ? `${b.slug} • ${b.description}`
                : b.slug,
            slug: b.slug,
          });
        }
        return acc;
      }, []);
    }
  }, [mode, usersData, eventsData, badgesData, excludeIds, searchQuery]);

  const handleSelect = useCallback(
    (id: string) => {
      onSelect(id);
    },
    [onSelect],
  );

  const renderItem = useCallback(
    ({ item }: { item: PickerItem }) => {
      const variant =
        typeof item.slug === 'string' && item.slug !== '' ? resolveBadgeVariant(item.slug) : null;
      return (
        <Pressable
          style={styles.itemCard}
          onPress={() => {
            handleSelect(item.id);
          }}
        >
          {mode === 'badges' && (
            <View style={styles.badgeThumbnail}>
              {variant != null ? (
                <Badge variant={variant} size="sm" disableModal />
              ) : (
                <AppIcons icon="award" iconLibrary="Feather" size={20} color={theme.colors.primaryEco} />
              )}
            </View>
          )}
          <View style={styles.itemInfo}>
            <AppText style={styles.itemTitle}>{item.title}</AppText>
            <AppText style={styles.itemSubtitle}>{item.subtitle}</AppText>
          </View>
          <AppIcons
            icon={mode === 'badges' ? 'plus' : 'chevron-right'}
            size={20}
            color={mode === 'badges' ? theme.colors.primarySocio : theme.colors.grey}
          />
        </Pressable>
      );
    },
    [handleSelect, mode],
  );

  const handleClearSearch = useCallback(() => {
    setSearchQuery('');
  }, []);

  const modalTitle =
    mode === 'users'
      ? 'Sélectionner un utilisateur'
      : mode === 'events'
        ? 'Sélectionner un événement'
        : 'Attribuer un badge';

  return (
    <AdminModal visible={visible} onClose={onClose} title={modalTitle} scrollable={false}>
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
          <Pressable onPress={handleClearSearch}>
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
          renderItem={renderItem}
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
  badgeThumbnail: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.sm,
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

