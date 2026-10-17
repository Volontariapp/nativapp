import React from 'react';
import { View, Pressable } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { useAppTheme, useStyles } from '@/context/ThemeContext';
import { AppText } from '@/components/typography/AppText';
import { createEventSelectorStyles } from './event-selector.styles';

interface EmptyEventCardProps {
  onPress: () => void;
}

export const EmptyEventCard = ({ onPress }: EmptyEventCardProps): React.JSX.Element => {
  const { theme } = useAppTheme();
  const styles = useStyles(createEventSelectorStyles);

  return (
    <Pressable
      style={({ pressed }) => [styles.emptyCard, pressed && styles.emptyCardPressed]}
      onPress={onPress}
    >
      <View style={styles.emptyCardIconContainer}>
        <Feather name="calendar" size={22} color={theme.colors.primaryEco} />
      </View>
      <View style={styles.emptyCardTextContainer}>
        <AppText style={styles.emptyCardTitle}>Associer un événement</AppText>
        <AppText style={styles.emptyCardSubtitle}>
          Donnez plus de visibilité à votre post en le liant à une action
        </AppText>
      </View>
      <View style={styles.emptyCardAction}>
        <Feather name="chevron-right" size={20} color={theme.colors.grey} />
      </View>
    </Pressable>
  );
};
