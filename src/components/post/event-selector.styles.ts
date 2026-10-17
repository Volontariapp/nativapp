import { StyleSheet } from 'react-native';
import type { AppTheme } from '@/shared/themes/theme';

export const createEventSelectorStyles = (theme: AppTheme) =>
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
  });
