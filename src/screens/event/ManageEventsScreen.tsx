import React, { useMemo } from 'react';
import { View, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Feather from 'react-native-vector-icons/Feather';

import { AppText } from '@/components/typography/AppText';
import AppHeader from '@/components/layout/AppHeader';
import { useAppTheme, useStyles } from '@/context/ThemeContext';
import type { AppTheme } from '@/shared/themes/theme';
import type { CreateEventStackParamList } from '@/navigation/stacks/CreateEventStack';
import { useGetMyEvents } from '@/api/event/hooks/use-get-my-events';
import { useGetMyPosts } from '@/api/post/hooks/use-get-my-posts';

type ManageEventsNavigationProp = NativeStackNavigationProp<
  CreateEventStackParamList,
  'ManageEvents'
>;

export function ManageEventsScreen(): React.JSX.Element {
  const { theme } = useAppTheme();
  const styles = useStyles(createStyles);
  const navigation = useNavigation<ManageEventsNavigationProp>();

  const { data: eventsData } = useGetMyEvents(1);
  const { data: postsData } = useGetMyPosts(1);

  const eventsCount = useMemo(() => {
    return eventsData?.pages[0]?.totalCount;
  }, [eventsData]);

  const postsCount = useMemo(() => {
    return postsData?.pages[0]?.totalCount;
  }, [postsData]);

  return (
    <View style={styles.container}>
      <AppHeader />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.centerWrapper}>
          {/* Header Title & Intro */}
          <View style={styles.headerSection}>
            <View style={styles.headerBadge}>
              <Feather name="layers" size={13} color={theme.colors.primaryEco} />
              <AppText style={styles.headerBadgeText}>Espace Création</AppText>
            </View>
            <AppText style={styles.title}>Gestion de contenu</AppText>
            <AppText style={styles.subtitle}>
              Choisissez le type de contenu que vous souhaitez créer ou gérer.
            </AppText>
          </View>

          {/* Options Container */}
          <View style={styles.optionsContainer}>
            {/* Option 1: Événements & Missions (Vert Eco) */}
            <View style={styles.sectionCard}>
              <View style={styles.sectionHeaderRow}>
                <View style={[styles.sectionIconBadge, styles.iconBadgeEco]}>
                  <Feather name="calendar" size={18} color={theme.colors.primaryEco} />
                </View>
                <View style={styles.sectionHeaderText}>
                  <AppText style={styles.sectionTitle}>Missions & Événements</AppText>
                  <AppText style={styles.sectionSubtitle}>
                    Actions concrètes sur le terrain et bénévolat
                  </AppText>
                </View>
              </View>

              {/* Primary Action Card: Créer un événement */}
              <Pressable
                style={({ pressed }) => [
                  styles.primaryActionCard,
                  styles.primaryCardEco,
                  pressed && styles.cardPressed,
                ]}
                onPress={() => {
                  navigation.navigate('EventForm');
                }}
              >
                <View style={styles.primaryActionLeft}>
                  <View style={[styles.primaryActionIconCircle, styles.circleEco]}>
                    <Feather name="plus" size={20} color={theme.colors.white} />
                  </View>
                  <View style={styles.primaryActionTextCol}>
                    <AppText style={styles.primaryActionTitle}>Créer un événement</AppText>
                    <AppText style={styles.primaryActionDesc}>
                      Lieu, dates, compétences et inscriptions
                    </AppText>
                  </View>
                </View>
                <View style={[styles.arrowCircle, styles.arrowCircleEco]}>
                  <Feather name="chevron-right" size={18} color={theme.colors.primaryEco} />
                </View>
              </Pressable>

              {/* Secondary Action Link: Mes événements créés */}
              <Pressable
                style={({ pressed }) => [
                  styles.secondaryLinkRow,
                  pressed && styles.rowPressed,
                ]}
                onPress={() => {
                  navigation.navigate('MyEvents');
                }}
              >
                <View style={styles.secondaryLinkLeft}>
                  <Feather name="list" size={16} color={theme.colors.grey} />
                  <AppText style={styles.secondaryLinkText}>Mes événements créés</AppText>
                </View>
                <View style={styles.secondaryLinkRight}>
                  {eventsCount !== undefined && (
                    <View style={[styles.countBadge, styles.countBadgeEco]}>
                      <AppText style={[styles.countBadgeText, styles.countBadgeTextEco]}>
                        {String(eventsCount)}
                      </AppText>
                    </View>
                  )}
                  <Feather name="arrow-right" size={15} color={theme.colors.grey} />
                </View>
              </Pressable>
            </View>

            {/* Option 2: Publications & Feed (Bleu/Violet Socio) */}
            <View style={styles.sectionCard}>
              <View style={styles.sectionHeaderRow}>
                <View style={[styles.sectionIconBadge, styles.iconBadgeSocio]}>
                  <Feather name="message-square" size={18} color={theme.colors.primarySocio} />
                </View>
                <View style={styles.sectionHeaderText}>
                  <AppText style={styles.sectionTitle}>Publications & Social</AppText>
                  <AppText style={styles.sectionSubtitle}>
                    Partagez vos réussites et actualités dans le fil
                  </AppText>
                </View>
              </View>

              {/* Primary Action Card: Créer un post */}
              <Pressable
                style={({ pressed }) => [
                  styles.primaryActionCard,
                  styles.primaryCardSocio,
                  pressed && styles.cardPressed,
                ]}
                onPress={() => {
                  navigation.navigate('PostForm');
                }}
              >
                <View style={styles.primaryActionLeft}>
                  <View style={[styles.primaryActionIconCircle, styles.circleSocio]}>
                    <Feather name="edit-3" size={18} color={theme.colors.white} />
                  </View>
                  <View style={styles.primaryActionTextCol}>
                    <AppText style={styles.primaryActionTitle}>Créer un post</AppText>
                    <AppText style={styles.primaryActionDesc}>
                      Rédigez un message ou reliez un événement
                    </AppText>
                  </View>
                </View>
                <View style={[styles.arrowCircle, styles.arrowCircleSocio]}>
                  <Feather name="chevron-right" size={18} color={theme.colors.primarySocio} />
                </View>
              </Pressable>

              {/* Secondary Action Link: Mes posts créés */}
              <Pressable
                style={({ pressed }) => [
                  styles.secondaryLinkRow,
                  pressed && styles.rowPressed,
                ]}
                onPress={() => {
                  navigation.navigate('MyPosts');
                }}
              >
                <View style={styles.secondaryLinkLeft}>
                  <Feather name="grid" size={16} color={theme.colors.grey} />
                  <AppText style={styles.secondaryLinkText}>Mes posts créés</AppText>
                </View>
                <View style={styles.secondaryLinkRight}>
                  {postsCount !== undefined && (
                    <View style={[styles.countBadge, styles.countBadgeSocio]}>
                      <AppText style={[styles.countBadgeText, styles.countBadgeTextSocio]}>
                        {String(postsCount)}
                      </AppText>
                    </View>
                  )}
                  <Feather name="arrow-right" size={15} color={theme.colors.grey} />
                </View>
              </Pressable>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    scrollContent: {
      flexGrow: 1,
      justifyContent: 'center',
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.xl,
    },
    centerWrapper: {
      width: '100%',
      maxWidth: 500,
      alignSelf: 'center',
    },
    headerSection: {
      alignItems: 'center',
      marginBottom: theme.spacing.xl,
    },
    headerBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      backgroundColor: theme.colors.badgeEcoBackground,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: 5,
      borderRadius: theme.radius.full,
      marginBottom: theme.spacing.sm,
    },
    headerBadgeText: {
      fontSize: 12,
      fontWeight: '600',
      color: theme.colors.primaryEco,
    },
    title: {
      fontSize: 26,
      fontWeight: 'bold',
      color: theme.colors.text,
      letterSpacing: -0.5,
      marginBottom: 6,
      textAlign: 'center',
    },
    subtitle: {
      fontSize: 14,
      color: theme.colors.grey,
      lineHeight: 20,
      textAlign: 'center',
      paddingHorizontal: theme.spacing.sm,
    },
    optionsContainer: {
      gap: theme.spacing.lg,
    },
    sectionCard: {
      backgroundColor: theme.colors.white,
      borderRadius: theme.radius.lg,
      padding: theme.spacing.lg,
      borderWidth: 1,
      borderColor: theme.colors.lightGrey,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.04,
      shadowRadius: 8,
      elevation: 2,
    },
    sectionHeaderRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.md,
      marginBottom: theme.spacing.md,
      paddingBottom: theme.spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.lightGrey + '60',
    },
    sectionIconBadge: {
      width: 40,
      height: 40,
      borderRadius: theme.radius.md,
      justifyContent: 'center',
      alignItems: 'center',
    },
    iconBadgeEco: {
      backgroundColor: theme.colors.badgeEcoBackground,
    },
    iconBadgeSocio: {
      backgroundColor: theme.colors.badgeSocioBackground,
    },
    sectionHeaderText: {
      flex: 1,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: 'bold',
      color: theme.colors.text,
      marginBottom: 2,
    },
    sectionSubtitle: {
      fontSize: 12,
      color: theme.colors.grey,
    },
    primaryActionCard: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: theme.spacing.md,
      borderRadius: theme.radius.md,
      borderWidth: 1.5,
      marginBottom: theme.spacing.md,
    },
    primaryCardEco: {
      backgroundColor: theme.colors.badgeEcoBackground + '30',
      borderColor: theme.colors.primaryEco + '40',
    },
    primaryCardSocio: {
      backgroundColor: theme.colors.badgeSocioBackground + '30',
      borderColor: theme.colors.primarySocio + '40',
    },
    cardPressed: {
      opacity: 0.85,
      transform: [{ scale: 0.99 }],
    },
    primaryActionLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.md,
      flex: 1,
      paddingRight: theme.spacing.sm,
    },
    primaryActionIconCircle: {
      width: 40,
      height: 40,
      borderRadius: theme.radius.full,
      justifyContent: 'center',
      alignItems: 'center',
    },
    circleEco: {
      backgroundColor: theme.colors.primaryEco,
    },
    circleSocio: {
      backgroundColor: theme.colors.primarySocio,
    },
    primaryActionTextCol: {
      flex: 1,
    },
    primaryActionTitle: {
      fontSize: 15,
      fontWeight: '700',
      color: theme.colors.text,
      marginBottom: 2,
    },
    primaryActionDesc: {
      fontSize: 12,
      color: theme.colors.grey,
      lineHeight: 16,
    },
    arrowCircle: {
      width: 32,
      height: 32,
      borderRadius: theme.radius.full,
      justifyContent: 'center',
      alignItems: 'center',
    },
    arrowCircleEco: {
      backgroundColor: theme.colors.badgeEcoBackground,
    },
    arrowCircleSocio: {
      backgroundColor: theme.colors.badgeSocioBackground,
    },
    secondaryLinkRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.sm,
      borderRadius: theme.radius.sm,
      backgroundColor: theme.colors.background,
    },
    rowPressed: {
      backgroundColor: theme.colors.lightGrey + '40',
    },
    secondaryLinkLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
    },
    secondaryLinkText: {
      fontSize: 13,
      fontWeight: '600',
      color: theme.colors.text,
    },
    secondaryLinkRight: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    countBadge: {
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: theme.radius.full,
    },
    countBadgeEco: {
      backgroundColor: theme.colors.badgeEcoBackground,
    },
    countBadgeSocio: {
      backgroundColor: theme.colors.badgeSocioBackground,
    },
    countBadgeText: {
      fontSize: 11,
      fontWeight: '700',
    },
    countBadgeTextEco: {
      color: theme.colors.primaryEco,
    },
    countBadgeTextSocio: {
      color: theme.colors.primarySocio,
    },
  });

