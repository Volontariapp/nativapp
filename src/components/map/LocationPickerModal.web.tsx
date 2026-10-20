import React from 'react';
import { Modal, View, StyleSheet, Pressable } from 'react-native';
import { AppText } from '@/components/typography/AppText';
import { AppIcons } from '@/components/media/AppIcons';
import { theme } from '@/shared/themes/theme';
import type { LocationPickerModalProps } from './LocationPickerModal';

export function LocationPickerModal({
  visible,
  onClose,
}: LocationPickerModalProps): React.JSX.Element {
  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Pressable onPress={onClose} style={styles.closeButton}>
            <AppIcons icon="x" size={24} color={theme.colors.text} />
          </Pressable>
          <AppText style={styles.title}>Carte interactive</AppText>
        </View>
        <View style={styles.body}>
          <AppText style={styles.text}>
            La sélection directe sur carte est optimisée pour l'application mobile.
          </AppText>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.lightGrey,
  },
  closeButton: {
    padding: theme.spacing.xs,
    marginRight: theme.spacing.sm,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  body: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  text: {
    color: theme.colors.grey,
    textAlign: 'center',
  },
});
