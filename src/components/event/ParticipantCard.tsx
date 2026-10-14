import React from 'react';
import { View, StyleSheet, Pressable, type ViewStyle } from 'react-native';
import { Image } from 'expo-image';
import Feather from 'react-native-vector-icons/Feather';
import { AppText } from '@/components/typography/AppText';
import { useAppTheme, useStyles } from '@/context/ThemeContext';
import type { AppTheme } from '@/shared/themes/theme';
import type { EventParticipant } from '@/api/event/event.api';

export interface ParticipantCardProps {
  participant: EventParticipant;
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

  const isConfirmed = participant.status === 'CONFIRMED';
  const statusColor = isConfirmed ? theme.colors.primaryEco : theme.colors.warning;
  const statusBg = isConfirmed ? theme.colors.badgeGreenBackground : theme.colors.goldBackground;
  const statusLabel = isConfirmed ? 'Confirmé' : 'En attente';

  const avatarUri = participant.avatarUrl ?? `https://i.pravatar.cc/150?u=${participant.id}`;

  const formattedDate =
    participant.registeredAt !== undefined && participant.registeredAt.length > 0
      ? new Date(participant.registeredAt).toLocaleDateString('fr-FR', {
          day: 'numeric',
          month: 'short',
        })
      : undefined;

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
      accessibilityLabel={`Participant ${participant.pseudo}, statut ${statusLabel}`}
    >
      <Image source={{ uri: avatarUri }} style={styles.avatar} />

      <View style={styles.content}>
        <View style={styles.topRow}>
          <AppText style={styles.pseudo} numberOfLines={1}>
            {participant.pseudo}
          </AppText>

          <View style={[styles.statusBadge, { backgroundColor: statusBg }]}>
            <AppText style={[styles.statusText, { color: statusColor }]}>
              {statusLabel}
            </AppText>
          </View>
        </View>

        <View style={styles.bottomRow}>
          {participant.totalImpactScore !== undefined && participant.totalImpactScore > 0 ? (
            <View style={styles.scoreRow}>
              <Feather name="award" size={12} color={theme.colors.goldText} />
              <AppText style={styles.scoreText}>
                {participant.totalImpactScore} pts
              </AppText>
            </View>
          ) : (
            <AppText style={styles.infoText}>Bénévole</AppText>
          )}

          {formattedDate !== undefined && (
            <AppText style={styles.dateText}>Inscrit le {formattedDate}</AppText>
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
      marginRight: theme.spacing.sm,
    },
    statusBadge: {
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: 2,
      borderRadius: theme.radius.full,
    },
    statusText: {
      fontSize: 10,
      fontWeight: theme.typography.fontWeight.bold,
      textTransform: 'uppercase',
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
    dateText: {
      fontSize: 11,
      color: theme.colors.grey,
    },
  });
