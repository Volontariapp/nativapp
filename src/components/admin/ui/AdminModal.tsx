import React from 'react';
import { View, StyleSheet, Modal } from 'react-native';
import { theme } from '@/shared/themes/theme';
import { AppText } from '@/components/typography/AppText';
import { AppKeyboardAvoidingView } from '@/components/layout/AppKeyboardAvoidingView';
import { AppKeyboardScrollView } from '@/components/layout/AppKeyboardScrollView';

export interface AdminModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  scrollable?: boolean;
  children: React.ReactNode;
}

export function AdminModal({
  visible,
  onClose,
  title,
  scrollable = true,
  children,
}: AdminModalProps): React.JSX.Element {
  return (
    <Modal animationType="slide" transparent={true} visible={visible} onRequestClose={onClose}>
      <AppKeyboardAvoidingView style={styles.modalOverlay} bottomOffset={10}>
        <View style={styles.modalContent}>
          {scrollable ? (
            <AppKeyboardScrollView contentContainerStyle={styles.modalScroll} bottomOffset={40}>
              <AppText style={styles.modalTitle}>{title}</AppText>
              {children}
            </AppKeyboardScrollView>
          ) : (
            <View style={styles.modalScroll}>
              <AppText style={styles.modalTitle}>{title}</AppText>
              {children}
            </View>
          )}
        </View>
      </AppKeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  modalContent: {
    width: '100%',
    minWidth: '90%',
    maxHeight: '90%',
    flexShrink: 1,
    backgroundColor: theme.colors.white,
    borderRadius: theme.radius.md,
    overflow: 'hidden',
  },
  modalScroll: {
    padding: theme.spacing.xl,
    paddingBottom: theme.spacing.xxl,
    gap: theme.spacing.lg,
  },
  modalTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: '700',
    color: theme.colors.black,
    marginBottom: theme.spacing.sm,
  },
});
