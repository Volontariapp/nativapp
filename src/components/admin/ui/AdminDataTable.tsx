import React, { useCallback } from 'react';
import { View, FlatList, StyleSheet, ActivityIndicator, Pressable, ScrollView } from 'react-native';
import { AppText } from '@/components/typography/AppText';
import { theme } from '@/shared/themes/theme';
import { AdminCard } from './AdminCard';

export interface TableColumn<T> {
  key: string;
  title: string;
  render?: (item: T) => React.ReactNode;
  flex?: number;
  width?: number;
  minWidth?: number;
}

interface AdminDataTableProps<T> {
  data: T[];
  columns: TableColumn<T>[];
  keyExtractor: (item: T, index: number) => string;
  isLoading?: boolean;
  onRowPress?: (item: T) => void;
  ListEmptyComponent?: React.ReactElement;
}

function AdminDataTableHeader<T>({ columns }: { columns: TableColumn<T>[] }): React.JSX.Element {
  return (
    <View style={styles.headerRow}>
      {columns.map((col) => (
        <View
          key={col.key}
          style={[
            styles.headerCell,
            col.width !== undefined ? { width: col.width } : { flex: col.flex ?? 1 },
            col.minWidth !== undefined ? { minWidth: col.minWidth } : undefined,
          ]}
        >
          <AppText style={styles.headerText}>{col.title}</AppText>
        </View>
      ))}
    </View>
  );
}

function AdminDataTableRow<T>({
  item,
  columns,
  onPress,
}: {
  item: T;
  columns: TableColumn<T>[];
  onPress?: (item: T) => void;
}): React.JSX.Element {
  const content = (
    <View style={styles.row}>
      {columns.map((col) => (
        <View
          key={col.key}
          style={[
            styles.cell,
            col.width !== undefined ? { width: col.width } : { flex: col.flex ?? 1 },
            col.minWidth !== undefined ? { minWidth: col.minWidth } : undefined,
          ]}
        >
          {col.render ? (
            col.render(item)
          ) : (
            <AppText style={styles.cellText}>{String(item[col.key as keyof T] ?? '')}</AppText>
          )}
        </View>
      ))}
    </View>
  );

  if (onPress) {
    return (
      <Pressable
        onPress={() => {
          onPress(item);
        }}
        style={({ pressed }: { pressed: boolean }) => [
          { opacity: pressed ? 0.7 : 1, width: '100%' },
        ]}
      >
        {content}
      </Pressable>
    );
  }

  return content;
}

export function AdminDataTable<T>({
  data,
  columns,
  keyExtractor,
  isLoading,
  onRowPress,
  ListEmptyComponent,
}: AdminDataTableProps<T>): React.JSX.Element {
  const renderItem = useCallback(
    ({ item }: { item: T }) => (
      <AdminDataTableRow item={item} columns={columns} onPress={onRowPress} />
    ),
    [columns, onRowPress],
  );

  return (
    <AdminCard noPadding style={styles.container}>
      <ScrollView horizontal showsHorizontalScrollIndicator style={styles.scrollContainer}>
        <View style={styles.tableWrapper}>
          <AdminDataTableHeader columns={columns} />
          {isLoading === true ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator color={theme.colors.primarySocio} />
            </View>
          ) : (
            <FlatList
              style={{ width: '100%' }}
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
        </View>
      </ScrollView>
    </AdminCard>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
  },
  tableWrapper: {
    minWidth: 800,
    width: '100%',
  },
  headerRow: {
    flexDirection: 'row',
    backgroundColor: theme.colors.background,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.lightGrey,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    width: '100%',
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
    width: '100%',
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
