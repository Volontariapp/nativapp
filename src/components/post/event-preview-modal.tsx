import React from 'react';
import { View, StyleSheet, Modal, Pressable, ScrollView } from 'react-native';
import { useAppTheme, useStyles } from '@/context/ThemeContext';
import type { AppTheme } from '@/shared/themes/theme';
import { AppText } from '@/components/typography/AppText';
import { AppButton } from '@/components/buttons/AppButton';
import type { AppEvent } from '@/api/event/event.api';
import { EventType } from '@volontariapp/contracts';
import { mapEventType } from '@/shared/lib/event-mappers.utils';
import { formatDate } from '@/shared/lib/format-date.utils';
import Feather from 'react-native-vector-icons/Feather';

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
  const { theme } = useAppTheme();
  const styles = useStyles(createStyles);

  if (event === null) {
    return (
      <Modal visible={visible} transparent animationType="fade">
        <View />
      </Modal>
    );
  }

  const isSocial =
    event.type === EventType.EVENT_TYPE_SOCIAL ||
    String(event.type) === EventType[EventType.EVENT_TYPE_SOCIAL];
  const typeLabel = mapEventType(event.type);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFillObject} onPress={onClose} />
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View
                style={[
                  styles.badge,
                  isSocial ? styles.badgeSocial : styles.badgeEco,
                ]}
              >
                <Feather
                  name={isSocial ? 'users' : 'globe'}
                  size={12}
                  color={isSocial ? theme.colors.primarySocio : theme.colors.primaryEco}
                />
                <AppText
                  style={[
                    styles.badgeText,
                    isSocial ? styles.badgeTextSocial : styles.badgeTextEco,
                  ]}
                >
                  {typeLabel}
                </AppText>
              </View>
              <AppText style={styles.title} numberOfLines={2}>
                {event.title}
              </AppText>
            </View>
            <Pressable
              onPress={onClose}
              style={styles.closeButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Feather name="x" size={22} color={theme.colors.grey} />
            </Pressable>
          </View>

          <ScrollView style={styles.scrollBody} showsVerticalScrollIndicator={false}>
            {/* Description */}
            <View style={styles.cardSection}>
              <View style={styles.sectionHeaderRow}>
                <Feather name="file-text" size={14} color={theme.colors.grey} />
                <AppText style={styles.label}>Description</AppText>
              </View>
              <AppText style={styles.descriptionText}>{event.description}</AppText>
            </View>

            {/* Localisation */}
            <View style={styles.cardSection}>
              <View style={styles.sectionHeaderRow}>
                <Feather name="map-pin" size={14} color={theme.colors.grey} />
                <AppText style={styles.label}>Localisation</AppText>
              </View>
              <AppText style={styles.valueText}>{event.localisationName}</AppText>
            </View>

            {/* Dates */}
            <View style={styles.datesRow}>
              <View style={styles.dateCard}>
                <View style={styles.sectionHeaderRow}>
                  <Feather name="calendar" size={13} color={theme.colors.grey} />
                  <AppText style={styles.label}>Début</AppText>
                </View>
                <AppText style={styles.dateValue}>
                  {formatDate(event.startAt, {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  })}
                </AppText>
              </View>

              <View style={styles.dateCard}>
                <View style={styles.sectionHeaderRow}>
                  <Feather name="clock" size={13} color={theme.colors.grey} />
                  <AppText style={styles.label}>Fin</AppText>
                </View>
                <AppText style={styles.dateValue}>
                  {formatDate(event.endAt, {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  })}
                </AppText>
              </View>
            </View>

            {/* Impact & participants */}
            {(event.awardedImpactScore > 0 || event.maxParticipants > 0) && (
              <View style={styles.statsRow}>
                {event.awardedImpactScore > 0 && (
                  <View style={styles.statChip}>
                    <Feather name="award" size={14} color={theme.colors.primaryEco} />
                    <AppText style={styles.statText}>
                      +{event.awardedImpactScore} pts d&apos;impact
                    </AppText>
                  </View>
                )}
                {event.maxParticipants > 0 && (
                  <View style={styles.statChip}>
                    <Feather name="users" size={14} color={theme.colors.primarySocio} />
                    <AppText style={styles.statText}>
                      {event.currentParticipants}/{event.maxParticipants} participants
                    </AppText>
                  </View>
                )}
              </View>
            )}
          </ScrollView>

          {/* Footer action */}
          <View style={styles.footer}>
            <AppButton
              text="Fermer l'aperçu"
              variant="secondary"
              icon="x"
              onPress={onClose}
              style={styles.closeButtonAction}
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
      backgroundColor: theme.colors.blackOverlay,
      justifyContent: 'center',
      alignItems: 'center',
      padding: theme.spacing.lg,
    },
    modalContent: {
      backgroundColor: theme.colors.white,
      borderRadius: theme.radius.lg,
      padding: theme.spacing.lg,
      maxHeight: '85%',
      width: '100%',
      maxWidth: 480,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.15,
      shadowRadius: 20,
      elevation: 8,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      paddingBottom: theme.spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.lightGrey,
      marginBottom: theme.spacing.md,
    },
    headerLeft: {
      flex: 1,
      paddingRight: theme.spacing.sm,
    },
    badge: {
      flexDirection: 'row',
      alignItems: 'center',
      alignSelf: 'flex-start',
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: 3,
      borderRadius: theme.radius.full,
      marginBottom: theme.spacing.xs,
      gap: 4,
    },
    badgeEco: {
      backgroundColor: theme.colors.badgeEcoBackground,
    },
    badgeSocial: {
      backgroundColor: theme.colors.badgeSocioBackground,
    },
    badgeText: {
      fontSize: 11,
      fontWeight: '600',
    },
    badgeTextEco: {
      color: theme.colors.primaryEco,
    },
    badgeTextSocial: {
      color: theme.colors.primarySocio,
    },
    title: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme.colors.text,
      marginTop: 2,
    },
    closeButton: {
      padding: theme.spacing.xs,
      borderRadius: theme.radius.full,
      backgroundColor: theme.colors.lightGrey + '50',
    },
    scrollBody: {
      maxHeight: 400,
    },
    cardSection: {
      backgroundColor: theme.colors.background,
      borderRadius: theme.radius.md,
      padding: theme.spacing.md,
      marginBottom: theme.spacing.md,
    },
    sectionHeaderRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      marginBottom: theme.spacing.xs,
    },
    label: {
      fontSize: 12,
      fontWeight: '600',
      color: theme.colors.grey,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    descriptionText: {
      fontSize: 14,
      color: theme.colors.text,
      lineHeight: 20,
    },
    valueText: {
      fontSize: 14,
      fontWeight: '500',
      color: theme.colors.text,
    },
    datesRow: {
      flexDirection: 'row',
      gap: theme.spacing.sm,
      marginBottom: theme.spacing.md,
    },
    dateCard: {
      flex: 1,
      backgroundColor: theme.colors.background,
      borderRadius: theme.radius.md,
      padding: theme.spacing.md,
    },
    dateValue: {
      fontSize: 13,
      fontWeight: '600',
      color: theme.colors.text,
    },
    statsRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.spacing.sm,
      marginBottom: theme.spacing.sm,
    },
    statChip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      backgroundColor: theme.colors.background,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.xs,
      borderRadius: theme.radius.full,
    },
    statText: {
      fontSize: 12,
      fontWeight: '600',
      color: theme.colors.text,
    },
    footer: {
      marginTop: theme.spacing.md,
      paddingTop: theme.spacing.sm,
      borderTopWidth: 1,
      borderTopColor: theme.colors.lightGrey,
    },
    closeButtonAction: {
      width: '100%',
    },
  });
