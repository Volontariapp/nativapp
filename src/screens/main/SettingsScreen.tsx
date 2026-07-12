import React from 'react';
import { View, StyleSheet, Pressable, Linking, Platform, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

import { AppText } from '@/components/typography/AppText';
import { AppIcons } from '@/components/media/AppIcons';
import { theme } from '@/shared/themes/theme';
import { TokenService } from '@/services/token.service';

const handleOpenLocationSettings = () => {
  if (Platform.OS === 'ios') {
    void Linking.openURL('app-settings:');
  } else {
    void Linking.openSettings();
  }
};

export function SettingsScreen() {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <SafeAreaView edges={['top']} style={styles.topBar}>
        <Pressable
          style={styles.backButton}
          onPress={() => {
            navigation.goBack();
          }}
        >
          <AppIcons icon="arrow-left" size={24} color={theme.colors.black} />
        </Pressable>
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
          <Pressable style={styles.actionButton} onPress={handleOpenLocationSettings}>
            <AppText style={styles.actionText}>Modifier</AppText>
          </Pressable>
        </View>

        {/* Debug Section */}
        <View style={{ marginTop: theme.spacing.xl }}>
          <AppText style={styles.settingTitle}>Debug (Test Auth)</AppText>

          <Pressable
            style={[
              styles.settingCard,
              {
                marginTop: theme.spacing.md,
                marginBottom: theme.spacing.sm,
                backgroundColor: theme.colors.lightGrey,
              },
            ]}
            onPress={() => {
              void TokenService.deleteAccessToken();
              console.log('Access token deleted for debug');
              Alert.alert(
                'AT Supprimé',
                'Faites une action nécessitant le réseau (swipe, pull-to-refresh...) pour déclencher le refresh automatique.',
              );
            }}
          >
            <View style={styles.settingInfo}>
              <View style={[styles.iconContainer, { backgroundColor: theme.colors.danger }]}>
                <AppIcons icon="delete" size={20} color={theme.colors.white} />
              </View>
              <View style={styles.settingTextContainer}>
                <AppText style={styles.settingTitle}>Delete Access Token</AppText>
                <AppText style={styles.settingDescription}>
                  Simule une requête vide (sans token)
                </AppText>
              </View>
            </View>
          </Pressable>

          <Pressable
            style={[
              styles.settingCard,
              { marginBottom: theme.spacing.sm, backgroundColor: theme.colors.lightGrey },
            ]}
            onPress={() => {
              void TokenService.corruptAccessToken();
              console.log('Access token corrupted for debug');
              Alert.alert(
                'AT Corrompu',
                "La signature de l'Access Token a été modifiée. La prochaine requête renverra un 401 (Invalid Token) et devrait déclencher le refresh automatique.",
              );
            }}
          >
            <View style={styles.settingInfo}>
              <View style={[styles.iconContainer, { backgroundColor: theme.colors.warning }]}>
                <AppIcons icon="alert-circle-outline" size={20} color={theme.colors.white} />
              </View>
              <View style={styles.settingTextContainer}>
                <AppText style={styles.settingTitle}>Corrompre l'Access Token</AppText>
                <AppText style={styles.settingDescription}>
                  Simule un token expiré/rejeté par le serveur
                </AppText>
              </View>
            </View>
          </Pressable>

          <Pressable
            style={[styles.settingCard, { backgroundColor: theme.colors.lightGrey }]}
            onPress={() => {
              void TokenService.deleteRefreshToken();
              console.log('Refresh token deleted for debug');
              Alert.alert(
                'RT Supprimé',
                'Le Refresh Token a été supprimé. Essayez de forcer un 401 (ex: en supprimant le AT puis en rafraîchissant) pour voir la déconnexion forcée.',
              );
            }}
          >
            <View style={styles.settingInfo}>
              <View style={[styles.iconContainer, { backgroundColor: theme.colors.danger }]}>
                <AppIcons icon="delete-outline" size={20} color={theme.colors.white} />
              </View>
              <View style={styles.settingTextContainer}>
                <AppText style={styles.settingTitle}>Delete Refresh Token</AppText>
                <AppText style={styles.settingDescription}>
                  Simule un refresh token invalide
                </AppText>
              </View>
            </View>
          </Pressable>
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
