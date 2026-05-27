import React from 'react';
import { View, StyleSheet } from 'react-native';
import { AdminApiTester } from '../../../components/admin/AdminApiTester';
import { adminUserApi } from '@/api/admin/admin.user.api';
import { theme } from '@/shared/themes/theme';

export default function AdminUsersScreen(): React.JSX.Element {
  return (
    <View style={styles.container}>
      <AdminApiTester apiModule={adminUserApi} domainName="Users" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
});
