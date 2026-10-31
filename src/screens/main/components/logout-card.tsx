import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { AppText } from '@/components/typography/AppText';
import { AppIcons } from '@/components/media/AppIcons';
import { useAuth } from '@/context/AuthContext';
import { useAppTheme, useStyles } from '@/context/ThemeContext';
import type { AppTheme } from '@/shared/themes/theme';

/** Entrée des paramètres pour se déconnecter de l'application. */
export function LogoutCard(): React.JSX.Element {
  const { theme } = useAppTheme();
  const styles = useStyles(createStyles);
  const { logout } = useAuth();

  return (
    <Pressable
      style={styles.card}
      onPress={() => {
        void logout();
      }}
      accessibilityRole="button"
      accessibilityLabel="Se déconnecter"
    >
      <View style={styles.iconContainer}>
        <AppIcons icon="log-out" size={20} color={theme.colors.white} />
      </View>
      <View style={styles.text}>
        <AppText style={styles.title}>Se déconnecter</AppText>
        <AppText style={styles.description}>Quitter ta session sur cet appareil</AppText>
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
      padding: theme.spacing.lg,
      marginTop: theme.spacing.md,
    },
    iconContainer: {
      width: 40,
      height: 40,
      borderRadius: theme.radius.full,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.grey,
      marginRight: theme.spacing.md,
    },
    text: { flex: 1 },
    title: { fontSize: 16, fontWeight: '600', color: theme.colors.text, marginBottom: 4 },
    description: { fontSize: 14, color: theme.colors.grey, lineHeight: 20 },
  });
