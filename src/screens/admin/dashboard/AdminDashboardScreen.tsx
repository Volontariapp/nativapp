import React from 'react';
import { View, StyleSheet } from 'react-native';
import { AdminApiTester } from '../../../components/admin/AdminApiTester';
import { adminSocialApi } from '@/api/admin/admin.social.api';
import { theme } from '@/shared/themes/theme';

export default function AdminDashboardScreen(): React.JSX.Element {
  return (
    <View style={styles.container}>
      <AdminApiTester apiModule={adminSocialApi} domainName="Social & Posts" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
});
