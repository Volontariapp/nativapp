import React, { memo, useCallback, useState } from 'react';
import { View, StyleSheet, Pressable, ActivityIndicator, FlatList } from 'react-native';
import { theme } from '@/shared/themes/theme';
import { AppText } from '@/components/typography/AppText';
import type { AppEvent } from '@/api/event/event.api';
import { useGetMyEvents } from '@/api/event/hooks/use-get-my-events';
import { EventPreviewModal } from './event-preview-modal';

interface EventItemProps {
  event: AppEvent;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onPreview: (event: AppEvent) => void;
}

const EventItem = memo(function EventItem({
  event,
  isSelected,
  onSelect,
  onPreview,
}: EventItemProps) {
  const handleSelect = useCallback(() => { onSelect(event.id); }, [event.id, onSelect]);
  const handlePreview = useCallback(
    (e: { stopPropagation: () => void }) => {
      e.stopPropagation();
      onPreview(event);
    },
    [event, onPreview],
  );

  return (
    <Pressable
      style={[styles.eventItem, isSelected && styles.eventItemSelected]}
      onPress={handleSelect}
    >
      <View style={styles.eventItemContent}>
        <AppText style={styles.eventItemTitle} numberOfLines={1}>
          {event.title}
        </AppText>
        <AppText style={styles.eventItemSubtitle}>{event.localisationName}</AppText>
      </View>
      <Pressable onPress={handlePreview} style={styles.previewButton}>
        <AppText style={styles.previewButtonText}>👁</AppText>
      </Pressable>
    </Pressable>
  );
});

interface EventSelectorProps {
  onSelectEvent: (eventId: string | undefined) => void;
  selectedEventId?: string;
}

export function EventSelector({
  onSelectEvent,
  selectedEventId,
}: EventSelectorProps): React.JSX.Element {
  const { data, isLoading } = useGetMyEvents(100);
  const [isExpanded, setIsExpanded] = useState(false);
  const [previewEvent, setPreviewEvent] = useState<AppEvent | null>(null);

  const allEvents = data?.pages.flatMap((page) => page.events) ?? [];
  const selectedEvent = allEvents.find((e) => e.id === selectedEventId);

  const handleSelectEvent = useCallback(
    (eventId: string) => {
      onSelectEvent(eventId);
      setIsExpanded(false);
    },
    [onSelectEvent],
  );

  const handleClear = useCallback(() => {
    onSelectEvent(undefined);
    setIsExpanded(false);
  }, [onSelectEvent]);

  const handlePreviewEvent = useCallback((event: AppEvent) => {
    setPreviewEvent(event);
  }, []);

  const keyExtractor = useCallback((event: AppEvent) => event.id, []);

  const renderItem = useCallback(
    ({ item }: { item: AppEvent }) => (
      <EventItem
        event={item}
        isSelected={selectedEventId === item.id}
        onSelect={handleSelectEvent}
        onPreview={handlePreviewEvent}
      />
    ),
    [selectedEventId, handleSelectEvent, handlePreviewEvent],
  );

  return (
    <>
      <View style={styles.container}>
        <AppText style={styles.label}>Événement (optionnel)</AppText>
        <Pressable
          style={[styles.selector, isExpanded && styles.selectorExpanded]}
          onPress={() => {
            setIsExpanded(!isExpanded);
          }}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color={theme.colors.primarySocio} />
          ) : selectedEvent ? (
            <View style={styles.selectedEventContent}>
              <AppText style={styles.selectedEventText} numberOfLines={1}>
                {selectedEvent.title}
              </AppText>
              <Pressable
                onPress={() => {
                  handleClear();
                }}
                style={styles.clearButton}
              >
                <AppText style={styles.clearText}>✕</AppText>
              </Pressable>
            </View>
          ) : (
            <AppText style={styles.placeholderText}>Sélectionner un événement...</AppText>
          )}
        </Pressable>

        {isExpanded && (
          <View style={styles.dropdown}>
            {allEvents.length === 0 ? (
              <AppText style={styles.emptyText}>Aucun événement disponible</AppText>
            ) : (
              <FlatList
                style={styles.eventsList}
                nestedScrollEnabled
                data={allEvents}
                keyExtractor={keyExtractor}
                renderItem={renderItem}
              />
            )}
          </View>
        )}
      </View>

      <EventPreviewModal
        visible={previewEvent !== null}
        event={previewEvent}
        onClose={() => {
          setPreviewEvent(null);
        }}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing.lg,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: theme.spacing.sm,
    color: theme.colors.black,
  },
  selector: {
    borderWidth: 1,
    borderColor: theme.colors.lightGrey,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.white,
  },
  selectorExpanded: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    borderBottomColor: theme.colors.grey,
  },
  selectedEventContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectedEventText: {
    fontSize: 14,
    color: theme.colors.black,
    flex: 1,
    fontWeight: '500',
  },
  clearButton: {
    padding: theme.spacing.sm,
    marginLeft: theme.spacing.sm,
  },
  clearText: {
    fontSize: 16,
    color: theme.colors.grey,
  },
  placeholderText: {
    fontSize: 14,
    color: theme.colors.grey,
  },
  dropdown: {
    borderWidth: 1,
    borderColor: theme.colors.lightGrey,
    borderTopWidth: 0,
    borderBottomLeftRadius: theme.radius.md,
    borderBottomRightRadius: theme.radius.md,
    maxHeight: '50%',
    backgroundColor: theme.colors.white,
  },
  eventsList: {
    maxHeight: '100%',
  },
  eventItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.lightGrey,
  },
  eventItemSelected: {
    backgroundColor: 'rgba(0, 0, 0, 0.03)',
  },
  eventItemContent: {
    flex: 1,
  },
  eventItemTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.black,
    marginBottom: theme.spacing.xs,
  },
  eventItemSubtitle: {
    fontSize: 12,
    color: theme.colors.grey,
  },
  previewButton: {
    padding: theme.spacing.sm,
    marginLeft: theme.spacing.sm,
  },
  previewButtonText: {
    fontSize: 16,
  },
  emptyText: {
    fontSize: 14,
    color: theme.colors.grey,
    padding: theme.spacing.md,
    textAlign: 'center',
  },
});
