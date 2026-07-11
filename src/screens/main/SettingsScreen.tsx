import React from 'react';
import { View, StyleSheet, TouchableOpacity, Linking, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

import { AppText } from '@/components/typography/AppText';
import { AppIcons } from '@/components/media/AppIcons';
import { theme } from '@/shared/themes/theme';

export function SettingsScreen() {
  const navigation = useNavigation();

  const handleOpenLocationSettings = () => {
    if (Platform.OS === 'ios') {
      void Linking.openURL('app-settings:');
    } else {
      void Linking.openSettings();
    }
  };

  return (
    <View style={styles.container}>
      <SafeAreaView edges={['top']} style={styles.topBar}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => {
            navigation.goBack();
          }}
        >
          <AppIcons icon="arrow-left" size={24} color={theme.colors.black} />
        </TouchableOpacity>
        <AppText style={styles.topBarTitle}>Paramètres</AppText>
        <View style={{ width: 40 }} />
      </SafeAreaView>

      <View style={styles.content}>
        <View style={styles.settingCard}>
          <View style={styles.settingInfo}>
            <View style={styles.iconContainer}>
              <AppIcons icon="map-pin" size={20} color={theme.colors.white} />
            </View>
            <View style={styles.settingTextContainer}>
              <AppText style={styles.settingTitle}>Localisation</AppText>
              <AppText style={styles.settingDescription}>
                Gérez l'accès à votre position géographique
              </AppText>
            </View>
          </View>
          <TouchableOpacity style={styles.actionButton} onPress={handleOpenLocationSettings}>
            <AppText style={styles.actionText}>Modifier</AppText>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
    backgroundColor: theme.colors.background,
    zIndex: 10,
  },
  backButton: {
    padding: theme.spacing.xs,
  },
  topBarTitle: {
    fontSize: 18,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.black,
    flex: 1,
    textAlign: 'center',
  },
  content: {
    padding: theme.spacing.xl,
  },
  settingCard: {
    backgroundColor: theme.colors.white,
    padding: theme.spacing.lg,
    borderRadius: theme.radius.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...theme.shadows.card,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: theme.spacing.md,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.primarySocio,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  settingTextContainer: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.black,
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 12,
    color: theme.colors.grey,
    fontFamily: theme.typography.fonts.primary,
  },
  actionButton: {
    backgroundColor: theme.colors.lightGrey,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: theme.radius.full,
  },
  actionText: {
    fontSize: 14,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.primarySocio,
  },
});
