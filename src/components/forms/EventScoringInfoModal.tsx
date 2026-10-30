import React from 'react';
import { Modal, View, StyleSheet, Pressable, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Feather from 'react-native-vector-icons/Feather';
import { useAppTheme, useStyles } from '@/context/ThemeContext';
import type { AppTheme } from '@/shared/themes/theme';
import { AppText } from '@/components/typography/AppText';
import { AppIcons } from '@/components/media/AppIcons';
import { AppButton } from '@/components/buttons/AppButton';

export interface EventScoringInfoModalProps {
  visible: boolean;
  onClose: () => void;
  maxEstimatedPoints: number;
  organizerPoints: number;
  durationHours: number;
  maxParticipants: number;
}

export function EventScoringInfoModal({
  visible,
  onClose,
  maxEstimatedPoints,
  organizerPoints,
  durationHours,
  maxParticipants,
}: EventScoringInfoModalProps): React.JSX.Element {
  const insets = useSafeAreaInsets();
  const { theme } = useAppTheme();
  const styles = useStyles(createStyles);

  const displayParticipants = maxParticipants > 0 ? maxParticipants : 10;

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={[styles.container, { paddingTop: insets.top }]}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={onClose} style={styles.closeButton} hitSlop={12}>
            <AppIcons icon="x" size={24} color={theme.colors.text} />
          </Pressable>
          <View style={styles.headerTitleContainer}>
            <AppText style={styles.headerTitle}>Points d'impact & Récompenses</AppText>
            <AppText style={styles.headerSubtitle}>Algorithme de calcul dynamique</AppText>
          </View>
          <View style={styles.headerRightSpacer} />
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 24 }]}
        >
          {/* Simulation Summary Box */}
          <View style={styles.summaryCard}>
            <View style={styles.summaryBadge}>
              <Feather name="award" size={20} color={theme.colors.primaryEco} />
              <AppText style={styles.summaryBadgeText}>Simulation pour cet événement</AppText>
            </View>

            <View style={styles.metricsRow}>
              <View style={styles.metricItem}>
                <AppText style={styles.metricLabel}>Par participant</AppText>
                <AppText style={styles.metricValueEco}>Jusqu'à +{maxEstimatedPoints} pts</AppText>
                <AppText style={styles.metricHint}>selon ordre d'arrivée</AppText>
              </View>
              <View style={styles.metricDivider} />
              <View style={styles.metricItem}>
                <AppText style={styles.metricLabel}>Prime créateur</AppText>
                <AppText style={styles.metricValueSocio}>+{organizerPoints} pts</AppText>
                <AppText style={styles.metricHint}>dès 3 présents</AppText>
              </View>
            </View>

            <View style={styles.summaryFooter}>
              <Feather name="info" size={14} color={theme.colors.grey} />
              <AppText style={styles.summaryFooterText}>
                Basé sur {durationHours}h et {displayParticipants} participants attendus.
              </AppText>
            </View>
          </View>

          {/* How it works */}
          <AppText style={styles.sectionTitle}>Comment fonctionne le scoring ?</AppText>

          <View style={styles.ruleCard}>
            <View style={[styles.ruleIconBox, { backgroundColor: '#eef3ef' }]}>
              <Feather name="clock" size={18} color={theme.colors.primaryEco} />
            </View>
            <View style={styles.ruleContent}>
              <AppText style={styles.ruleHeading}>Durée de la mission</AppText>
              <AppText style={styles.ruleText}>
                Le coefficient d'impact s'ajuste selon la durée de la mission afin de valoriser
                l'engagement dans le temps.
              </AppText>
            </View>
          </View>

          <View style={styles.ruleCard}>
            <View style={[styles.ruleIconBox, { backgroundColor: '#e6f0f3' }]}>
              <Feather name="check-circle" size={18} color={theme.colors.primarySocio} />
            </View>
            <View style={styles.ruleContent}>
              <AppText style={styles.ruleHeading}>Émargement obligatoire</AppText>
              <AppText style={styles.ruleText}>
                Seuls les participants dont la présence est validée sur place par l'organisateur
                reçoivent des points à la clôture.
              </AppText>
            </View>
          </View>

          <View style={styles.ruleCard}>
            <View style={[styles.ruleIconBox, { backgroundColor: '#fef3c7' }]}>
              <Feather name="zap" size={18} color={theme.colors.goldText} />
            </View>
            <View style={styles.ruleContent}>
              <AppText style={styles.ruleHeading}>Prime de réactivité</AppText>
              <AppText style={styles.ruleText}>
                Les premiers bénévoles à s'inscrire reçoivent un bonus grâce à une loi de
                distribution dégressive équitable.
              </AppText>
            </View>
          </View>

          <View style={styles.ruleCard}>
            <View style={[styles.ruleIconBox, { backgroundColor: '#f3e8ff' }]}>
              <Feather name="shield" size={18} color="#7c3aed" />
            </View>
            <View style={styles.ruleContent}>
              <AppText style={styles.ruleHeading}>Protection anti-triche créateur</AppText>
              <AppText style={styles.ruleText}>
                La prime de l'organisateur se débloque uniquement si au moins 3 participants
                différents sont présents sur place.
              </AppText>
            </View>
          </View>

          <View style={styles.actionContainer}>
            <AppButton
              text="J'ai compris"
              variant="eco"
              onPress={onClose}
              style={styles.closeModalButton}
            />
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.separator,
    },
    closeButton: {
      padding: theme.spacing.xs,
    },
    headerTitleContainer: {
      flex: 1,
      alignItems: 'center',
    },
    headerTitle: {
      fontSize: 16,
      fontWeight: 'bold',
      color: theme.colors.text,
    },
    headerSubtitle: {
      fontSize: 12,
      color: theme.colors.grey,
      marginTop: 2,
    },
    headerRightSpacer: {
      width: 32,
    },
    scroll: {
      flex: 1,
    },
    scrollContent: {
      padding: theme.spacing.lg,
    },
    summaryCard: {
      backgroundColor: theme.colors.white,
      borderRadius: theme.radius.lg,
      padding: theme.spacing.lg,
      borderWidth: 1,
      borderColor: theme.colors.primaryEco,
      marginBottom: theme.spacing.xl,
    },
    summaryBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginBottom: theme.spacing.md,
    },
    summaryBadgeText: {
      fontSize: 14,
      fontWeight: '700',
      color: theme.colors.primaryEco,
    },
    metricsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginVertical: theme.spacing.sm,
    },
    metricItem: {
      flex: 1,
      alignItems: 'center',
    },
    metricDivider: {
      width: 1,
      height: 44,
      backgroundColor: theme.colors.separator,
      marginHorizontal: theme.spacing.sm,
    },
    metricLabel: {
      fontSize: 12,
      color: theme.colors.grey,
      marginBottom: 4,
    },
    metricValueEco: {
      fontSize: 18,
      fontWeight: '800',
      color: theme.colors.primaryEco,
    },
    metricValueSocio: {
      fontSize: 18,
      fontWeight: '800',
      color: theme.colors.primarySocio,
    },
    metricHint: {
      fontSize: 11,
      color: theme.colors.grey,
      marginTop: 2,
    },
    summaryFooter: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      marginTop: theme.spacing.md,
      paddingTop: theme.spacing.sm,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: theme.colors.separator,
    },
    summaryFooterText: {
      fontSize: 12,
      color: theme.colors.grey,
      flex: 1,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: theme.colors.text,
      marginBottom: theme.spacing.md,
    },
    ruleCard: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      backgroundColor: theme.colors.white,
      padding: theme.spacing.md,
      borderRadius: theme.radius.md,
      borderWidth: 1,
      borderColor: theme.colors.separator,
      marginBottom: theme.spacing.md,
      gap: theme.spacing.md,
    },
    ruleIconBox: {
      width: 36,
      height: 36,
      borderRadius: theme.radius.sm,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 2,
    },
    ruleContent: {
      flex: 1,
    },
    ruleHeading: {
      fontSize: 14,
      fontWeight: '700',
      color: theme.colors.text,
      marginBottom: 3,
    },
    ruleText: {
      fontSize: 13,
      lineHeight: 18,
      color: theme.colors.grey,
    },
    actionContainer: {
      marginTop: theme.spacing.lg,
    },
    closeModalButton: {
      width: '100%',
    },
  });
