import React from 'react';
import { View, StyleSheet } from 'react-native';
import { AppText } from '@/components/typography/AppText';
import { useStyles } from '@/context/ThemeContext';
import type { AppTheme } from '@/shared/themes/theme';

import { EMPTY_BIO_PLACEHOLDER } from './ProfileHeader';

interface ProfileBioProps {
  bio?: string;
}

export const ProfileBio = ({ bio }: ProfileBioProps): React.JSX.Element => {
  const styles = useStyles(createStyles);
  const hasBio = typeof bio === 'string' && bio.trim() !== '';

  return (
    <View style={styles.bioCard}>
      <AppText style={[styles.bioText, !hasBio && styles.bioPlaceholder]}>
        {hasBio ? bio : EMPTY_BIO_PLACEHOLDER}
      </AppText>
    </View>
  );
};

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    bioCard: {
      backgroundColor: theme.colors.white,
      padding: theme.spacing.lg,
      borderRadius: theme.radius.md,
      ...theme.shadows.card,
    },
    bioText: {
      fontSize: theme.typography.fontSize.md,
      lineHeight: 22,
      color: theme.colors.text,
    },
    bioPlaceholder: {
      color: theme.colors.grey,
      fontStyle: 'italic',
    },
  });
