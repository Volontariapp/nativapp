import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import React from 'react';
import { AppText } from '@/components/AppText';
import AppHeader from '@/components/AppHeader';

export function HomeScreen(): React.JSX.Element {
  return (
    <SafeAreaView style={styles.container}>
      <AppHeader />
      <AppText> This is the Feed screen </AppText>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
  },
  spacer: {
    height: 12,
  },
});
