import React, { memo, useCallback, useMemo, useState } from 'react';
import {
  View,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  FlatList,
  Modal,
  TextInput,
} from 'react-native';
import { useAppTheme, useStyles } from '@/context/ThemeContext';
import type { AppTheme } from '@/shared/themes/theme';
import { AppText } from '@/components/typography/AppText';
import { AppButton } from '@/components/buttons/AppButton';
import type { AppEvent } from '@/api/event/event.api';
import { useGetMyEvents } from '@/api/event/hooks/use-get-my-events';
import { EventPreviewModal } from './event-preview-modal';
import { mapEventType } from '@/shared/lib/event-mappers.utils';
import { formatDate } from '@/shared/lib/format-date.utils';
import { EventType } from '@volontariapp/contracts';
import Feather from 'react-native-vector-icons/Feather';

interface EventItemCardProps {
  event: AppEvent;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onPreview: (event: AppEvent) => void;
}

const EventItemCard = memo(function EventItemCard({
  event,
  isSelected,
  onSelect,
  onPreview,
}: EventItemCardProps) {
  const { theme } = useAppTheme();
  const styles = useStyles(createStyles);

  const isSocial =
    event.type === EventType.EVENT_TYPE_SOCIAL ||
    String(event.type) === EventType[EventType.EVENT_TYPE_SOCIAL];
  const typeLabel = mapEventType(event.type);

  const handleSelect = useCallback(() => {
    onSelect(event.id);
  }, [event.id, onSelect]);

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
          <View
            style={[
              styles.typeBadgeSmall,
              isSocial ? styles.typeBadgeSocial : styles.typeBadgeEco,
            ]}
          >
            <AppText
              style={[
                styles.typeBadgeText,
                isSocial ? styles.typeBadgeTextSocial : styles.typeBadgeTextEco,
              ]}
            >
              {typeLabel}
            </AppText>
          </View>
          <AppText style={styles.modalEventDate}>
            {formatDate(event.startAt, {
              day: '2-digit',
              month: 'short',
            })}
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

export interface EventSelectorProps {
  onSelectEvent: (eventId: string | undefined) => void;
  selectedEventId?: string;
}

export function EventSelector({
  onSelectEvent,
  selectedEventId,
}: EventSelectorProps): React.JSX.Element {
  const { theme } = useAppTheme();
  const styles = useStyles(createStyles);

  const { data, isLoading } = useGetMyEvents(100);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [previewEvent, setPreviewEvent] = useState<AppEvent | null>(null);

  const allEvents = useMemo(() => {
    return data?.pages.flatMap((page) => page.events) ?? [];
  }, [data]);

  const selectedEvent = useMemo(() => {
    return allEvents.find((e) => e.id === selectedEventId);
  }, [allEvents, selectedEventId]);

  const filteredEvents = useMemo(() => {
    const trimmed = searchQuery.trim().toLowerCase();
    if (trimmed === '') {
      return allEvents;
    }
    return allEvents.filter(
      (e) =>
        e.title.toLowerCase().includes(trimmed) ||
        e.localisationName.toLowerCase().includes(trimmed),
    );
  }, [allEvents, searchQuery]);

  const handleSelectEvent = useCallback(
    (eventId: string) => {
      onSelectEvent(eventId);
      setIsModalOpen(false);
    },
    [onSelectEvent],
  );

  const handleClear = useCallback(() => {
    onSelectEvent(undefined);
    setIsModalOpen(false);
  }, [onSelectEvent]);

  const handlePreviewEvent = useCallback((event: AppEvent) => {
    setPreviewEvent(event);
  }, []);

  const renderEventItem = useCallback(
    ({ item }: { item: AppEvent }) => (
      <EventItemCard
        event={item}
        isSelected={selectedEventId === item.id}
        onSelect={handleSelectEvent}
        onPreview={handlePreviewEvent}
      />
    ),
    [selectedEventId, handleSelectEvent, handlePreviewEvent],
  );

  const isSelectedSocial =
    selectedEvent !== undefined &&
    (selectedEvent.type === EventType.EVENT_TYPE_SOCIAL ||
      String(selectedEvent.type) === EventType[EventType.EVENT_TYPE_SOCIAL]);

  return (
    <>
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <AppText style={styles.sectionLabel}>Événement associé</AppText>
          {selectedEvent !== undefined ? (
            <View style={styles.linkedBadge}>
              <Feather name="check" size={12} color={theme.colors.primaryEco} />
              <AppText style={styles.linkedBadgeText}>Lié</AppText>
            </View>
          ) : (
            <AppText style={styles.optionalBadge}>Optionnel</AppText>
          )}
        </View>

        {selectedEvent !== undefined ? (
          /* Card: Event is selected */
          <View style={styles.selectedCard}>
            <View style={styles.selectedCardHeader}>
              <View
                style={[
                  styles.typeBadge,
                  isSelectedSocial ? styles.typeBadgeSocial : styles.typeBadgeEco,
                ]}
              >
                <Feather
                  name={isSelectedSocial ? 'users' : 'globe'}
                  size={12}
                  color={isSelectedSocial ? theme.colors.primarySocio : theme.colors.primaryEco}
                />
                <AppText
                  style={[
                    styles.typeBadgeText,
                    isSelectedSocial ? styles.typeBadgeTextSocial : styles.typeBadgeTextEco,
                  ]}
                >
                  {mapEventType(selectedEvent.type)}
                </AppText>
              </View>

              <AppText style={styles.selectedCardDate}>
                {formatDate(selectedEvent.startAt, {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                })}
              </AppText>
            </View>

            <AppText style={styles.selectedCardTitle} numberOfLines={2}>
              {selectedEvent.title}
            </AppText>

            <View style={styles.selectedCardMetaRow}>
              <Feather name="map-pin" size={13} color={theme.colors.grey} />
              <AppText style={styles.selectedCardLocation} numberOfLines={1}>
                {selectedEvent.localisationName}
              </AppText>
            </View>

            <View style={styles.selectedCardActions}>
              <Pressable
                style={styles.cardActionButton}
                onPress={() => {
                  setPreviewEvent(selectedEvent);
                }}
              >
                <Feather name="eye" size={14} color={theme.colors.primarySocio} />
                <AppText style={styles.cardActionTextSocio}>Aperçu</AppText>
              </Pressable>

              <Pressable
                style={styles.cardActionButton}
                onPress={() => {
                  setIsModalOpen(true);
                }}
              >
                <Feather name="refresh-cw" size={13} color={theme.colors.grey} />
                <AppText style={styles.cardActionText}>Changer</AppText>
              </Pressable>

              <Pressable style={styles.cardActionButton} onPress={handleClear}>
                <Feather name="x" size={14} color={theme.colors.danger} />
                <AppText style={styles.cardActionTextDanger}>Retirer</AppText>
              </Pressable>
            </View>
          </View>
        ) : (
          /* Card: No event selected */
          <Pressable
            style={({ pressed }) => [styles.emptyCard, pressed && styles.emptyCardPressed]}
            onPress={() => {
              setIsModalOpen(true);
            }}
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
        )}
      </View>

      {/* Modal: Event Picker */}
      <Modal
        visible={isModalOpen}
        transparent
        animationType="slide"
        onRequestClose={() => {
          setIsModalOpen(false);
        }}
      >
        <View style={styles.modalOverlay}>
          <Pressable
            style={StyleSheet.absoluteFillObject}
            onPress={() => {
              setIsModalOpen(false);
            }}
          />

          <View style={styles.modalContainer}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <View>
                <AppText style={styles.modalTitle}>Choisir un événement</AppText>
                <AppText style={styles.modalSubtitle}>
                  {isLoading
                    ? 'Chargement...'
                    : `${String(filteredEvents.length)} événement(s) disponible(s)`}
                </AppText>
              </View>
              <Pressable
                style={styles.modalCloseButton}
                onPress={() => {
                  setIsModalOpen(false);
                }}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Feather name="x" size={22} color={theme.colors.grey} />
              </Pressable>
            </View>

            {/* Search Input */}
            <View style={styles.searchBox}>
              <Feather name="search" size={16} color={theme.colors.grey} style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Rechercher par titre ou lieu..."
                placeholderTextColor={theme.colors.grey}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              {searchQuery !== '' && (
                <Pressable
                  onPress={() => {
                    setSearchQuery('');
                  }}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Feather name="x-circle" size={16} color={theme.colors.grey} />
                </Pressable>
              )}
            </View>

            {/* Event List */}
            {isLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={theme.colors.primaryEco} />
                <AppText style={styles.loadingText}>Chargement de vos événements...</AppText>
              </View>
            ) : filteredEvents.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Feather name="calendar" size={40} color={theme.colors.grey} />
                <AppText style={styles.emptyTitle}>
                  {searchQuery !== ''
                    ? 'Aucun résultat trouvé'
                    : 'Aucun événement disponible'}
                </AppText>
                <AppText style={styles.emptySubtitle}>
                  {searchQuery !== ''
                    ? 'Essayez de modifier vos termes de recherche'
                    : "Vous n'avez pas encore d'événements à associer."}
                </AppText>
              </View>
            ) : (
              <FlatList
                data={filteredEvents}
                keyExtractor={(item) => item.id}
                renderItem={renderEventItem}
                style={styles.modalList}
                showsVerticalScrollIndicator={false}
              />
            )}

            {/* Modal Bottom Actions */}
            <View style={styles.modalFooter}>
              {selectedEventId !== undefined && (
                <AppButton
                  text="Dissocier l'événement actuel"
                  variant="secondary"
                  icon="trash-2"
                  onPress={handleClear}
                  style={styles.detachButton}
                />
              )}
              <AppButton
                text="Fermer"
                variant="secondary"
                onPress={() => {
                  setIsModalOpen(false);
                }}
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* Preview Modal */}
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

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      marginBottom: theme.spacing.lg,
    },
    headerRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: theme.spacing.sm,
    },
    sectionLabel: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.text,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    optionalBadge: {
      fontSize: 12,
      color: theme.colors.grey,
      fontWeight: '500',
    },
    linkedBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      backgroundColor: theme.colors.badgeEcoBackground,
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: 2,
      borderRadius: theme.radius.full,
    },
    linkedBadgeText: {
      fontSize: 12,
      fontWeight: '600',
      color: theme.colors.primaryEco,
    },
    emptyCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.white,
      borderWidth: 1.5,
      borderColor: theme.colors.lightGrey,
      borderStyle: 'dashed',
      borderRadius: theme.radius.lg,
      padding: theme.spacing.md,
      gap: theme.spacing.md,
    },
    emptyCardPressed: {
      backgroundColor: theme.colors.lightGrey + '30',
      borderColor: theme.colors.primaryEco,
    },
    emptyCardIconContainer: {
      width: 44,
      height: 44,
      borderRadius: theme.radius.md,
      backgroundColor: theme.colors.badgeEcoBackground,
      justifyContent: 'center',
      alignItems: 'center',
    },
    emptyCardTextContainer: {
      flex: 1,
    },
    emptyCardTitle: {
      fontSize: 15,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: 2,
    },
    emptyCardSubtitle: {
      fontSize: 12,
      color: theme.colors.grey,
      lineHeight: 16,
    },
    emptyCardAction: {
      padding: theme.spacing.xs,
    },
    selectedCard: {
      backgroundColor: theme.colors.white,
      borderWidth: 1.5,
      borderColor: theme.colors.primaryEco,
      borderRadius: theme.radius.lg,
      padding: theme.spacing.md,
      shadowColor: theme.colors.primaryEco,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
      elevation: 2,
    },
    selectedCardHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: theme.spacing.sm,
    },
    selectedCardTitle: {
      fontSize: 16,
      fontWeight: 'bold',
      color: theme.colors.text,
      marginBottom: theme.spacing.xs,
    },
    selectedCardMetaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      marginBottom: theme.spacing.md,
    },
    selectedCardLocation: {
      fontSize: 13,
      color: theme.colors.grey,
      flex: 1,
    },
    selectedCardDate: {
      fontSize: 12,
      fontWeight: '500',
      color: theme.colors.grey,
    },
    selectedCardActions: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      alignItems: 'center',
      gap: theme.spacing.sm,
      borderTopWidth: 1,
      borderTopColor: theme.colors.lightGrey + '80',
      paddingTop: theme.spacing.sm,
    },
    cardActionButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: 6,
      borderRadius: theme.radius.sm,
      backgroundColor: theme.colors.background,
    },
    cardActionText: {
      fontSize: 12,
      fontWeight: '600',
      color: theme.colors.grey,
    },
    cardActionTextSocio: {
      fontSize: 12,
      fontWeight: '600',
      color: theme.colors.primarySocio,
    },
    cardActionTextDanger: {
      fontSize: 12,
      fontWeight: '600',
      color: theme.colors.danger,
    },
    typeBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: 3,
      borderRadius: theme.radius.full,
      gap: 4,
    },
    typeBadgeSmall: {
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: theme.radius.full,
    },
    typeBadgeEco: {
      backgroundColor: theme.colors.badgeEcoBackground,
    },
    typeBadgeSocial: {
      backgroundColor: theme.colors.badgeSocioBackground,
    },
    typeBadgeText: {
      fontSize: 11,
      fontWeight: '600',
    },
    typeBadgeTextEco: {
      color: theme.colors.primaryEco,
    },
    typeBadgeTextSocial: {
      color: theme.colors.primarySocio,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: theme.colors.blackOverlay,
      justifyContent: 'flex-end',
    },
    modalContainer: {
      backgroundColor: theme.colors.white,
      borderTopLeftRadius: theme.radius.lg,
      borderTopRightRadius: theme.radius.lg,
      paddingHorizontal: theme.spacing.lg,
      paddingTop: theme.spacing.lg,
      paddingBottom: theme.spacing.xl,
      maxHeight: '85%',
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: theme.spacing.md,
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme.colors.text,
    },
    modalSubtitle: {
      fontSize: 13,
      color: theme.colors.grey,
      marginTop: 2,
    },
    modalCloseButton: {
      padding: theme.spacing.xs,
    },
    searchBox: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.background,
      borderRadius: theme.radius.md,
      paddingHorizontal: theme.spacing.md,
      marginBottom: theme.spacing.md,
      borderWidth: 1,
      borderColor: theme.colors.lightGrey,
    },
    searchIcon: {
      marginRight: theme.spacing.sm,
    },
    searchInput: {
      flex: 1,
      paddingVertical: theme.spacing.sm,
      fontSize: 14,
      color: theme.colors.text,
    },
    modalList: {
      maxHeight: 350,
      marginBottom: theme.spacing.md,
    },
    modalEventItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: theme.spacing.md,
      borderRadius: theme.radius.md,
      backgroundColor: theme.colors.background,
      marginBottom: theme.spacing.sm,
      borderWidth: 1.5,
      borderColor: 'transparent',
    },
    modalEventItemSelected: {
      borderColor: theme.colors.primaryEco,
      backgroundColor: theme.colors.badgeEcoBackground + '40',
    },
    modalEventContent: {
      flex: 1,
      paddingRight: theme.spacing.md,
    },
    modalEventTopRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 4,
    },
    modalEventDate: {
      fontSize: 11,
      color: theme.colors.grey,
    },
    modalEventTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: 4,
    },
    modalEventLocationRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    modalEventSubtitle: {
      fontSize: 12,
      color: theme.colors.grey,
      flex: 1,
    },
    modalEventActions: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
    },
    previewIconButton: {
      padding: theme.spacing.xs,
      borderRadius: theme.radius.sm,
      backgroundColor: theme.colors.badgeSocioBackground,
    },
    radioCircle: {
      width: 20,
      height: 20,
      borderRadius: 10,
      borderWidth: 2,
      borderColor: theme.colors.grey,
      justifyContent: 'center',
      alignItems: 'center',
    },
    radioCircleSelected: {
      borderColor: theme.colors.primaryEco,
    },
    radioInner: {
      width: 10,
      height: 10,
      borderRadius: 5,
      backgroundColor: theme.colors.primaryEco,
    },
    loadingContainer: {
      paddingVertical: theme.spacing.xxl,
      alignItems: 'center',
    },
    loadingText: {
      fontSize: 14,
      color: theme.colors.grey,
      marginTop: theme.spacing.md,
    },
    emptyContainer: {
      paddingVertical: theme.spacing.xxl,
      alignItems: 'center',
    },
    emptyTitle: {
      fontSize: 16,
      fontWeight: 'bold',
      color: theme.colors.text,
      marginTop: theme.spacing.md,
      marginBottom: 4,
    },
    emptySubtitle: {
      fontSize: 13,
      color: theme.colors.grey,
      textAlign: 'center',
      paddingHorizontal: theme.spacing.xl,
    },
    modalFooter: {
      gap: theme.spacing.sm,
      paddingTop: theme.spacing.sm,
      borderTopWidth: 1,
      borderTopColor: theme.colors.lightGrey,
    },
    detachButton: {
      marginBottom: 4,
    },
  });
