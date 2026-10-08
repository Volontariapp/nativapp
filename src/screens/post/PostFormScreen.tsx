import React, { useCallback } from 'react';
import { View, StyleSheet, TextInput, Alert, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Feather from 'react-native-vector-icons/Feather';

import { AppText } from '@/components/typography/AppText';
import { AppButton } from '@/components/buttons/AppButton';
import AppHeader from '@/components/layout/AppHeader';
import { AppKeyboardScrollView } from '@/components/layout/AppKeyboardScrollView';
import { AppFormController } from '@/components/forms';
import { EventInput } from '@/components/inputs';
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
      Alert.alert('Erreur', 'Impossible de publier votre post.');
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
      <AppKeyboardScrollView
        contentContainerStyle={styles.scrollContent}
        contentInsetAdjustmentBehavior="automatic"
        bottomOffset={16}
      >
        <AppText style={styles.title}>Créer un Post</AppText>

        {/* Image Placeholder */}
        <Pressable
          style={styles.imagePlaceholder}
          onPress={() => {
            Alert.alert('Info', "L'ajout d'image n'est pas encore disponible.");
          }}
        >
          <Feather name="plus" size={32} color={theme.colors.grey} />
          <AppText style={styles.imagePlaceholderText}>Ajouter une image</AppText>
        </Pressable>

        <AppFormController
          control={control}
          name="title"
          label="Titre de la publication"
          errors={errors}
          render={({ field: { onChange, value } }) => (
            <EventInput
              value={value}
              onChangeText={onChange}
              placeholder="Ex: Belle initiative ce matin..."
            />
          )}
        />

        <AppFormController
          control={control}
          name="content"
          label="Contenu"
          errors={errors}
          render={({ field: { onChange, value } }) => (
            <TextInput
              style={[styles.input, styles.textArea]}
              value={value}
              onChangeText={onChange}
              multiline
              numberOfLines={5}
              placeholder="Partagez votre retour d'expérience, une annonce ou des nouvelles..."
              placeholderTextColor={theme.colors.grey}
            />
          )}
        />

        <EventSelector onSelectEvent={handleSelectEvent} selectedEventId={selectedEventId} />

        <View style={styles.publishContainer}>
          <AppButton
            text={isPending || isBatching ? 'Publication...' : 'Publier le post'}
            variant="socio"
            onPress={() => {
              void handleSubmit(onSubmit)();
            }}
            disabled={isPending || isBatching}
            style={styles.publishButton}
          />
        </View>

        {isDebugMode && (
          <View style={styles.testSection}>
            <AppText style={styles.testTitle}>Debug: Outils de test</AppText>
            <AppButton
              text={isBatching ? 'Création en cours...' : 'Créer 50 posts'}
              variant="socio"
              onPress={() => {
                void handleCreate50Posts();
              }}
              disabled={isPending || isBatching}
            />
          </View>
        )}

        <View style={styles.bottomSpacer} />
      </AppKeyboardScrollView>
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
      padding: theme.spacing.xl,
    },
    imagePlaceholder: {
      width: '100%',
      height: 180,
      borderRadius: theme.radius.md,
      borderWidth: 2,
      borderColor: theme.colors.lightGrey,
      borderStyle: 'dashed',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.colors.white,
      marginBottom: theme.spacing.xl,
    },
    imagePlaceholderText: {
      marginTop: theme.spacing.sm,
      color: theme.colors.grey,
      fontSize: 14,
      fontWeight: '500',
    },
    title: {
      fontSize: 28,
      fontWeight: 'bold',
      color: theme.colors.text,
      marginBottom: theme.spacing.xl,
    },
    input: {
      backgroundColor: theme.colors.white,
      borderWidth: 1,
      borderColor: theme.colors.lightGrey,
      borderRadius: theme.radius.md,
      padding: theme.spacing.md,
      fontSize: 16,
      color: theme.colors.text,
    },
    textArea: {
      height: 120,
      textAlignVertical: 'top',
    },
    publishContainer: {
      marginTop: theme.spacing.xl,
      alignItems: 'center',
      width: '100%',
    },
    publishButton: {
      width: '100%',
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
    testTitle: {
      fontSize: 12,
      color: theme.colors.grey,
      marginBottom: theme.spacing.sm,
      fontWeight: 'bold',
      textTransform: 'uppercase',
    },
    bottomSpacer: {
      height: theme.spacing.xxl,
    },
  });
