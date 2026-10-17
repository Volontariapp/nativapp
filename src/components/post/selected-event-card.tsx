import React from 'react';
import { View, Pressable } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { useAppTheme, useStyles } from '@/context/ThemeContext';
import { AppText } from '@/components/typography/AppText';
import type { AppEvent } from '@/api/event/event.api';
import { mapEventType } from '@/shared/lib/event-mappers.utils';
import { formatDate } from '@/shared/lib/format-date.utils';
import { getEventTone } from './event-type-tone';
import { createEventSelectorStyles } from './event-selector.styles';

const TONE = {
  social: {
    icon: 'users',
    badge: 'typeBadgeSocial',
    text: 'typeBadgeTextSocial',
    color: 'primarySocio',
  },
  eco: { icon: 'globe', badge: 'typeBadgeEco', text: 'typeBadgeTextEco', color: 'primaryEco' },
} as const;

interface SelectedEventCardProps {
  event: AppEvent;
  onPreview: () => void;
  onChange: () => void;
  onClear: () => void;
}

export const SelectedEventCard = ({
  event,
  onPreview,
  onChange,
  onClear,
}: SelectedEventCardProps): React.JSX.Element => {
  const { theme } = useAppTheme();
  const styles = useStyles(createEventSelectorStyles);
  const tone = TONE[getEventTone(event)];

  return (
    <View style={styles.selectedCard}>
      <View style={styles.selectedCardHeader}>
        <View style={[styles.typeBadge, styles[tone.badge]]}>
          <Feather name={tone.icon} size={12} color={theme.colors[tone.color]} />
          <AppText style={[styles.typeBadgeText, styles[tone.text]]}>
            {mapEventType(event.type)}
          </AppText>
        </View>

        <AppText style={styles.selectedCardDate}>
          {formatDate(event.startAt, { day: '2-digit', month: 'short', year: 'numeric' })}
        </AppText>
      </View>

      <AppText style={styles.selectedCardTitle} numberOfLines={2}>
        {event.title}
      </AppText>

      <View style={styles.selectedCardMetaRow}>
        <Feather name="map-pin" size={13} color={theme.colors.grey} />
        <AppText style={styles.selectedCardLocation} numberOfLines={1}>
          {event.localisationName}
        </AppText>
      </View>

      <View style={styles.selectedCardActions}>
        <Pressable style={styles.cardActionButton} onPress={onPreview}>
          <Feather name="eye" size={14} color={theme.colors.primarySocio} />
          <AppText style={styles.cardActionTextSocio}>Aperçu</AppText>
        </Pressable>

        <Pressable style={styles.cardActionButton} onPress={onChange}>
          <Feather name="refresh-cw" size={13} color={theme.colors.grey} />
          <AppText style={styles.cardActionText}>Changer</AppText>
        </Pressable>

        <Pressable style={styles.cardActionButton} onPress={onClear}>
          <Feather name="x" size={14} color={theme.colors.danger} />
          <AppText style={styles.cardActionTextDanger}>Retirer</AppText>
        </Pressable>
      </View>
    </View>
  );
};
