import React from 'react';
import { View, StyleSheet, Pressable, ActivityIndicator, type ViewStyle } from 'react-native';
import { Image } from 'expo-image';
import Feather from 'react-native-vector-icons/Feather';
import { AppText } from '@/components/typography/AppText';
import { useAppTheme, useStyles } from '@/context/ThemeContext';
import type { AppTheme } from '@/shared/themes/theme';
import type { UserWeb } from '@volontariapp/contracts';

export interface ParticipantCardProps {
  participant: UserWeb;
  isCheckedIn?: boolean;
  canCheckIn?: boolean;
  onToggleCheckIn?: () => void;
  isCheckInPending?: boolean;
  onPress?: () => void;
  style?: ViewStyle;
  testID?: string;
}

export function ParticipantCard({
  participant,
  isCheckedIn,
  canCheckIn = false,
  onToggleCheckIn,
  isCheckInPending = false,
  onPress,
  style,
  testID = 'participant-card',
}: ParticipantCardProps): React.JSX.Element {
  const { theme } = useAppTheme();
  const styles = useStyles(createStyles);

  const avatarUri = participant.logoPath ?? `https://i.pravatar.cc/150?u=${participant.id}`;
  const isChecked = isCheckedIn === true;

  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        pressed && Boolean(onPress) && styles.cardPressed,
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
              <AppText style={styles.scoreText}>{participant.totalImpactScore} pts</AppText>
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

      {/* Bouton ou badge d'émargement */}
      {canCheckIn ? (
        <Pressable
          style={[
            styles.checkInButton,
            isChecked ? styles.checkInButtonActive : styles.checkInButtonInactive,
          ]}
          onPress={onToggleCheckIn}
          disabled={isCheckInPending}
          hitSlop={8}
          accessibilityRole="checkbox"
          accessibilityState={{ checked: isChecked }}
          accessibilityLabel={`Émarger ${participant.pseudo}`}
        >
          {isCheckInPending ? (
            <ActivityIndicator
              size="small"
              color={isChecked ? theme.colors.primaryEco : theme.colors.grey}
            />
          ) : (
            <>
              <Feather
                name={isChecked ? 'check-circle' : 'circle'}
                size={18}
                color={isChecked ? theme.colors.primaryEco : theme.colors.grey}
              />
              <AppText
                style={[
                  styles.checkInText,
                  { color: isChecked ? theme.colors.primaryEco : theme.colors.grey },
                ]}
              >
                {isChecked ? 'Présent' : 'Émarger'}
              </AppText>
            </>
          )}
        </Pressable>
      ) : isCheckedIn !== undefined ? (
        <View
          style={[
            styles.statusBadge,
            isChecked ? styles.statusBadgePresent : styles.statusBadgeAbsent,
          ]}
        >
          <Feather
            name={isChecked ? 'check' : 'x'}
            size={12}
            color={isChecked ? theme.colors.primaryEco : theme.colors.grey}
          />
          <AppText
            style={[
              styles.statusBadgeText,
              { color: isChecked ? theme.colors.primaryEco : theme.colors.grey },
            ]}
          >
            {isChecked ? 'Présent' : 'Absent'}
          </AppText>
        </View>
      ) : null}
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
    checkInButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 6,
      paddingHorizontal: 10,
      borderRadius: 20,
      borderWidth: 1,
      gap: 6,
      marginLeft: theme.spacing.sm,
    },
    checkInButtonActive: {
      backgroundColor: '#f0fdf4',
      borderColor: theme.colors.primaryEco,
    },
    checkInButtonInactive: {
      backgroundColor: theme.colors.background,
      borderColor: theme.colors.separator,
    },
    checkInText: {
      fontSize: 12,
      fontWeight: '600',
    },
    statusBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 4,
      paddingHorizontal: 8,
      borderRadius: theme.radius.sm,
      gap: 4,
      marginLeft: theme.spacing.sm,
    },
    statusBadgePresent: {
      backgroundColor: '#f0fdf4',
    },
    statusBadgeAbsent: {
      backgroundColor: theme.colors.lightGrey,
    },
    statusBadgeText: {
      fontSize: 11,
      fontWeight: '500',
    },
  });
