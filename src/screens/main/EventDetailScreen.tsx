import React from 'react';
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
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { MainStackParamList } from '../../navigation/stacks/MainStack';

import { AppText } from '@/components/typography/AppText';
import { AppIcons } from '@/components/media/AppIcons';
import { theme } from '@/shared/themes/theme';
import { EventState } from '@volontariapp/contracts';
import type { AppEvent } from '@/api/event/event.api';
import { mapEventType } from '@/shared/lib/event-mappers.utils';

import { EventCover } from '../../components/event/EventCover';
import { EventInfoCards } from '../../components/event/EventInfoCards';
import { EventTags } from '../../components/event/EventTags';
import { EventParticipants } from '../../components/event/EventParticipants';
import { EventRequirements } from '../../components/event/EventRequirements';
import { EventOrganizer } from '../../components/event/EventOrganizer';
import { ImpactScoreBadge } from '../../components/event/ImpactScoreBadge';
import AppMap from '@/components/map/AppMap';

type Props = NativeStackScreenProps<MainStackParamList, 'EventDetail'>;

export function EventDetailScreen({ route }: Props) {
  const event: AppEvent = route.params.event;
  const navigation = useNavigation();

  const isJoinable =
    event.state === EventState.EVENT_STATE_PUBLISHED ||
    event.state === EventState.EVENT_STATE_DRAFT;
  const [isJoined, setIsJoined] = React.useState(false);
  const [isPending, startTransition] = React.useTransition();

  const handleJoin = () => {
    startTransition(async () => {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setIsJoined(true);
      Alert.alert('Succès', 'Vous participez maintenant à cet événement !');
    });
  };

  return (
    <View style={styles.container}>
      {/* Custom Top Bar */}
      <SafeAreaView edges={['top']} style={styles.topBar}>
        <Pressable
          style={styles.backButton}
          onPress={() => {
            navigation.goBack();
          }}
        >
          <AppIcons icon="arrow-left" size={24} color={theme.colors.black} />
        </Pressable>
        <AppText style={styles.topBarTitle} numberOfLines={1}>
          {event.title}
        </AppText>
        <Pressable
          style={styles.backButton}
          onPress={() => {
            void Share.share({
              message: `Rejoins-moi pour l'événement "${event.title}" sur Volontariapp !`,
            });
          }}
        >
          <AppIcons icon="share-2" iconLibrary="Feather" size={24} color={theme.colors.black} />
        </Pressable>
      </SafeAreaView>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <EventCover event={event} />

        <View style={styles.content}>
          <AppText style={styles.categoryTitle}>{mapEventType(event.type)}</AppText>
          <AppText style={styles.title}>{event.title}</AppText>
          {event.awardedImpactScore > 0 && (
            <ImpactScoreBadge score={event.awardedImpactScore} style={{ marginBottom: 16 }} />
          )}

          <EventOrganizer organizerId={event.organizerId} />

          <EventInfoCards event={event} />

          <View style={styles.section}>
            <AppText style={styles.sectionTitle}>Description</AppText>
            <AppText style={styles.descriptionText}>{event.description}</AppText>

            {event.tags && event.tags.length > 0 && <EventTags tags={event.tags} />}
          </View>

          <EventParticipants event={event} />

          {event.requirements && event.requirements.length > 0 && (
            <EventRequirements requirements={event.requirements} />
          )}

          {event.location && (
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
          )}
        </View>
      </ScrollView>

      {isJoinable && !isJoined && (
        <View style={styles.bottomBar}>
          <Pressable style={styles.joinButton} onPress={handleJoin} disabled={isPending}>
            {isPending ? (
              <ActivityIndicator color={theme.colors.white} />
            ) : (
              <>
                <AppIcons
                  icon="user-plus"
                  iconLibrary="Feather"
                  size={20}
                  color={theme.colors.white}
                />
                <AppText style={styles.joinButtonText}>JOIN</AppText>
              </>
            )}
          </Pressable>
        </View>
      )}

      {isJoinable && isJoined && (
        <View style={styles.bottomBar}>
          <View style={[styles.joinButton, styles.joinedButton]}>
            <AppIcons icon="check" iconLibrary="Feather" size={20} color={theme.colors.white} />
            <AppText style={styles.joinButtonText}>JOINED</AppText>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
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
    color: theme.colors.black,
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
    color: theme.colors.black,
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
    backgroundColor: theme.colors.success,
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
