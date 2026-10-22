import React from 'react';
import { Modal, View, StyleSheet, Pressable, ScrollView, useWindowDimensions } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import type { RankingReasonWeb } from '@volontariapp/contracts';
import { AppText } from '@/components/typography/AppText';
import { AppButton } from '@/components/buttons/AppButton';
import { useAppTheme, useStyles } from '@/context/ThemeContext';
import type { AppTheme } from '@/shared/themes/theme';
import {
  formatExactScore,
  formatRankingScore,
  getRankingReasonExplanation,
  getRankingReasonLabel,
  RANKING_FORMULA_DETAILS,
} from '@/api/ranking/ranking-reasons.utils';

export interface RankingDebugDetailModalProps {
  visible: boolean;
  onClose: () => void;
  type: 'post' | 'event';
  id: string;
  title?: string;
  rankingScore?: number;
  reasons?: RankingReasonWeb[];
  isFallback?: boolean;
  isLiked?: boolean;
  authorPseudo?: string;
  createdAt?: string | Date;
  eventType?: string | number;
  startAt?: string | Date;
  localisationName?: string;
  distanceKm?: number;
  testID?: string;
}

export function RankingDebugDetailModal({
  visible,
  onClose,
  type,
  id,
  title,
  rankingScore,
  reasons = [],
  isFallback = false,
  isLiked = false,
  authorPseudo,
  createdAt,
  eventType,
  startAt,
  localisationName,
  distanceKm,
  testID = 'ranking-debug-detail-modal',
}: RankingDebugDetailModalProps): React.JSX.Element {
  const { theme } = useAppTheme();
  const styles = useStyles(createStyles);
  const { height: windowHeight } = useWindowDimensions();

  const formulaMeta =
    type === 'post' ? RANKING_FORMULA_DETAILS.feed : RANKING_FORMULA_DETAILS.events;

  const isScoreDefined = typeof rankingScore === 'number';
  const exactScore = isScoreDefined ? formatExactScore(rankingScore) : 'Non défini';
  const badgeScore = isScoreDefined ? formatRankingScore(rankingScore) : 'N/A';
  const percentageScore =
    isScoreDefined && rankingScore >= 0 && rankingScore <= 1
      ? `${(rankingScore * 100).toFixed(2)} %`
      : null;

  return (
    <Modal
      animationType="fade"
      transparent
      visible={visible}
      onRequestClose={onClose}
      testID={testID}
    >
      <View style={styles.overlay}>
        <View style={[styles.card, { maxHeight: windowHeight * 0.85 }]}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.typeBadge}>
                <AppText style={styles.typeBadgeText}>
                  {type === 'post' ? 'POST' : 'ÉVÉNEMENT'}
                </AppText>
              </View>
              <AppText style={styles.headerTitle} numberOfLines={1}>
                Détail du Score (Debug)
              </AppText>
            </View>
            <Pressable
              onPress={onClose}
              style={styles.closeButton}
              accessibilityLabel="Fermer"
              accessibilityRole="button"
            >
              <Icon name="x" size={22} color={theme.colors.text} />
            </Pressable>
          </View>

          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Title / ID block */}
            {Boolean(title) && (
              <AppText style={styles.itemTitle} numberOfLines={2}>
                {title}
              </AppText>
            )}
            <View style={styles.idContainer}>
              <AppText style={styles.idLabel}>ID :</AppText>
              <AppText style={styles.idValue} numberOfLines={1} ellipsizeMode="middle">
                {id}
              </AppText>
            </View>

            {/* Score Highlight Card */}
            <View style={styles.scoreHighlightCard}>
              <AppText style={styles.scoreCardTitle}>Score Exact de Classement</AppText>

              {isScoreDefined ? (
                <>
                  <AppText style={styles.exactScoreValue}>{exactScore}</AppText>
                  <View style={styles.scoreSecondaryRow}>
                    <AppText style={styles.scoreSecondaryText}>
                      Arrondi badge : <AppText style={styles.boldText}>{badgeScore}</AppText>
                    </AppText>
                    {percentageScore !== null && (
                      <AppText style={styles.scoreSecondaryText}>
                        Échelle relative :{' '}
                        <AppText style={styles.boldText}>{percentageScore}</AppText>
                      </AppText>
                    )}
                  </View>
                </>
              ) : (
                <View style={styles.unrankedNotice}>
                  <AppText style={styles.unrankedNoticeText}>
                    {isFallback
                      ? 'Repli chronologique activé (non scoré ou cold start)'
                      : 'Aucun score attribué'}
                  </AppText>
                </View>
              )}

              {/* Warnings / Penalties */}
              {type === 'post' && isLiked && (
                <View style={styles.penaltyNotice}>
                  <Icon name="alert-triangle" size={16} color={theme.colors.warning} />
                  <AppText style={styles.penaltyNoticeText}>
                    Rétrogradé × 0.6 : vous avez déjà interagi avec ce post. Le moteur privilégie
                    les nouveautés dans le feed sans l’exclure.
                  </AppText>
                </View>
              )}

              {isFallback && (
                <View style={styles.fallbackNotice}>
                  <Icon name="info" size={16} color={theme.colors.primarySocio} />
                  <AppText style={styles.fallbackNoticeText}>
                    Ce contenu est proposé par démarrage à froid (ordre chronologique par date de
                    publication).
                  </AppText>
                </View>
              )}
            </View>

            {/* Dominant Reasons Section */}
            <View style={styles.section}>
              <AppText style={styles.sectionTitle}>
                Raisons dominantes du score ({reasons.length})
              </AppText>

              {reasons.length > 0 ? (
                reasons.map((reason) => {
                  const label = getRankingReasonLabel(reason);
                  const explanation = getRankingReasonExplanation(reason);

                  return (
                    <View key={reason} style={styles.reasonCard}>
                      <View style={styles.reasonBadge}>
                        <Icon name="check-circle" size={14} color={theme.colors.primarySocio} />
                        <AppText style={styles.reasonBadgeText}>{label}</AppText>
                        <AppText style={styles.reasonCodeText}>[{reason}]</AppText>
                      </View>
                      {explanation !== undefined && (
                        <>
                          <AppText style={styles.reasonShortDesc}>
                            {explanation.shortDescription}
                          </AppText>
                          <AppText style={styles.reasonFormulaDesc}>
                            💡 {explanation.detailedFormula}
                          </AppText>
                        </>
                      )}
                    </View>
                  );
                })
              ) : (
                <View style={styles.emptyReasonsCard}>
                  <AppText style={styles.emptyReasonsText}>
                    Aucun code d’explication dominant (les composantes de base n’ont pas franchi le
                    seuil de déclenchement d’une explication spécifique).
                  </AppText>
                </View>
              )}
            </View>

            {/* Formula Breakdown Section */}
            <View style={styles.section}>
              <AppText style={styles.sectionTitle}>{formulaMeta.title}</AppText>
              <View style={styles.formulaTable}>
                {formulaMeta.weights.map((w) => (
                  <View key={w.name} style={styles.formulaRow}>
                    <View style={styles.formulaWeightBadge}>
                      <AppText style={styles.formulaWeightText}>{w.weight}</AppText>
                    </View>
                    <View style={styles.formulaTextContainer}>
                      <AppText style={styles.formulaNameText}>{w.name}</AppText>
                      <AppText style={styles.formulaDescText}>{w.desc}</AppText>
                    </View>
                  </View>
                ))}

                {formulaMeta.penalties.length > 0 && (
                  <View style={styles.penaltiesContainer}>
                    <AppText style={styles.penaltiesHeader}>Facteurs de rétrogradation :</AppText>
                    {formulaMeta.penalties.map((p) => (
                      <View key={p.name} style={styles.formulaRow}>
                        <View style={styles.penaltyBadge}>
                          <AppText style={styles.penaltyBadgeText}>{p.penalty}</AppText>
                        </View>
                        <View style={styles.formulaTextContainer}>
                          <AppText style={styles.formulaNameText}>{p.name}</AppText>
                          <AppText style={styles.formulaDescText}>{p.desc}</AppText>
                        </View>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            </View>

            {/* Contextual Meta Section */}
            <View style={styles.section}>
              <AppText style={styles.sectionTitle}>Métadonnées contextuelles</AppText>
              <View style={styles.metaGrid}>
                {Boolean(authorPseudo) && (
                  <View style={styles.metaRow}>
                    <AppText style={styles.metaLabel}>Auteur :</AppText>
                    <AppText style={styles.metaValue}>{authorPseudo}</AppText>
                  </View>
                )}
                {Boolean(createdAt) && (
                  <View style={styles.metaRow}>
                    <AppText style={styles.metaLabel}>Créé le :</AppText>
                    <AppText style={styles.metaValue}>
                      {typeof createdAt === 'string'
                        ? new Date(createdAt).toLocaleString()
                        : createdAt?.toLocaleString()}
                    </AppText>
                  </View>
                )}
                {eventType !== undefined && (
                  <View style={styles.metaRow}>
                    <AppText style={styles.metaLabel}>Type :</AppText>
                    <AppText style={styles.metaValue}>{String(eventType)}</AppText>
                  </View>
                )}
                {Boolean(startAt) && (
                  <View style={styles.metaRow}>
                    <AppText style={styles.metaLabel}>Début :</AppText>
                    <AppText style={styles.metaValue}>
                      {typeof startAt === 'string'
                        ? new Date(startAt).toLocaleString()
                        : startAt?.toLocaleString()}
                    </AppText>
                  </View>
                )}
                {Boolean(localisationName) && (
                  <View style={styles.metaRow}>
                    <AppText style={styles.metaLabel}>Lieu :</AppText>
                    <AppText style={styles.metaValue}>{localisationName}</AppText>
                  </View>
                )}
                {typeof distanceKm === 'number' && (
                  <View style={styles.metaRow}>
                    <AppText style={styles.metaLabel}>Distance :</AppText>
                    <AppText style={styles.metaValue}>{distanceKm.toFixed(1)} km</AppText>
                  </View>
                )}
              </View>
            </View>
          </ScrollView>

          {/* Footer */}
          <View style={styles.footer}>
            <AppButton
              text="Fermer"
              variant="secondary"
              onPress={onClose}
              style={styles.closeAction}
            />
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
      backgroundColor: theme.colors.badgeOverlay,
      justifyContent: 'center',
      alignItems: 'center',
      padding: theme.spacing.md,
    },
    card: {
      backgroundColor: theme.colors.white,
      borderRadius: theme.radius.lg,
      width: '100%',
      maxWidth: 440,
      overflow: 'hidden',
      ...theme.shadows.card,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.separator,
    },
    headerLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
      gap: theme.spacing.sm,
    },
    typeBadge: {
      backgroundColor: theme.colors.primarySocio,
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: 2,
      borderRadius: theme.radius.sm,
    },
    typeBadgeText: {
      color: theme.colors.white,
      fontSize: theme.typography.fontSize.xs,
      fontWeight: theme.typography.fontWeight.bold,
    },
    headerTitle: {
      fontSize: theme.typography.fontSize.md,
      fontWeight: theme.typography.fontWeight.bold,
      color: theme.colors.text,
      flex: 1,
    },
    closeButton: {
      padding: theme.spacing.xs,
    },
    scrollContent: {
      padding: theme.spacing.lg,
      gap: theme.spacing.md,
    },
    itemTitle: {
      fontSize: theme.typography.fontSize.lg,
      fontWeight: theme.typography.fontWeight.bold,
      color: theme.colors.text,
    },
    idContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.xs,
      backgroundColor: theme.colors.background,
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.xs,
      borderRadius: theme.radius.sm,
    },
    idLabel: {
      fontSize: theme.typography.fontSize.xs,
      color: theme.colors.grey,
      fontWeight: theme.typography.fontWeight.medium,
    },
    idValue: {
      fontSize: theme.typography.fontSize.xs,
      color: theme.colors.text,
      fontFamily: theme.typography.fonts.primary,
      flex: 1,
    },
    scoreHighlightCard: {
      backgroundColor: theme.colors.background,
      borderRadius: theme.radius.md,
      padding: theme.spacing.md,
      borderWidth: 1,
      borderColor: theme.colors.primarySocio,
      gap: theme.spacing.xs,
    },
    scoreCardTitle: {
      fontSize: theme.typography.fontSize.xs,
      fontWeight: theme.typography.fontWeight.bold,
      color: theme.colors.primarySocio,
      textTransform: 'uppercase',
      letterSpacing: 0.8,
    },
    exactScoreValue: {
      fontSize: 28,
      fontWeight: theme.typography.fontWeight.bold,
      color: theme.colors.text,
      fontFamily: theme.typography.fonts.primary,
    },
    scoreSecondaryRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.spacing.md,
      marginTop: 2,
    },
    scoreSecondaryText: {
      fontSize: theme.typography.fontSize.xs,
      color: theme.colors.grey,
    },
    boldText: {
      fontWeight: theme.typography.fontWeight.bold,
      color: theme.colors.text,
    },
    unrankedNotice: {
      paddingVertical: theme.spacing.sm,
    },
    unrankedNoticeText: {
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.grey,
      fontStyle: 'italic',
    },
    penaltyNotice: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.xs,
      backgroundColor: 'rgba(228, 86, 0, 0.12)',
      padding: theme.spacing.sm,
      borderRadius: theme.radius.sm,
      marginTop: theme.spacing.xs,
    },
    penaltyNoticeText: {
      fontSize: theme.typography.fontSize.xs,
      color: theme.colors.warning,
      flex: 1,
      fontWeight: theme.typography.fontWeight.medium,
    },
    fallbackNotice: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.xs,
      backgroundColor: 'rgba(31, 111, 139, 0.10)',
      padding: theme.spacing.sm,
      borderRadius: theme.radius.sm,
      marginTop: theme.spacing.xs,
    },
    fallbackNoticeText: {
      fontSize: theme.typography.fontSize.xs,
      color: theme.colors.primarySocio,
      flex: 1,
    },
    section: {
      gap: theme.spacing.sm,
      marginTop: theme.spacing.xs,
    },
    sectionTitle: {
      fontSize: theme.typography.fontSize.sm,
      fontWeight: theme.typography.fontWeight.bold,
      color: theme.colors.text,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    reasonCard: {
      backgroundColor: theme.colors.background,
      borderRadius: theme.radius.sm,
      padding: theme.spacing.sm,
      borderLeftWidth: 3,
      borderLeftColor: theme.colors.primarySocio,
      gap: 4,
    },
    reasonBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    reasonBadgeText: {
      fontSize: theme.typography.fontSize.sm,
      fontWeight: theme.typography.fontWeight.bold,
      color: theme.colors.text,
    },
    reasonCodeText: {
      fontSize: theme.typography.fontSize.xs,
      color: theme.colors.grey,
      fontFamily: theme.typography.fonts.primary,
    },
    reasonShortDesc: {
      fontSize: theme.typography.fontSize.xs,
      color: theme.colors.text,
      fontWeight: theme.typography.fontWeight.medium,
    },
    reasonFormulaDesc: {
      fontSize: theme.typography.fontSize.xs,
      color: theme.colors.grey,
      fontStyle: 'italic',
    },
    emptyReasonsCard: {
      backgroundColor: theme.colors.background,
      borderRadius: theme.radius.sm,
      padding: theme.spacing.md,
    },
    emptyReasonsText: {
      fontSize: theme.typography.fontSize.xs,
      color: theme.colors.grey,
      fontStyle: 'italic',
    },
    formulaTable: {
      backgroundColor: theme.colors.background,
      borderRadius: theme.radius.sm,
      padding: theme.spacing.sm,
      gap: theme.spacing.sm,
    },
    formulaRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: theme.spacing.sm,
    },
    formulaWeightBadge: {
      backgroundColor: theme.colors.primarySocio,
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: theme.radius.sm,
      minWidth: 42,
      alignItems: 'center',
    },
    formulaWeightText: {
      color: theme.colors.white,
      fontSize: theme.typography.fontSize.xs,
      fontWeight: theme.typography.fontWeight.bold,
    },
    penaltyBadge: {
      backgroundColor: theme.colors.warning,
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: theme.radius.sm,
      minWidth: 42,
      alignItems: 'center',
    },
    penaltyBadgeText: {
      color: theme.colors.white,
      fontSize: theme.typography.fontSize.xs,
      fontWeight: theme.typography.fontWeight.bold,
    },
    formulaTextContainer: {
      flex: 1,
    },
    formulaNameText: {
      fontSize: theme.typography.fontSize.xs,
      fontWeight: theme.typography.fontWeight.bold,
      color: theme.colors.text,
    },
    formulaDescText: {
      fontSize: theme.typography.fontSize.xs,
      color: theme.colors.grey,
    },
    penaltiesContainer: {
      marginTop: theme.spacing.xs,
      paddingTop: theme.spacing.xs,
      borderTopWidth: 1,
      borderTopColor: theme.colors.separator,
      gap: theme.spacing.xs,
    },
    penaltiesHeader: {
      fontSize: theme.typography.fontSize.xs,
      fontWeight: theme.typography.fontWeight.bold,
      color: theme.colors.grey,
      textTransform: 'uppercase',
      marginBottom: 2,
    },
    metaGrid: {
      backgroundColor: theme.colors.background,
      borderRadius: theme.radius.sm,
      padding: theme.spacing.sm,
      gap: 4,
    },
    metaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.xs,
    },
    metaLabel: {
      fontSize: theme.typography.fontSize.xs,
      color: theme.colors.grey,
      fontWeight: theme.typography.fontWeight.medium,
      width: 70,
    },
    metaValue: {
      fontSize: theme.typography.fontSize.xs,
      color: theme.colors.text,
      flex: 1,
    },
    footer: {
      padding: theme.spacing.md,
      borderTopWidth: 1,
      borderTopColor: theme.colors.separator,
    },
    closeAction: {
      width: '100%',
    },
  });
