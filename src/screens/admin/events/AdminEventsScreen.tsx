import React from 'react';
import { View, StyleSheet } from 'react-native';
import { AdminApiTester } from '../../../components/admin/AdminApiTester';
import { adminEventApi } from '@/api/admin/admin.event.api';
import { theme } from '@/shared/themes/theme';

export default function AdminEventsScreen(): React.JSX.Element {
  return (
    <View style={styles.container}>
      <AdminApiTester apiModule={adminEventApi} domainName="Events" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
});
