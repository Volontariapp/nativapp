import { StyleSheet } from 'react-native';
import type { AppTheme } from '@/shared/themes/theme';

export const createEventPickerStyles = (theme: AppTheme) =>
  StyleSheet.create({
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
    footerLoader: {
      paddingVertical: theme.spacing.md,
    },
  });
