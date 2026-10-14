import React from 'react';
import { View, StyleSheet, Modal, Pressable, ActivityIndicator } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { AppText } from '@/components/typography/AppText';
import { AppButton } from '@/components/buttons/AppButton';
import { useAppTheme, useStyles } from '@/context/ThemeContext';
import type { AppTheme } from '@/shared/themes/theme';
import { EventState } from '@volontariapp/contracts';
import { normalizeEventState } from '@/shared/lib/event-mappers.utils';

export interface ConfirmStateChangeModalProps {
  visible: boolean;
  targetState: EventState | number | string | null;
  eventTitle?: string;
  isPending?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  testID?: string;
}

interface StateChangeDetails {
  title: string;
  description: string;
  consequences: string[];
  confirmLabel: string;
  isDestructive: boolean;
  icon: string;
}

const STATE_DETAILS: Record<number, StateChangeDetails> = {
  [EventState.EVENT_STATE_PUBLISHED]: {
    title: "Publier l'événement",
    description: "Êtes-vous sûr de vouloir publier cet événement ?",
    consequences: [
      'Il sera visible sur la carte et dans les flux de recherche.',
      'Les bénévoles pourront s’inscrire.',
      'Les notifications de recommandation pourront être envoyées.',
    ],
    confirmLabel: 'Oui, publier',
    isDestructive: false,
    icon: 'check-circle',
  },
  [EventState.EVENT_STATE_IN_PROGRESS]: {
    title: "Démarrer l'événement",
    description: "Êtes-vous prêt à lancer l'événement sur le terrain ?",
    consequences: [
      "Le statut passera à 'En cours'.",
      'La présence des participants pourra être validée en direct.',
    ],
    confirmLabel: 'Démarrer maintenant',
    isDestructive: false,
    icon: 'play-circle',
  },
  [EventState.EVENT_STATE_FINISHED]: {
    title: "Clôturer l'événement",
    description: "Confirmez-vous que la mission est terminée ?",
    consequences: [
      'Les points d’impact seront attribués aux participants confirmés.',
      "L'événement ne pourra plus être modifié.",
      'Les statistiques de participation seront consolidées.',
    ],
    confirmLabel: 'Clôturer la mission',
    isDestructive: false,
    icon: 'flag',
  },
  [EventState.EVENT_STATE_CANCELLED]: {
    title: "Annuler l'événement",
    description: "Attention : cette action est irréversible !",
    consequences: [
      'Tous les bénévoles inscrits recevront une notification d’annulation.',
      'Les inscriptions seront définitivement fermées.',
      'Cet événement ne pourra plus être réouvert.',
    ],
    confirmLabel: "Oui, annuler l'événement",
    isDestructive: true,
    icon: 'alert-triangle',
  },
};

const DEFAULT_DETAILS: StateChangeDetails = {
  title: "Changer l'état",
  description: 'Confirmez-vous le changement de statut ?',
  consequences: ['Le nouveau statut sera appliqué sur la plateforme.'],
  confirmLabel: 'Confirmer',
  isDestructive: false,
  icon: 'info',
};

export function ConfirmStateChangeModal({
  visible,
  targetState,
  eventTitle = '',
  isPending = false,
  onConfirm,
  onCancel,
  testID = 'confirm-state-change-modal',
}: ConfirmStateChangeModalProps): React.JSX.Element {
  const { theme } = useAppTheme();
  const styles = useStyles(createStyles);

  if (!visible || targetState === null) {
    return (
      <Modal visible={false} transparent onRequestClose={onCancel}>
        <View />
      </Modal>
    );
  }

  const normalizedState = normalizeEventState(targetState);
  const details = STATE_DETAILS[normalizedState] ?? DEFAULT_DETAILS;
  const isDestructive = details.isDestructive;

  const iconColor = isDestructive ? theme.colors.danger : theme.colors.primaryEco;
  const iconBg = isDestructive ? theme.colors.badgeRedBackground : theme.colors.badgeEcoBackground;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.overlay} testID={testID}>
        <Pressable
          style={StyleSheet.absoluteFillObject}
          onPress={isPending ? undefined : onCancel}
          accessibilityRole="button"
          accessibilityLabel="Annuler et fermer"
        />

        <View style={styles.card}>
          <View style={[styles.iconCircle, { backgroundColor: iconBg }]}>
            <Feather name={details.icon} size={28} color={iconColor} />
          </View>

          <AppText variant="title" style={styles.title}>
            {details.title}
          </AppText>

          <AppText variant="body" style={styles.eventTitleSnippet} numberOfLines={1}>
            {eventTitle}
          </AppText>

          <AppText variant="body" style={styles.description}>
            {details.description}
          </AppText>

          <View style={styles.consequencesBox}>
            <AppText style={styles.consequencesHeader}>Conséquences :</AppText>
            {details.consequences.map((item) => (
              <View key={item} style={styles.consequenceRow}>
                <Feather
                  name="chevron-right"
                  size={14}
                  color={isDestructive ? theme.colors.danger : theme.colors.primaryEco}
                  style={styles.bulletIcon}
                />
                <AppText style={styles.consequenceText}>{item}</AppText>
              </View>
            ))}
          </View>

          <View style={styles.actions}>
            <AppButton
              text="Annuler"
              variant="secondary"
              onPress={onCancel}
              disabled={isPending}
              style={styles.cancelButton}
            />

            <Pressable
              style={({ pressed }) => [
                styles.confirmButton,
                {
                  backgroundColor: isDestructive ? theme.colors.danger : theme.colors.primaryEco,
                  opacity: isPending ? 0.7 : pressed ? 0.85 : 1,
                },
              ]}
              onPress={onConfirm}
              disabled={isPending}
              accessibilityRole="button"
              accessibilityLabel={details.confirmLabel}
            >
              {isPending ? (
                <ActivityIndicator size="small" color={theme.colors.white} />
              ) : (
                <AppText style={styles.confirmButtonText}>{details.confirmLabel}</AppText>
              )}
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: theme.colors.blackOverlay,
      justifyContent: 'center',
      alignItems: 'center',
      padding: theme.spacing.lg,
    },
    card: {
      backgroundColor: theme.colors.white,
      borderRadius: theme.radius.lg,
      padding: theme.spacing.xl,
      width: '100%',
      maxWidth: 380,
      alignItems: 'center',
      ...theme.shadows.card,
    },
    iconCircle: {
      width: 56,
      height: 56,
      borderRadius: 28,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: theme.spacing.md,
    },
    title: {
      fontSize: theme.typography.fontSize.lg,
      fontWeight: theme.typography.fontWeight.bold,
      color: theme.colors.black,
      textAlign: 'center',
      marginBottom: theme.spacing.xs,
    },
    eventTitleSnippet: {
      fontSize: theme.typography.fontSize.sm,
      fontWeight: theme.typography.fontWeight.semibold,
      color: theme.colors.grey,
      textAlign: 'center',
      marginBottom: theme.spacing.md,
    },
    description: {
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.text,
      textAlign: 'center',
      marginBottom: theme.spacing.md,
    },
    consequencesBox: {
      backgroundColor: theme.colors.background,
      borderRadius: theme.radius.md,
      padding: theme.spacing.md,
      width: '100%',
      marginBottom: theme.spacing.xl,
    },
    consequencesHeader: {
      fontSize: theme.typography.fontSize.xs,
      fontWeight: theme.typography.fontWeight.bold,
      color: theme.colors.text,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      marginBottom: theme.spacing.xs,
    },
    consequenceRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      marginTop: theme.spacing.xs,
    },
    bulletIcon: {
      marginTop: 2,
      marginRight: theme.spacing.xs,
    },
    consequenceText: {
      fontSize: theme.typography.fontSize.xs,
      color: theme.colors.text,
      flex: 1,
      lineHeight: 18,
    },
    actions: {
      flexDirection: 'row',
      gap: theme.spacing.md,
      width: '100%',
    },
    cancelButton: {
      flex: 1,
    },
    confirmButton: {
      flex: 1,
      minHeight: 48,
      borderRadius: theme.radius.md,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: theme.spacing.md,
    },
    confirmButtonText: {
      color: theme.colors.white,
      fontWeight: theme.typography.fontWeight.bold,
      fontSize: theme.typography.fontSize.sm,
      textAlign: 'center',
    },
  });
