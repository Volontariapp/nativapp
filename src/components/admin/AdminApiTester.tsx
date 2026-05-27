import React, { useState, useMemo, useCallback } from 'react';
import { View, FlatList, StyleSheet, type ListRenderItem } from 'react-native';
import { AppText } from '@/components/typography/AppText';
import { SearchBar } from '@/components/ui/SearchBar';
import { FilterChip } from '@/components/ui/FilterChip';
import { EndpointCard } from './api-tester/EndpointCard';
import { EndpointModal } from './api-tester/EndpointModal';
import { getEndpointMeta } from './api-tester/endpoint-payloads';
import { HTTP_METHOD_COLORS } from '@/shared/themes/http-method-colors';
import { theme } from '@/shared/themes/theme';
import type { ApiModule, ApiFunction, EndpointMeta } from './api-tester/types';

interface AdminApiTesterProps {
  apiModule: ApiModule;
  domainName: string;
}

const ALL_FILTER = 'ALL';
const HTTP_METHODS = ['GET', 'POST', 'PATCH', 'DELETE'];

interface SelectedEndpoint {
  name: string;
  meta: EndpointMeta | null;
  fn: ApiFunction;
}

export const AdminApiTester = ({
  apiModule,
  domainName,
}: AdminApiTesterProps): React.JSX.Element => {
  const [search, setSearch] = useState('');
  const [methodFilter, setMethodFilter] = useState<string>(ALL_FILTER);
  const [selected, setSelected] = useState<SelectedEndpoint | null>(null);

  const allMethods = useMemo(() => Object.keys(apiModule), [apiModule]);

  const filtered = useMemo(() => {
    return allMethods.filter((name) => {
      const meta = getEndpointMeta(name);
      const matchesSearch =
        search.trim() === '' ||
        name.toLowerCase().includes(search.toLowerCase()) ||
        (meta?.path ?? '').toLowerCase().includes(search.toLowerCase()) ||
        (meta?.description ?? '').toLowerCase().includes(search.toLowerCase());
      const matchesMethod = methodFilter === ALL_FILTER || meta?.method === methodFilter;
      return matchesSearch && matchesMethod;
    });
  }, [allMethods, search, methodFilter]);

  const handleSelect = useCallback(
    (name: string): void => {
      const fn = apiModule[name];
      setSelected({ name, meta: getEndpointMeta(name), fn });
    },
    [apiModule],
  );

  const handleClose = useCallback((): void => {
    setSelected(null);
  }, []);

  const renderItem: ListRenderItem<string> = useCallback(
    ({ item }) => (
      <EndpointCard
        name={item}
        meta={getEndpointMeta(item)}
        onPress={() => {
          handleSelect(item);
        }}
      />
    ),
    [handleSelect],
  );

  const keyExtractor = useCallback((item: string) => item, []);

  return (
    <View style={styles.container}>
      {/* ── Header ─────────────────────────────────────────────────── */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <AppText style={styles.domainName}>{domainName}</AppText>
          <View style={styles.countBadge}>
            <AppText style={styles.countText}>
              {filtered.length}/{allMethods.length}
            </AppText>
          </View>
        </View>

        {/* Search */}
        <SearchBar
          value={search}
          onChangeText={setSearch}
          placeholder="Chercher un endpoint…"
          style={styles.searchBar}
        />

        {/* Method filters */}
        <View style={styles.filters}>
          <FilterChip
            label="Tous"
            selected={methodFilter === ALL_FILTER}
            color={theme.colors.primarySocio}
            onPress={() => {
              setMethodFilter(ALL_FILTER);
            }}
          />
          {HTTP_METHODS.map((m) => (
            <FilterChip
              key={m}
              label={m}
              selected={methodFilter === m}
              color={HTTP_METHOD_COLORS[m] ?? theme.colors.grey}
              onPress={() => {
                setMethodFilter(m === methodFilter ? ALL_FILTER : m);
              }}
            />
          ))}
        </View>
      </View>

      {/* ── List ───────────────────────────────────────────────────── */}
      <FlatList
        data={filtered}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <AppText style={styles.emptyText}>Aucun endpoint trouvé</AppText>
          </View>
        }
      />

      {/* ── Modal ──────────────────────────────────────────────────── */}
      <EndpointModal
        visible={selected != null}
        methodName={selected?.name ?? null}
        meta={selected?.meta ?? null}
        fn={selected?.fn ?? null}
        onClose={handleClose}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    backgroundColor: theme.colors.white,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.lightGrey,
    gap: theme.spacing.md,
    ...theme.shadows.card,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  domainName: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: '700',
    color: theme.colors.black,
  },
  countBadge: {
    backgroundColor: theme.colors.primarySocio + '14',
    borderColor: theme.colors.primarySocio + '40',
    borderWidth: 1,
    borderRadius: theme.radius.full,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
  },
  countText: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.primarySocio,
    fontFamily: 'Courier_Prime',
  },
  searchBar: {
    boxShadow: 'none',
  },
  filters: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  list: {
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.xxl,
  },
  empty: {
    alignItems: 'center',
    paddingTop: theme.spacing.xxl,
  },
  emptyText: {
    color: theme.colors.grey,
    fontSize: theme.typography.fontSize.sm,
  },
});
