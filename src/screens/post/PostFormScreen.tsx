import React, { useCallback, useMemo, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  TextInput,
  Pressable,
  type GestureResponderEvent,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Feather from 'react-native-vector-icons/Feather';
import { AppText } from '@/components/typography/AppText';
import { AppButton } from '@/components/buttons/AppButton';
import AppHeader from '@/components/layout/AppHeader';
import { AppKeyboardAvoidingView } from '@/components/layout/AppKeyboardAvoidingView';
import { useAppTheme, useStyles } from '@/context/ThemeContext';
import type { AppTheme } from '@/shared/themes/theme';
import { useCreatePost } from '@/api/post/hooks';
import { useGetMyEvents } from '@/api/event/hooks/use-get-my-events';
import { EventSelector } from '@/components/post/event-selector';
import { useDebug } from '@/context/DebugContext';
import { useQueryClient } from '@tanstack/react-query';
import { mapEventType } from '@/shared/lib/event-mappers.utils';
import { formatDate } from '@/shared/lib/format-date.utils';
import { EventType } from '@volontariapp/contracts';

const createPostSchema = z.object({
  title: z
    .string()
    .min(3, 'Le titre doit faire au moins 3 caractères')
    .max(100, 'Le titre ne peut pas dépasser 100 caractères'),
  content: z
    .string()
    .min(10, 'Le contenu doit faire au moins 10 caractères')
    .max(1000, 'Le contenu ne peut pas dépasser 1000 caractères'),
  eventId: z.string().optional(),
});

type CreatePostFormData = z.infer<typeof createPostSchema>;

interface CharacterCounterProps {
  currentLength: number;
  minLength: number;
  maxLength: number;
  itemLabel: string;
}

function CharacterCounter({
  currentLength,
  minLength,
  maxLength,
  itemLabel,
}: CharacterCounterProps): React.JSX.Element {
  const { theme } = useAppTheme();
  const styles = useStyles(createStyles);

  const percentage = Math.min(100, Math.max(0, (currentLength / maxLength) * 100));

  let progressColor = theme.colors.grey;
  let statusText = `Min. ${String(minLength)} caractères requis`;
  let isSuccess = false;

  if (currentLength > 0 && currentLength < minLength) {
    statusText = `${String(minLength - currentLength)} caractère(s) manquant(s)`;
    progressColor = theme.colors.warning;
  } else if (currentLength >= minLength && currentLength <= maxLength * 0.85) {
    statusText = `✓ ${itemLabel} valide`;
    progressColor = theme.colors.primaryEco;
    isSuccess = true;
  } else if (currentLength > maxLength * 0.85 && currentLength < maxLength) {
    statusText = 'Proche de la limite';
    progressColor = theme.colors.warning;
    isSuccess = true;
  } else if (currentLength >= maxLength) {
    statusText = 'Limite maximale atteinte';
    progressColor = theme.colors.danger;
  }

  return (
    <View style={styles.counterContainer}>
      <View style={styles.progressBarTrack}>
        <View
          style={[
            styles.progressBarFill,
            {
              width: `${String(percentage)}%` as `${number}%`,
              backgroundColor: progressColor,
            },
          ]}
        />
      </View>
      <View style={styles.counterLabelsRow}>
        <AppText
          style={[
            styles.counterStatusText,
            isSuccess && styles.counterStatusSuccess,
            currentLength >= maxLength && styles.counterStatusDanger,
          ]}
        >
          {statusText}
        </AppText>
        <AppText style={styles.counterValueText}>
          {String(currentLength)} / {String(maxLength)}
        </AppText>
      </View>
    </View>
  );
}

export function PostFormScreen(): React.JSX.Element {
  const { theme } = useAppTheme();
  const styles = useStyles(createStyles);
  const insets = useSafeAreaInsets();

  const navigation = useNavigation();
  const { mutateAsync: createPost, isPending } = useCreatePost();
  const { isDebugMode } = useDebug();
  const queryClient = useQueryClient();
  const [isBatching, setIsBatching] = useState(false);
  const [showPreview, setShowPreview] = useState(true);
  const [titleFocused, setTitleFocused] = useState(false);
  const [contentFocused, setContentFocused] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<CreatePostFormData>({
    resolver: zodResolver(createPostSchema),
    defaultValues: {
      title: '',
      content: '',
      eventId: undefined,
    },
    mode: 'onChange',
  });

  const watchedTitle = watch('title');
  const watchedContent = watch('content');
  const selectedEventId = watch('eventId');

  const { data: eventsData } = useGetMyEvents(100);
  const selectedEvent = useMemo(() => {
    if (selectedEventId === undefined || selectedEventId === '') return undefined;
    const all = eventsData?.pages.flatMap((page) => page.events) ?? [];
    return all.find((e) => e.id === selectedEventId);
  }, [eventsData, selectedEventId]);

  const handleSelectEvent = useCallback(
    (eventId: string | undefined) => {
      setValue('eventId', eventId);
    },
    [setValue],
  );

  const isFormValid = useMemo(() => {
    return watchedTitle.trim().length >= 3 && watchedContent.trim().length >= 10;
  }, [watchedTitle, watchedContent]);

  const onSubmit = async (data: CreatePostFormData) => {
    try {
      await createPost({
        title: data.title.trim(),
        content: data.content.trim(),
        eventId: data.eventId,
      });
      navigation.goBack();
    } catch (err) {
      console.error('Failed to create post:', err instanceof Error ? err.message : String(err));
      Alert.alert('Erreur', 'Impossible de publier votre post. Veuillez réessayer.');
    }
  };

  const handleCreate50Posts = useCallback(async (): Promise<void> => {
    setIsBatching(true);
    try {
      const titles = [
        "Aujourd'hui on se bouge !",
        'Super initiative dans le quartier',
        "J'ai besoin de bras",
        'Merci à tous les participants',
        'Prochain événement la semaine prochaine',
        "C'est quoi votre projet préféré ?",
      ];

      const contents = [
        "On a fait du super boulot ce matin. N'hésitez pas à nous rejoindre pour la prochaine session. Plus on est de fous, plus on rit !",
        "C'était intense mais tellement gratifiant. La planète vous dit merci.",
        'Si des personnes sont motivées pour nous aider à trier les dons demain, envoyez-moi un message !',
        "Un immense merci à la communauté pour votre générosité, ça fait chaud au cœur de voir autant d'entraide.",
        "Je lance l'idée comme ça, mais qui serait chaud pour monter un groupe de nettoyage dans le centre-ville ?",
        'Regardez-moi cette belle équipe ! Merci encore pour tout.',
      ];

      const promises = [];
      for (let i = 0; i < 50; i++) {
        const randomTitle = titles[Math.floor(Math.random() * titles.length)] ?? '';
        const randomContent = contents[Math.floor(Math.random() * contents.length)] ?? '';
        promises.push(
          createPost({
            title: `${randomTitle} #${String(i + 1)}`,
            content: randomContent,
            eventId: selectedEventId,
          }),
        );
      }

      await Promise.all(promises);
      void queryClient.invalidateQueries({ queryKey: ['posts'] });
      Alert.alert('Succès', 'Les 50 posts ont été créés avec succès !', [
        {
          text: 'OK',
          onPress: () => {
            navigation.goBack();
          },
        },
      ]);
    } catch {
      Alert.alert('Erreur', 'Impossible de créer les posts.');
    } finally {
      setIsBatching(false);
    }
  }, [createPost, queryClient, navigation, selectedEventId]);

  const isSelectedSocial =
    selectedEvent !== undefined &&
    (selectedEvent.type === EventType.EVENT_TYPE_SOCIAL ||
      String(selectedEvent.type) === EventType[EventType.EVENT_TYPE_SOCIAL]);

  return (
    <View style={styles.container}>
      <AppHeader showBack />

      <AppKeyboardAvoidingView style={styles.keyboardAvoiding}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Hero Banner */}
          <View style={styles.heroBanner}>
            <View style={styles.heroIconBadge}>
              <Feather name="edit-3" size={24} color={theme.colors.primaryEco} />
            </View>
            <View style={styles.heroTextContainer}>
              <AppText style={styles.heroTitle}>Créer une publication</AppText>
              <AppText style={styles.heroSubtitle}>
                Partagez vos actions, vos réussites et inspirez la communauté bénévole.
              </AppText>
            </View>
          </View>

          {/* Card: Inputs Section */}
          <View style={styles.formCard}>
            <View style={styles.cardHeaderRow}>
              <Feather name="message-square" size={18} color={theme.colors.primaryEco} />
              <AppText style={styles.cardSectionTitle}>Votre message</AppText>
            </View>

            {/* Field: Title */}
            <View style={styles.fieldGroup}>
              <View style={styles.labelRow}>
                <AppText style={styles.inputLabel}>Titre de la publication</AppText>
                <AppText style={styles.requiredMark}>*</AppText>
              </View>

              <Controller
                control={control}
                name="title"
                render={({ field: { onChange, onBlur, value } }) => (
                  <View
                    style={[
                      styles.inputWrapper,
                      titleFocused && styles.inputWrapperFocused,
                      errors.title?.message !== undefined && styles.inputWrapperError,
                    ]}
                  >
                    <TextInput
                      style={styles.textInput}
                      placeholder="Ex: Grande collecte de printemps pour le quartier..."
                      placeholderTextColor={theme.colors.grey}
                      value={value}
                      maxLength={100}
                      onFocus={() => {
                        setTitleFocused(true);
                      }}
                      onBlur={() => {
                        setTitleFocused(false);
                        onBlur();
                      }}
                      onChangeText={onChange}
                    />
                  </View>
                )}
              />

              <CharacterCounter
                currentLength={watchedTitle.length}
                minLength={3}
                maxLength={100}
                itemLabel="Titre"
              />

              {errors.title?.message !== undefined && (
                <AppText style={styles.fieldErrorMessage}>{errors.title.message}</AppText>
              )}
            </View>

            {/* Field: Content */}
            <View style={styles.fieldGroup}>
              <View style={styles.labelRow}>
                <AppText style={styles.inputLabel}>Contenu</AppText>
                <AppText style={styles.requiredMark}>*</AppText>
              </View>

              <Controller
                control={control}
                name="content"
                render={({ field: { onChange, onBlur, value } }) => (
                  <View
                    style={[
                      styles.inputWrapper,
                      styles.textAreaWrapper,
                      contentFocused && styles.inputWrapperFocused,
                      errors.content?.message !== undefined && styles.inputWrapperError,
                    ]}
                  >
                    <TextInput
                      style={[styles.textInput, styles.textAreaInput]}
                      placeholder="Racontez votre expérience, les moments forts ou les prochaines étapes de l'action bénévole..."
                      placeholderTextColor={theme.colors.grey}
                      value={value}
                      maxLength={1000}
                      multiline
                      numberOfLines={6}
                      onFocus={() => {
                        setContentFocused(true);
                      }}
                      onBlur={() => {
                        setContentFocused(false);
                        onBlur();
                      }}
                      onChangeText={onChange}
                    />
                  </View>
                )}
              />

              <CharacterCounter
                currentLength={watchedContent.length}
                minLength={10}
                maxLength={1000}
                itemLabel="Contenu"
              />

              {errors.content?.message !== undefined && (
                <AppText style={styles.fieldErrorMessage}>{errors.content.message}</AppText>
              )}
            </View>
          </View>

          {/* Section: Event Selector */}
          <EventSelector onSelectEvent={handleSelectEvent} selectedEventId={selectedEventId} />

          {/* Section: Live Feed Preview */}
          <View style={styles.previewCard}>
            <Pressable
              style={styles.previewToggleHeader}
              onPress={() => {
                setShowPreview((prev) => !prev);
              }}
            >
              <View style={styles.previewHeaderLeft}>
                <Feather name="eye" size={18} color={theme.colors.primarySocio} />
                <AppText style={styles.previewSectionTitle}>Aperçu en direct</AppText>
              </View>
              <View style={styles.previewToggleBadge}>
                <AppText style={styles.previewToggleText}>
                  {showPreview ? 'Masquer' : 'Afficher'}
                </AppText>
                <Feather
                  name={showPreview ? 'chevron-up' : 'chevron-down'}
                  size={16}
                  color={theme.colors.primarySocio}
                />
              </View>
            </Pressable>

            {showPreview && (
              <View style={styles.previewBody}>
                {/* Simulated Feed Post */}
                <View style={styles.simulatedPostCard}>
                  {/* Post Author Header */}
                  <View style={styles.simulatedAuthorRow}>
                    <View style={styles.simulatedAvatar}>
                      <Feather name="user" size={18} color={theme.colors.white} />
                    </View>
                    <View style={styles.simulatedAuthorMeta}>
                      <AppText style={styles.simulatedAuthorName}>Vous</AppText>
                      <AppText style={styles.simulatedAuthorTime}>À l&apos;instant • Public</AppText>
                    </View>
                    <Feather name="more-horizontal" size={18} color={theme.colors.grey} />
                  </View>

                  {/* Post Title */}
                  <AppText
                    style={[
                      styles.simulatedTitle,
                      watchedTitle.trim() === '' && styles.simulatedPlaceholder,
                    ]}
                  >
                    {watchedTitle.trim() !== ''
                      ? watchedTitle.trim()
                      : 'Titre de votre publication...'}
                  </AppText>

                  {/* Post Content */}
                  <AppText
                    style={[
                      styles.simulatedContent,
                      watchedContent.trim() === '' && styles.simulatedPlaceholder,
                    ]}
                  >
                    {watchedContent.trim() !== ''
                      ? watchedContent.trim()
                      : "Le message et les détails de votre action s'afficheront ici en temps réel..."}
                  </AppText>

                  {/* Attached Event Preview Inside Post */}
                  {selectedEvent !== undefined && (
                    <View style={styles.simulatedEventAttachment}>
                      <View style={styles.simulatedEventHeader}>
                        <View
                          style={[
                            styles.simulatedTypeBadge,
                            isSelectedSocial
                              ? styles.simulatedTypeBadgeSocial
                              : styles.simulatedTypeBadgeEco,
                          ]}
                        >
                          <AppText
                            style={[
                              styles.simulatedTypeBadgeText,
                              isSelectedSocial
                                ? styles.simulatedTypeBadgeTextSocial
                                : styles.simulatedTypeBadgeTextEco,
                            ]}
                          >
                            {mapEventType(selectedEvent.type)}
                          </AppText>
                        </View>
                        <AppText style={styles.simulatedEventDate}>
                          {formatDate(selectedEvent.startAt, {
                            day: '2-digit',
                            month: 'short',
                          })}
                        </AppText>
                      </View>
                      <AppText style={styles.simulatedEventTitle} numberOfLines={1}>
                        {selectedEvent.title}
                      </AppText>
                      <View style={styles.simulatedEventLocation}>
                        <Feather name="map-pin" size={12} color={theme.colors.grey} />
                        <AppText style={styles.simulatedEventLocationText} numberOfLines={1}>
                          {selectedEvent.localisationName}
                        </AppText>
                      </View>
                    </View>
                  )}

                  {/* Simulated Social Interactions */}
                  <View style={styles.simulatedActionsRow}>
                    <View style={styles.simulatedActionItem}>
                      <Feather name="heart" size={16} color={theme.colors.grey} />
                      <AppText style={styles.simulatedActionText}>0 J&apos;aime</AppText>
                    </View>
                    <View style={styles.simulatedActionItem}>
                      <Feather name="message-circle" size={16} color={theme.colors.grey} />
                      <AppText style={styles.simulatedActionText}>0 Commentaire</AppText>
                    </View>
                    <View style={styles.simulatedActionItem}>
                      <Feather name="share-2" size={16} color={theme.colors.grey} />
                      <AppText style={styles.simulatedActionText}>Partager</AppText>
                    </View>
                  </View>
                </View>
              </View>
            )}
          </View>

          {/* Section: Debug Tools */}
          {isDebugMode && (
            <View style={styles.testSection}>
              <View style={styles.testHeaderRow}>
                <Feather name="tool" size={14} color={theme.colors.text} />
                <AppText style={styles.testTitle}>Debug: Outils de test</AppText>
              </View>
              <AppButton
                text={isBatching ? 'Création en cours...' : 'Créer 50 posts de test'}
                variant="socio"
                onPress={() => {
                  void handleCreate50Posts();
                }}
                disabled={isPending || isBatching}
              />
            </View>
          )}
        </ScrollView>

        {/* Sticky Premium Bottom Action Bar */}
        <View
          style={[
            styles.stickyFooter,
            { paddingBottom: Math.max(insets.bottom, theme.spacing.md) },
          ]}
        >
          <View style={styles.footerStatusRow}>
            {isFormValid ? (
              <View style={styles.statusPillValid}>
                <Feather name="check-circle" size={13} color={theme.colors.primaryEco} />
                <AppText style={styles.statusPillValidText}>Prêt à être publié</AppText>
              </View>
            ) : (
              <View style={styles.statusPillInfo}>
                <Feather name="info" size={13} color={theme.colors.grey} />
                <AppText style={styles.statusPillInfoText}>
                  Titre (min. 3) et message (min. 10) requis
                </AppText>
              </View>
            )}
          </View>

          <AppButton
            text={isPending || isBatching ? 'Publication en cours...' : 'Publier le post'}
            icon="send"
            variant="eco"
            onPress={(e?: GestureResponderEvent) => {
              void handleSubmit(onSubmit)(e);
            }}
            disabled={!isFormValid || isPending || isBatching}
            style={styles.submitButton}
          />
        </View>
      </AppKeyboardAvoidingView>
    </View>
  );
}

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    keyboardAvoiding: {
      flex: 1,
    },
    scrollContent: {
      paddingHorizontal: theme.spacing.lg,
      paddingTop: theme.spacing.md,
      paddingBottom: 120,
    },
    heroBanner: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.white,
      borderRadius: theme.radius.lg,
      padding: theme.spacing.lg,
      marginBottom: theme.spacing.lg,
      borderWidth: 1,
      borderColor: theme.colors.lightGrey,
      gap: theme.spacing.md,
    },
    heroIconBadge: {
      width: 48,
      height: 48,
      borderRadius: theme.radius.md,
      backgroundColor: theme.colors.badgeEcoBackground,
      justifyContent: 'center',
      alignItems: 'center',
    },
    heroTextContainer: {
      flex: 1,
    },
    heroTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: theme.colors.text,
      letterSpacing: -0.5,
      marginBottom: 2,
    },
    heroSubtitle: {
      fontSize: 13,
      color: theme.colors.grey,
      lineHeight: 18,
    },
    formCard: {
      backgroundColor: theme.colors.white,
      borderRadius: theme.radius.lg,
      padding: theme.spacing.lg,
      marginBottom: theme.spacing.lg,
      borderWidth: 1,
      borderColor: theme.colors.lightGrey,
    },
    cardHeaderRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
      marginBottom: theme.spacing.md,
      paddingBottom: theme.spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.lightGrey,
    },
    cardSectionTitle: {
      fontSize: 15,
      fontWeight: '600',
      color: theme.colors.text,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    fieldGroup: {
      marginBottom: theme.spacing.lg,
    },
    labelRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: theme.spacing.xs,
    },
    inputLabel: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.text,
    },
    requiredMark: {
      fontSize: 14,
      fontWeight: 'bold',
      color: theme.colors.danger,
      marginLeft: 4,
    },
    inputWrapper: {
      backgroundColor: theme.colors.background,
      borderWidth: 1.5,
      borderColor: theme.colors.lightGrey,
      borderRadius: theme.radius.md,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
    },
    inputWrapperFocused: {
      borderColor: theme.colors.primaryEco,
      backgroundColor: theme.colors.white,
    },
    inputWrapperError: {
      borderColor: theme.colors.danger,
    },
    textAreaWrapper: {
      paddingVertical: theme.spacing.sm,
    },
    textInput: {
      fontSize: 15,
      color: theme.colors.text,
      padding: 0,
    },
    textAreaInput: {
      height: 120,
      textAlignVertical: 'top',
    },
    fieldErrorMessage: {
      fontSize: 12,
      color: theme.colors.danger,
      marginTop: 4,
      fontWeight: '500',
    },
    counterContainer: {
      marginTop: theme.spacing.xs,
    },
    progressBarTrack: {
      height: 4,
      backgroundColor: theme.colors.lightGrey + '80',
      borderRadius: theme.radius.full,
      overflow: 'hidden',
      marginBottom: 4,
    },
    progressBarFill: {
      height: '100%',
      borderRadius: theme.radius.full,
    },
    counterLabelsRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    counterStatusText: {
      fontSize: 11,
      color: theme.colors.grey,
    },
    counterStatusSuccess: {
      color: theme.colors.primaryEco,
      fontWeight: '600',
    },
    counterStatusDanger: {
      color: theme.colors.danger,
      fontWeight: '600',
    },
    counterValueText: {
      fontSize: 11,
      fontWeight: '600',
      color: theme.colors.grey,
    },
    previewCard: {
      backgroundColor: theme.colors.white,
      borderRadius: theme.radius.lg,
      borderWidth: 1,
      borderColor: theme.colors.lightGrey,
      marginBottom: theme.spacing.lg,
      overflow: 'hidden',
    },
    previewToggleHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: theme.spacing.md,
      backgroundColor: theme.colors.badgeSocioBackground + '40',
    },
    previewHeaderLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
    },
    previewSectionTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.primarySocio,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    previewToggleBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    previewToggleText: {
      fontSize: 12,
      fontWeight: '600',
      color: theme.colors.primarySocio,
    },
    previewBody: {
      padding: theme.spacing.md,
      backgroundColor: theme.colors.background,
    },
    simulatedPostCard: {
      backgroundColor: theme.colors.white,
      borderRadius: theme.radius.md,
      padding: theme.spacing.md,
      borderWidth: 1,
      borderColor: theme.colors.lightGrey,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 6,
      elevation: 2,
    },
    simulatedAuthorRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: theme.spacing.md,
    },
    simulatedAvatar: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: theme.colors.primaryEco,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: theme.spacing.sm,
    },
    simulatedAuthorMeta: {
      flex: 1,
    },
    simulatedAuthorName: {
      fontSize: 14,
      fontWeight: 'bold',
      color: theme.colors.text,
    },
    simulatedAuthorTime: {
      fontSize: 11,
      color: theme.colors.grey,
    },
    simulatedTitle: {
      fontSize: 16,
      fontWeight: 'bold',
      color: theme.colors.text,
      marginBottom: theme.spacing.xs,
    },
    simulatedContent: {
      fontSize: 14,
      color: theme.colors.text,
      lineHeight: 20,
      marginBottom: theme.spacing.md,
    },
    simulatedPlaceholder: {
      color: theme.colors.grey,
      fontStyle: 'italic',
    },
    simulatedEventAttachment: {
      backgroundColor: theme.colors.background,
      borderRadius: theme.radius.sm,
      padding: theme.spacing.sm,
      marginBottom: theme.spacing.md,
      borderLeftWidth: 3,
      borderLeftColor: theme.colors.primaryEco,
    },
    simulatedEventHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 2,
    },
    simulatedTypeBadge: {
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: theme.radius.full,
    },
    simulatedTypeBadgeEco: {
      backgroundColor: theme.colors.badgeEcoBackground,
    },
    simulatedTypeBadgeSocial: {
      backgroundColor: theme.colors.badgeSocioBackground,
    },
    simulatedTypeBadgeText: {
      fontSize: 10,
      fontWeight: '600',
    },
    simulatedTypeBadgeTextEco: {
      color: theme.colors.primaryEco,
    },
    simulatedTypeBadgeTextSocial: {
      color: theme.colors.primarySocio,
    },
    simulatedEventDate: {
      fontSize: 11,
      color: theme.colors.grey,
    },
    simulatedEventTitle: {
      fontSize: 13,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: 2,
    },
    simulatedEventLocation: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    simulatedEventLocationText: {
      fontSize: 11,
      color: theme.colors.grey,
    },
    simulatedActionsRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      borderTopWidth: 1,
      borderTopColor: theme.colors.lightGrey,
      paddingTop: theme.spacing.sm,
    },
    simulatedActionItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    simulatedActionText: {
      fontSize: 12,
      color: theme.colors.grey,
    },
    testSection: {
      marginTop: theme.spacing.md,
      padding: theme.spacing.md,
      backgroundColor: theme.colors.white,
      borderRadius: theme.radius.md,
      borderWidth: 1,
      borderColor: theme.colors.lightGrey,
      borderStyle: 'dashed',
    },
    testHeaderRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      marginBottom: theme.spacing.sm,
    },
    testTitle: {
      fontSize: 12,
      color: theme.colors.text,
      fontWeight: 'bold',
      textTransform: 'uppercase',
    },
    stickyFooter: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: theme.colors.white,
      borderTopWidth: 1,
      borderTopColor: theme.colors.lightGrey,
      paddingHorizontal: theme.spacing.lg,
      paddingTop: theme.spacing.sm,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: -4 },
      shadowOpacity: 0.08,
      shadowRadius: 10,
      elevation: 10,
    },
    footerStatusRow: {
      alignItems: 'center',
      marginBottom: theme.spacing.xs,
    },
    statusPillValid: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    statusPillValidText: {
      fontSize: 12,
      fontWeight: '600',
      color: theme.colors.primaryEco,
    },
    statusPillInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    statusPillInfoText: {
      fontSize: 12,
      color: theme.colors.grey,
    },
    submitButton: {
      width: '100%',
    },
  });
