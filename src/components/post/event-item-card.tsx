import React, { memo, useCallback } from 'react';
import { View, Pressable } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { useAppTheme, useStyles } from '@/context/ThemeContext';
import { AppText } from '@/components/typography/AppText';
import type { AppEvent } from '@/api/event/event.api';
import { mapEventType } from '@/shared/lib/event-mappers.utils';
import { formatDate } from '@/shared/lib/format-date.utils';
import { getEventTone } from './event-type-tone';
import { createEventPickerStyles } from './event-picker-modal.styles';

const TONE = {
  social: { badge: 'typeBadgeSocial', text: 'typeBadgeTextSocial' },
  eco: { badge: 'typeBadgeEco', text: 'typeBadgeTextEco' },
} as const;

interface EventItemCardProps {
  event: AppEvent;
  isSelected: boolean;
  onSelect: (event: AppEvent) => void;
  onPreview: (event: AppEvent) => void;
}

export const EventItemCard = memo(function EventItemCard({
  event,
  isSelected,
  onSelect,
  onPreview,
}: EventItemCardProps) {
  const { theme } = useAppTheme();
  const styles = useStyles(createEventPickerStyles);
  const tone = TONE[getEventTone(event)];

  const handleSelect = useCallback(() => {
    onSelect(event);
  }, [event, onSelect]);

  const handlePreview = useCallback(
    (e: { stopPropagation: () => void }) => {
      e.stopPropagation();
      onPreview(event);
    },
    [event, onPreview],
  );

  return (
    <Pressable
      style={[styles.modalEventItem, isSelected && styles.modalEventItemSelected]}
      onPress={handleSelect}
    >
      <View style={styles.modalEventContent}>
        <View style={styles.modalEventTopRow}>
          <View style={[styles.typeBadgeSmall, styles[tone.badge]]}>
            <AppText style={[styles.typeBadgeText, styles[tone.text]]}>
              {mapEventType(event.type)}
            </AppText>
          </View>
          <AppText style={styles.modalEventDate}>
            {formatDate(event.startAt, { day: '2-digit', month: 'short' })}
          </AppText>
        </View>

        <AppText style={styles.modalEventTitle} numberOfLines={1}>
          {event.title}
        </AppText>

        <View style={styles.modalEventLocationRow}>
          <Feather name="map-pin" size={12} color={theme.colors.grey} />
          <AppText style={styles.modalEventSubtitle} numberOfLines={1}>
            {event.localisationName}
          </AppText>
        </View>
      </View>

      <View style={styles.modalEventActions}>
        <Pressable
          onPress={handlePreview}
          style={styles.previewIconButton}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Feather name="eye" size={16} color={theme.colors.primarySocio} />
        </Pressable>
        <View style={[styles.radioCircle, isSelected && styles.radioCircleSelected]}>
          {isSelected && <View style={styles.radioInner} />}
        </View>
      </View>
    </Pressable>
  );
});
