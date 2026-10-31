import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  Share,
  Pressable,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type {
  NativeStackScreenProps,
  NativeStackNavigationProp,
} from '@react-navigation/native-stack';
import type { MainStackParamList } from '../../navigation/stacks/MainStack';
import Feather from 'react-native-vector-icons/Feather';

import { AppText } from '@/components/typography/AppText';
import { AppIcons } from '@/components/media/AppIcons';
import { useAppTheme, useStyles } from '@/context/ThemeContext';
import type { AppTheme } from '@/shared/themes/theme';
import { EventState } from '@volontariapp/contracts';
import type { AppEvent } from '@/api/event/event.api';
import { mapEventType } from '@/shared/lib/event-mappers.utils';
import { useUserSocialActions } from '@/api/social/hooks/use-user-social-actions';
import { useUserParticipations } from '@/api/social/hooks/use-user-participations';
import { useProfile } from '@/api/user/hooks/use-profile';
import { useAuth } from '@/context/AuthContext';

import { EventCover } from '../../components/event/EventCover';
import { EventInfoCards } from '../../components/event/EventInfoCards';
import { EventTags } from '../../components/event/EventTags';
import { EventParticipants } from '../../components/event/EventParticipants';
import { EventRequirements } from '../../components/event/EventRequirements';
import { EventOrganizer } from '../../components/event/EventOrganizer';
import { EventPointsBadge } from '../../components/event/EventPointsBadge';
import AppMap from '@/components/map/AppMap';

type Props = NativeStackScreenProps<MainStackParamList, 'EventDetail'>;

function EventDescription({ event }: { event: AppEvent }): React.JSX.Element {
  const styles = useStyles(createStyles);

  return (
    <View style={styles.section}>
      <AppText style={styles.sectionTitle}>Description</AppText>
      <AppText style={styles.descriptionText}>{event.description}</AppText>

      {event.tags && event.tags.length > 0 && <EventTags tags={event.tags} />}
    </View>
  );
}

function EventLocation({ event }: { event: AppEvent }): React.JSX.Element {
  const styles = useStyles(createStyles);

  return (
    <View style={styles.mapSection}>
      <AppText style={styles.sectionTitle}>Lieu</AppText>
      <View style={styles.mapContainer}>
        <AppMap
          events={[event]}
          initialCenter={event.location}
          scrollEnabled={false}
          zoomEnabled={false}
        />
      </View>
    </View>
  );
}

function EventExtras({ event }: { event: AppEvent }): React.JSX.Element {
  return (
    <>
      {event.requirements && event.requirements.length > 0 && (
        <EventRequirements requirements={event.requirements} />
      )}
      {event.location && <EventLocation event={event} />}
    </>
  );
}

function EventDetailBody({ event }: { event: AppEvent }): React.JSX.Element {
  const styles = useStyles(createStyles);

  return (
    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      <EventCover event={event} />

      <View style={styles.content}>
        <AppText style={styles.categoryTitle}>{mapEventType(event.type)}</AppText>
        <AppText style={styles.title}>{event.title}</AppText>
        <EventPointsBadge event={event} style={{ marginBottom: 16 }} />

        <EventOrganizer organizerId={event.organizerId} />
        <EventInfoCards event={event} />
        <EventDescription event={event} />
        <EventParticipants event={event} />
        <EventExtras event={event} />
      </View>
    </ScrollView>
  );
}

interface BottomActionProps {
  icon: string;
  label: string;
  isPending: boolean;
  onPress: () => void;
  highlighted?: boolean;
}

function BottomAction({
  icon,
  label,
  isPending,
  onPress,
  highlighted = false,
}: BottomActionProps): React.JSX.Element {
  const { theme } = useAppTheme();
  const styles = useStyles(createStyles);

  return (
    <View style={styles.bottomBar}>
      <Pressable
        style={[styles.joinButton, highlighted && styles.joinedButton]}
        onPress={onPress}
        disabled={isPending}
      >
        {isPending ? (
          <ActivityIndicator color={theme.colors.white} />
        ) : (
          <>
            <AppIcons icon={icon} iconLibrary="Feather" size={20} color={theme.colors.white} />
            <AppText style={styles.joinButtonText}>{label}</AppText>
          </>
        )}
      </Pressable>
    </View>
  );
}

interface JoinBarProps {
  isJoined: boolean;
  isPending: boolean;
  onJoin: () => void;
  onUnjoin: () => void;
}

function JoinBar({ isJoined, isPending, onJoin, onUnjoin }: JoinBarProps): React.JSX.Element {
  return isJoined ? (
    <BottomAction
      icon="x"
      label="Ne plus y participer"
      isPending={isPending}
      onPress={onUnjoin}
      highlighted
    />
  ) : (
    <BottomAction icon="user-plus" label="Rejoindre" isPending={isPending} onPress={onJoin} />
  );
}

const isJoinedByVisitor = (
  isJoined: boolean,
  profile: { id: string } | undefined,
  organizerId: string | undefined,
): boolean => isJoined && profile !== undefined && profile.id !== organizerId;

/** Un visiteur inscrit compte forcément avec l'organisateur : au moins 2 participants. */
const applyJoinFloor = (count: number, joinedByVisitor: boolean): number =>
  joinedByVisitor && count < 2 ? Math.max(2, count + 1) : count;

export function EventDetailScreen({ route }: Props): React.JSX.Element {
  const { theme } = useAppTheme();
  const styles = useStyles(createStyles);
  const event: AppEvent = route.params.event;
  const navigation = useNavigation<NativeStackNavigationProp<MainStackParamList>>();

  const isJoinable = useMemo(
    () =>
      event.state === EventState.EVENT_STATE_PUBLISHED ||
      String(event.state) === EventState[EventState.EVENT_STATE_PUBLISHED] ||
      event.state === EventState.EVENT_STATE_DRAFT ||
      String(event.state) === EventState[EventState.EVENT_STATE_DRAFT],
    [event.state],
  );

  const { userId } = useAuth();
  const { participate, isParticipating, unparticipate, isUnparticipating } = useUserSocialActions();
  const { data: participations } = useUserParticipations(100);
  const { data: profile } = useProfile();

  const isJoined = useMemo(
    () => participations?.pages.flatMap((p) => p.ids).includes(event.id) ?? false,
    [participations?.pages, event.id],
  );

  const [participantsDelta, setParticipantsDelta] = useState(0);

  const optimisticEvent = useMemo<AppEvent>(() => {
    const baseCount = Math.max(0, event.currentParticipants + participantsDelta);
    const joinedByVisitor = isJoinedByVisitor(isJoined, profile, event.organizerId);
    const currentParticipants = applyJoinFloor(baseCount, joinedByVisitor);
    return { ...event, currentParticipants };
  }, [event, participantsDelta, isJoined, profile]);

  const isOrganizer = useMemo(() => {
    const currentId = userId ?? profile?.id;
    if (currentId === undefined || currentId.length === 0) {
      return false;
    }
    return event.organizerId === currentId || optimisticEvent.organizerId === currentId;
  }, [userId, profile?.id, event.organizerId, optimisticEvent.organizerId]);

  const handleBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const handleEdit = useCallback(() => {
    navigation.navigate('EventManagement', {
      eventId: optimisticEvent.id,
      initialEvent: optimisticEvent,
    });
  }, [navigation, optimisticEvent]);

  const handleShare = useCallback(() => {
    void Share.share({
      message: `Rejoins-moi pour l'événement "${optimisticEvent.title}" sur Volontariapp !`,
    });
  }, [optimisticEvent.title]);

  const handleJoin = useCallback(() => {
    if (isOrganizer) {
      return;
    }
    participate(event.id)
      .then(() => {
        setParticipantsDelta((prev) => prev + 1);
        Alert.alert('Succès', 'Vous participez maintenant à cet événement !');
        navigation.navigate('MainTabs', { screen: 'profil' });
      })
      .catch(() => {
        Alert.alert('Erreur', 'Impossible de rejoindre cet événement.');
      });
  }, [participate, event.id, navigation, isOrganizer]);

  const handleUnjoin = useCallback(() => {
    unparticipate(event.id)
      .then(() => {
        setParticipantsDelta((prev) => prev - 1);
        Alert.alert('Succès', 'Vous ne participez plus à cet événement.');
      })
      .catch(() => {
        Alert.alert('Erreur', 'Impossible de quitter cet événement.');
      });
  }, [unparticipate, event.id]);

  return (
    <View style={styles.container}>
      {/* Custom Top Bar */}
      <SafeAreaView edges={['top']} style={styles.topBar}>
        <Pressable
          style={styles.backButton}
          onPress={handleBack}
          accessibilityRole="button"
          accessibilityLabel="Retour"
        >
          <AppIcons icon="arrow-left" size={24} color={theme.colors.black} />
        </Pressable>
        <AppText style={styles.topBarTitle} numberOfLines={1}>
          {optimisticEvent.title}
        </AppText>
        <View style={styles.topBarActions}>
          {isOrganizer && (
            <Pressable
              style={styles.actionButton}
              onPress={handleEdit}
              accessibilityRole="button"
              accessibilityLabel="Modifier l'événement"
              testID="event-detail-edit-button"
            >
              <Feather name="edit-2" size={20} color={theme.colors.black} />
            </Pressable>
          )}
          <Pressable
            style={styles.actionButton}
            onPress={handleShare}
            accessibilityRole="button"
            accessibilityLabel="Partager l'événement"
            testID="event-detail-share-button"
          >
            <AppIcons icon="share-2" iconLibrary="Feather" size={22} color={theme.colors.black} />
          </Pressable>
        </View>
      </SafeAreaView>

      <EventDetailBody event={optimisticEvent} />

      {!isOrganizer && isJoinable && (
        <JoinBar
          isJoined={isJoined}
          isPending={isJoined ? isUnparticipating : isParticipating}
          onJoin={handleJoin}
          onUnjoin={handleUnjoin}
        />
      )}
    </View>
  );
}

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    topBar: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: theme.spacing.lg,
      paddingBottom: theme.spacing.md,
      backgroundColor: theme.colors.background,
      zIndex: 10,
    },
    backButton: {
      padding: theme.spacing.xs,
    },
    topBarTitle: {
      fontSize: 16,
      fontWeight: theme.typography.fontWeight.bold,
      color: theme.colors.primarySocio,
      flex: 1,
      textAlign: 'center',
      marginHorizontal: theme.spacing.md,
    },
    topBarActions: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
    },
    actionButton: {
      padding: theme.spacing.xs,
      justifyContent: 'center',
      alignItems: 'center',
    },
    placeholderAvatar: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: theme.colors.lightGrey,
    },
    scrollContent: {
      paddingBottom: 100, // Make room for bottom bar
    },
    content: {
      padding: theme.spacing.xl,
    },
    categoryTitle: {
      fontSize: 12,
      fontWeight: theme.typography.fontWeight.bold,
      color: theme.colors.primarySocio,
      textTransform: 'uppercase',
      letterSpacing: 1,
      marginBottom: theme.spacing.xs,
    },
    title: {
      fontSize: 24,
      fontWeight: theme.typography.fontWeight.bold,
      color: theme.colors.text,
      marginBottom: theme.spacing.lg,
    },
    section: {
      backgroundColor: theme.colors.white,
      padding: theme.spacing.lg,
      borderRadius: theme.radius.lg,
      marginBottom: theme.spacing.lg,
      ...theme.shadows.card,
    },
    sectionTitle: {
      ...theme.sectionTitle,
      marginBottom: theme.spacing.md,
      color: theme.colors.text,
      fontWeight: theme.typography.fontWeight.bold,
      textTransform: 'none',
      letterSpacing: 0,
    },
    descriptionText: {
      fontSize: 14,
      lineHeight: 22,
      color: theme.colors.grey,
      fontFamily: theme.typography.fonts.primary,
      marginBottom: theme.spacing.lg,
    },
    bottomBar: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      padding: theme.spacing.xl,
      paddingBottom: 32,
      backgroundColor: theme.colors.white,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      ...theme.shadows.card,
    },
    joinButton: {
      backgroundColor: theme.colors.primarySocio,
      borderRadius: theme.radius.full,
      paddingVertical: 16,
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
    },
    joinedButton: {
      backgroundColor: theme.colors.danger,
    },
    joinButtonText: {
      color: theme.colors.white,
      fontWeight: theme.typography.fontWeight.bold,
      fontSize: 16,
      marginLeft: theme.spacing.sm,
    },
    mapSection: {
      marginTop: theme.spacing.lg,
    },
    mapContainer: {
      height: 200,
      borderRadius: theme.radius.lg,
      overflow: 'hidden',
      ...theme.shadows.card,
    },
  });
