import React, { useState } from 'react';
import { View, StyleSheet, Pressable, Modal } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { useAppTheme, useStyles } from '@/context/ThemeContext';
import { AppText } from '@/components/typography/AppText';
import { AppButton } from '@/components/buttons/AppButton';
import type { AppEvent } from '@/api/event/event.api';
import { EventPickerList } from './event-picker-list';
import { EventPickerSearchBox } from './event-picker-search-box';
import { createEventPickerStyles } from './event-picker-modal.styles';
import { useEventPickerSearch } from './use-event-picker-search';

interface EventPickerModalProps {
  visible: boolean;
  selectedEventId?: string;
  onClose: () => void;
  onSelect: (event: AppEvent) => void;
  onClear: () => void;
  onPreview: (event: AppEvent) => void;
}

const getSubtitle = (isLoading: boolean, count: number): string =>
  isLoading ? 'Chargement...' : `${String(count)} événement(s) affiché(s)`;

const DetachButton = ({ onPress }: { onPress: () => void }): React.JSX.Element => {
  const styles = useStyles(createEventPickerStyles);

  return (
    <AppButton
      text="Dissocier l'événement actuel"
      variant="secondary"
      icon="trash-2"
      onPress={onPress}
      style={styles.detachButton}
    />
  );
};

export function EventPickerModal({
  visible,
  selectedEventId,
  onClose,
  onSelect,
  onClear,
  onPreview,
}: EventPickerModalProps): React.JSX.Element {
  const { theme } = useAppTheme();
  const styles = useStyles(createEventPickerStyles);
  const [searchQuery, setSearchQuery] = useState('');
  const search = useEventPickerSearch(searchQuery);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <Pressable style={StyleSheet.absoluteFillObject} onPress={onClose} />

        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <View>
              <AppText style={styles.modalTitle}>Choisir un événement</AppText>
              <AppText style={styles.modalSubtitle}>
                {getSubtitle(search.isLoading, search.events.length)}
              </AppText>
            </View>
            <Pressable
              style={styles.modalCloseButton}
              onPress={onClose}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Feather name="x" size={22} color={theme.colors.grey} />
            </Pressable>
          </View>

          <EventPickerSearchBox value={searchQuery} onChange={setSearchQuery} />

          <EventPickerList
            {...search}
            isSearching={searchQuery.trim() !== ''}
            selectedEventId={selectedEventId}
            onSelect={onSelect}
            onPreview={onPreview}
          />

          <View style={styles.modalFooter}>
            {selectedEventId !== undefined && <DetachButton onPress={onClear} />}
            <AppButton text="Fermer" variant="secondary" onPress={onClose} />
          </View>
        </View>
      </View>
    </Modal>
  );
}
