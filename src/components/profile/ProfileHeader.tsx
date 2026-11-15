import React, { useState } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Image } from 'expo-image';
import Icon from 'react-native-vector-icons/Feather';
import { AppText } from '@/components/typography/AppText';
import { useAppTheme, useStyles } from '@/context/ThemeContext';
import { lightTheme, type AppTheme } from '@/shared/themes/theme';
import { getImpactRankStatus } from '@/shared/lib/impact-ranks';
import { RankFrame } from '@/components/rank/rank-frame';

import type { ProfileStatItem } from './ProfileStats';

export const EMPTY_BIO_PLACEHOLDER = 'Aucune biographie pour le moment';

interface ProfileHeaderProps {
  /** Utilisateur du profil : sert à poser le cadre de classement autour du pseudo et de la bio. */
  userId?: string;
  pseudo: string;
  avatarUrl?: string;
  bio?: string;
  impactScore?: number;
  stats?: ProfileStatItem[];
  headerAction?: React.ReactNode;
  bioAction?: React.ReactNode;
}

export const ProfileHeader = ({
  userId,
  pseudo,
  avatarUrl,
  bio,
  impactScore,
  stats = [],
  headerAction,
  bioAction,
}: ProfileHeaderProps): React.JSX.Element => {
  const { theme } = useAppTheme();
  const styles = useStyles(createStyles);
  const [failedAvatarUrl, setFailedAvatarUrl] = useState<string | null>(null);

  const displayedStats = stats.slice(0, 4);
  const hasValidAvatar =
    typeof avatarUrl === 'string' &&
    avatarUrl.trim() !== '' &&
    failedAvatarUrl !== avatarUrl;
  const hasBio = typeof bio === 'string' && bio.trim() !== '';
  const initials = pseudo.trim().slice(0, 2).toUpperCase();

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <View style={styles.avatarContainer}>
          {hasValidAvatar ? (
            <Image
              source={{ uri: avatarUrl }}
              style={styles.avatarImage}
              onError={() => {
                setFailedAvatarUrl(avatarUrl);
              }}
            />
          ) : (
            <View style={styles.avatarPlaceholder}>
              {initials.length > 0 ? (
                <AppText style={styles.avatarInitials}>{initials}</AppText>
              ) : (
                <Icon name="user" size={40} color={theme.colors.grey} />
              )}
            </View>
          )}
        </View>

        <View style={styles.statsContainer}>
          {displayedStats.map((stat) =>
            stat.onPress !== undefined ? (
              <Pressable
                key={stat.label}
                testID={stat.testID}
                style={({ pressed }) => [styles.statItem, pressed && styles.statItemPressed]}
                onPress={stat.onPress}
                accessibilityRole="button"
                accessibilityLabel={stat.label}
              >
                <AppText style={styles.statValue} numberOfLines={1}>
                  {stat.value}
                </AppText>
                <AppText style={styles.statLabel} numberOfLines={1}>
                  {stat.label}
                </AppText>
              </Pressable>
            ) : (
              <View key={stat.label} testID={stat.testID} style={styles.statItem}>
                <AppText style={styles.statValue} numberOfLines={1}>
                  {stat.value}
                </AppText>
                <AppText style={styles.statLabel} numberOfLines={1}>
                  {stat.label}
                </AppText>
              </View>
            ),
          )}
        </View>
      </View>

      <RankFrame userId={userId} intensity="strong">
        <View style={styles.bottomSection}>
          <View style={styles.nameRow}>
            <AppText style={styles.userName}>{pseudo}</AppText>
            {impactScore !== undefined && (
              <View testID="profile-rank-chip" style={styles.rankChip}>
                <AppText style={styles.rankChipText}>
                  {getImpactRankStatus(impactScore).current.name}
                </AppText>
              </View>
            )}
          </View>
          <AppText style={[styles.bioText, !hasBio && styles.bioPlaceholder]}>
            {hasBio ? bio : EMPTY_BIO_PLACEHOLDER}
          </AppText>
          {headerAction !== undefined && headerAction !== null && (
            <View style={styles.actionContainer}>{headerAction}</View>
          )}
          {bioAction !== undefined && bioAction !== null && (
            <View style={styles.actionContainer}>{bioAction}</View>
          )}
        </View>
      </RankFrame>
    </View>
  );
};

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      marginBottom: theme.spacing.xl,
      marginTop: theme.spacing.sm,
    },
    topRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: theme.spacing.md,
    },
    avatarContainer: {
      marginRight: theme.spacing.lg,
    },
    avatarPlaceholder: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: theme.colors.lightGrey,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 2,
      borderColor: theme.colors.white,
      ...theme.shadows.card,
    },
    avatarInitials: {
      fontSize: theme.typography.fontSize.xl,
      fontWeight: theme.typography.fontWeight.bold,
      color: theme.colors.grey,
    },
    avatarImage: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: theme.colors.lightGrey,
      borderWidth: 2,
      borderColor: theme.colors.white,
      ...theme.shadows.card,
    },
    statsContainer: {
      flex: 1,
      flexDirection: 'row',
      justifyContent: 'space-around',
    },
    statItem: {
      flex: 1,
      alignItems: 'center',
    },
    statItemPressed: {
      opacity: 0.7,
    },
    statValue: {
      fontSize: theme.typography.fontSize.xl,
      fontWeight: theme.typography.fontWeight.bold,
      color: theme.colors.text,
      marginBottom: 2,
    },
    statLabel: {
      fontSize: theme.typography.fontSize.xs,
      color: theme.colors.grey,
    },
    bottomSection: {
      paddingHorizontal: theme.spacing.xs,
    },
    nameRow: {
      flexDirection: 'row',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: theme.spacing.sm,
      marginBottom: theme.spacing.xs,
    },
    userName: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme.colors.text,
    },
    rankChip: {
      backgroundColor: theme.colors.primaryEco,
      borderRadius: theme.radius.full,
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: 2,
    },
    rankChipText: {
      color: lightTheme.colors.white,
      fontSize: theme.typography.fontSize.xs,
      fontWeight: theme.typography.fontWeight.bold,
      letterSpacing: 1,
    },
    bioText: {
      fontSize: theme.typography.fontSize.md,
      lineHeight: 20,
      color: theme.colors.text,
      marginBottom: theme.spacing.md,
    },
    bioPlaceholder: {
      color: theme.colors.grey,
      fontStyle: 'italic',
    },
    actionContainer: {
      marginBottom: theme.spacing.md,
    },
  });
