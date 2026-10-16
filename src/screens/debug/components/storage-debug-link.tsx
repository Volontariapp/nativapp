import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AppText } from '@/components/typography/AppText';
import { AppIcons } from '@/components/media/AppIcons';
import { useAppTheme, useStyles } from '@/context/ThemeContext';
import type { AppTheme } from '@/shared/themes/theme';
import type { MainStackParamList } from '@/navigation/stacks/MainStack';

/** Entrée des paramètres vers l'écran de test du stockage. Visible en mode debug seulement. */
export function StorageDebugLink(): React.JSX.Element {
  const navigation = useNavigation<NativeStackNavigationProp<MainStackParamList>>();
  const { theme } = useAppTheme();
  const styles = useStyles(createStyles);

  return (
    <Pressable
      style={styles.card}
      onPress={() => {
        navigation.navigate('StorageDebug');
      }}
    >
      <View style={styles.iconContainer}>
        <AppIcons icon="upload-cloud" size={20} color={theme.colors.white} />
      </View>
      <View style={styles.text}>
        <AppText style={styles.title}>Test du stockage</AppText>
        <AppText style={styles.description}>
          Envoi de fichier et URLs présignées (S3, scan antivirus)
        </AppText>
      </View>
    </Pressable>
  );
}

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    card: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.lightGrey,
      borderRadius: theme.radius.md,
      padding: theme.spacing.md,
      marginTop: theme.spacing.md,
      marginBottom: theme.spacing.sm,
    },
    iconContainer: {
      backgroundColor: theme.colors.primarySocio,
      borderRadius: theme.radius.md,
      padding: theme.spacing.sm,
      marginRight: theme.spacing.md,
    },
    text: { flex: 1 },
    title: { fontWeight: '700' },
    description: { color: theme.colors.grey },
  });
