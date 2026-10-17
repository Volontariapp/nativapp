import React, { useCallback, useState } from 'react';
import { View } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { useAppTheme, useStyles } from '@/context/ThemeContext';
import { AppText } from '@/components/typography/AppText';
import type { AppEvent } from '@/api/event/event.api';
import { useGetEvent } from '@/api/event/hooks/use-get-event';
import { EventPreviewModal } from './event-preview-modal';
import { EventPickerModal } from './event-picker-modal';
import { SelectedEventCard } from './selected-event-card';
import { EmptyEventCard } from './empty-event-card';
import { createEventSelectorStyles } from './event-selector.styles';

export interface EventSelectorProps {
  onSelectEvent: (eventId: string | undefined) => void;
  selectedEventId?: string;
}

export function EventSelector({
  onSelectEvent,
  selectedEventId,
}: EventSelectorProps): React.JSX.Element {
  const { theme } = useAppTheme();
  const styles = useStyles(createEventSelectorStyles);

  const { data: selectedEvent } = useGetEvent(selectedEventId);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [previewEvent, setPreviewEvent] = useState<AppEvent | null>(null);

  const openModal = useCallback(() => {
    setIsModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  const closePreview = useCallback(() => {
    setPreviewEvent(null);
  }, []);

  const handleSelectEvent = useCallback(
    (event: AppEvent) => {
      onSelectEvent(event.id);
      setIsModalOpen(false);
    },
    [onSelectEvent],
  );

  const handleClear = useCallback(() => {
    onSelectEvent(undefined);
    setIsModalOpen(false);
  }, [onSelectEvent]);

  return (
    <>
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <AppText style={styles.sectionLabel}>Événement associé</AppText>
          {selectedEvent != null ? (
            <View style={styles.linkedBadge}>
              <Feather name="check" size={12} color={theme.colors.primaryEco} />
              <AppText style={styles.linkedBadgeText}>Lié</AppText>
            </View>
          ) : (
            <AppText style={styles.optionalBadge}>Optionnel</AppText>
          )}
        </View>

        {selectedEvent != null ? (
          <SelectedEventCard
            event={selectedEvent}
            onPreview={() => {
              setPreviewEvent(selectedEvent);
            }}
            onChange={openModal}
            onClear={handleClear}
          />
        ) : (
          <EmptyEventCard onPress={openModal} />
        )}
      </View>

      {isModalOpen && (
        <EventPickerModal
          visible
          selectedEventId={selectedEventId}
          onClose={closeModal}
          onSelect={handleSelectEvent}
          onClear={handleClear}
          onPreview={setPreviewEvent}
        />
      )}

      <EventPreviewModal
        visible={previewEvent !== null}
        event={previewEvent}
        onClose={closePreview}
      />
    </>
  );
}
