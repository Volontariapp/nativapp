import React from 'react';
import { View, FlatList, StyleSheet, type ListRenderItem, ActivityIndicator } from 'react-native';
import { AppText } from '@/components/typography/AppText';
import { theme } from '@/shared/themes/theme';
import { AdminCard } from './AdminCard';

export interface TableColumn<T> {
  key: string;
  title: string;
  render?: (item: T) => React.ReactNode;
  flex?: number;
}

interface AdminDataTableProps<T> {
  data: T[];
  columns: TableColumn<T>[];
  keyExtractor: (item: T, index: number) => string;
  isLoading?: boolean;
  onRowPress?: (item: T) => void;
  ListEmptyComponent?: React.ReactElement;
}

export function AdminDataTable<T>({
  data,
  columns,
  keyExtractor,
  isLoading,
  ListEmptyComponent,
}: AdminDataTableProps<T>): React.JSX.Element {
  const renderHeader = (): React.JSX.Element => (
    <View style={styles.headerRow}>
      {columns.map((col) => (
        <View key={col.key} style={[styles.headerCell, { flex: col.flex ?? 1 }]}>
          <AppText style={styles.headerText}>{col.title}</AppText>
        </View>
      ))}
    </View>
  );

  const renderItem: ListRenderItem<T> = ({ item }) => (
    <View style={styles.row}>
      {columns.map((col) => (
        <View key={col.key} style={[styles.cell, { flex: col.flex ?? 1 }]}>
          {col.render ? (
            col.render(item)
          ) : (
            <AppText style={styles.cellText}>{String(item[col.key as keyof T] ?? '')}</AppText>
          )}
        </View>
      ))}
    </View>
  );

  return (
    <AdminCard noPadding style={styles.container}>
      {renderHeader()}
      {isLoading === true ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator color={theme.colors.primarySocio} />
        </View>
      ) : (
        <FlatList
          data={data}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          ListEmptyComponent={
            ListEmptyComponent ?? (
              <View style={styles.emptyContainer}>
                <AppText style={styles.emptyText}>Aucune donnée</AppText>
              </View>
            )
          }
        />
      )}
    </AdminCard>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
  headerRow: {
    flexDirection: 'row',
    backgroundColor: theme.colors.background,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.lightGrey,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
  },
  headerCell: {
    justifyContent: 'center',
  },
  headerText: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: '600',
    color: theme.colors.grey,
    textTransform: 'uppercase',
  },
  row: {
    flexDirection: 'row',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    backgroundColor: theme.colors.white,
  },
  cell: {
    justifyContent: 'center',
  },
  cellText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.black,
  },
  separator: {
    height: 1,
    backgroundColor: theme.colors.lightGrey,
  },
  loadingContainer: {
    padding: theme.spacing.xxl,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    padding: theme.spacing.xxl,
    alignItems: 'center',
  },
  emptyText: {
    color: theme.colors.grey,
  },
});
