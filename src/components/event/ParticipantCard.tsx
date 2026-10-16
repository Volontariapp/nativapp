import React from 'react';
import { View, StyleSheet, Pressable, type ViewStyle } from 'react-native';
import { Image } from 'expo-image';
import Feather from 'react-native-vector-icons/Feather';
import { AppText } from '@/components/typography/AppText';
import { useAppTheme, useStyles } from '@/context/ThemeContext';
import type { AppTheme } from '@/shared/themes/theme';
import type { UserWeb } from '@volontariapp/contracts';

export interface ParticipantCardProps {
  participant: UserWeb;
  onPress?: () => void;
  style?: ViewStyle;
  testID?: string;
}

export function ParticipantCard({
  participant,
  onPress,
  style,
  testID = 'participant-card',
}: ParticipantCardProps): React.JSX.Element {
  const { theme } = useAppTheme();
  const styles = useStyles(createStyles);

  const avatarUri = participant.logoPath ?? `https://i.pravatar.cc/150?u=${participant.id}`;

  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        pressed && styles.cardPressed,
        style,
      ]}
      onPress={onPress}
      disabled={!onPress}
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={`Participant ${participant.pseudo}`}
    >
      <Image source={{ uri: avatarUri }} style={styles.avatar} />

      <View style={styles.content}>
        <View style={styles.topRow}>
          <AppText style={styles.pseudo} numberOfLines={1}>
            {participant.pseudo}
          </AppText>
        </View>

        <View style={styles.bottomRow}>
          {participant.totalImpactScore > 0 ? (
            <View style={styles.scoreRow}>
              <Feather name="award" size={12} color={theme.colors.goldText} />
              <AppText style={styles.scoreText}>
                {participant.totalImpactScore} pts
              </AppText>
            </View>
          ) : (
            <AppText style={styles.infoText}>Bénévole</AppText>
          )}

          {Boolean((participant.email as string | undefined)?.length) && (
            <AppText style={styles.emailText} numberOfLines={1}>
              {participant.email}
            </AppText>
          )}
        </View>
      </View>
    </Pressable>
  );
}

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    card: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.white,
      borderRadius: theme.radius.md,
      padding: theme.spacing.md,
      marginBottom: theme.spacing.sm,
      borderWidth: 1,
      borderColor: theme.colors.separator,
    },
    cardPressed: {
      opacity: 0.85,
    },
    avatar: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: theme.colors.background,
      marginRight: theme.spacing.md,
    },
    content: {
      flex: 1,
      gap: theme.spacing.xs,
    },
    topRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    pseudo: {
      fontSize: theme.typography.fontSize.sm,
      fontWeight: theme.typography.fontWeight.semibold,
      color: theme.colors.black,
      flex: 1,
    },
    bottomRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    scoreRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    scoreText: {
      fontSize: theme.typography.fontSize.xs,
      fontWeight: theme.typography.fontWeight.medium,
      color: theme.colors.goldText,
    },
    infoText: {
      fontSize: theme.typography.fontSize.xs,
      color: theme.colors.grey,
    },
    emailText: {
      fontSize: 11,
      color: theme.colors.grey,
    },
  });

