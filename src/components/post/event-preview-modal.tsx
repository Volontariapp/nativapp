import React from 'react';
import { View, StyleSheet, Modal, Pressable } from 'react-native';
import { theme } from '@/shared/themes/theme';
import { AppText } from '@/components/typography/AppText';
import { AppButton } from '@/components/buttons/AppButton';
import type { AppEvent } from '@/api/event/event.api';
import { EventType } from '@volontariapp/contracts';

interface EventPreviewModalProps {
  visible: boolean;
  event: AppEvent | null;
  onClose: () => void;
}

export function EventPreviewModal({
  visible,
  event,
  onClose,
}: EventPreviewModalProps): React.JSX.Element {
  if (!event) {
    return (
      <Modal visible={visible} transparent animationType="fade">
        <View />
      </Modal>
    );
  }

  const isSocial =
    event.type === EventType.EVENT_TYPE_SOCIAL ||
    String(event.type) === EventType[EventType.EVENT_TYPE_SOCIAL];
  const typeLabel = isSocial ? 'Social' : 'Écologie';

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFillObject} onPress={onClose} />
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <AppText style={styles.title}>{event.title}</AppText>
            <Pressable onPress={onClose} style={styles.closeButton}>
              <AppText style={styles.closeText}>✕</AppText>
            </Pressable>
          </View>

          <View style={styles.section}>
            <AppText style={styles.label}>Description</AppText>
            <AppText style={styles.value}>{event.description}</AppText>
          </View>

          <View style={styles.row}>
            <View style={styles.flex1}>
              <AppText style={styles.label}>Début</AppText>
              <AppText style={styles.value}>
                {new Date(event.startAt).toLocaleDateString('fr-FR')}
              </AppText>
            </View>
            <View style={styles.flex1}>
              <AppText style={styles.label}>Fin</AppText>
              <AppText style={styles.value}>
                {new Date(event.endAt).toLocaleDateString('fr-FR')}
              </AppText>
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.flex1}>
              <AppText style={styles.label}>Localisation</AppText>
              <AppText style={styles.value}>{event.localisationName}</AppText>
            </View>
            <View style={styles.flex1}>
              <AppText style={styles.label}>Type</AppText>
              <AppText style={styles.value}>{typeLabel}</AppText>
            </View>
          </View>

          <AppButton text="Fermer" onPress={onClose} style={styles.closeButtonAction} />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    maxHeight: '80%',
    width: '90%',
    alignSelf: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    marginRight: theme.spacing.md,
  },
  closeButton: {
    padding: theme.spacing.sm,
  },
  closeText: {
    fontSize: 24,
    color: theme.colors.grey,
  },
  section: {
    marginBottom: theme.spacing.lg,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.grey,
    marginBottom: theme.spacing.xs,
  },
  value: {
    fontSize: 14,
    color: theme.colors.black,
  },
  row: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  flex1: {
    flex: 1,
  },
  closeButtonAction: {
    marginTop: theme.spacing.lg,
  },
});
