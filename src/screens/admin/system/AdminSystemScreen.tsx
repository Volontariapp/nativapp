import React from 'react';
import { View, StyleSheet } from 'react-native';
import { AdminApiTester } from '../../../components/admin/AdminApiTester';
import { adminHealthApi } from '@/api/admin/admin.health.api';
import { theme } from '@/shared/themes/theme';

export default function AdminSystemScreen(): React.JSX.Element {
  return (
    <View style={styles.container}>
      <AdminApiTester apiModule={adminHealthApi} domainName="System & Health" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
});
