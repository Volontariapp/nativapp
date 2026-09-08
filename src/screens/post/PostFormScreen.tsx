import React, { useCallback } from 'react';
import { View, StyleSheet, ScrollView, Alert, type GestureResponderEvent } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AppText } from '@/components/typography/AppText';
import { AppInput } from '@/components/inputs/AppInput';
import { AppButton } from '@/components/buttons/AppButton';
import AppHeader from '@/components/layout/AppHeader';
import { theme } from '@/shared/themes/theme';
import { useCreatePost } from '@/api/post/hooks';
import { EventSelector } from '@/components/post/event-selector';
import { useDebug } from '@/context/DebugContext';
import { useQueryClient } from '@tanstack/react-query';

const createPostSchema = z.object({
  title: z.string().min(3, 'Le titre doit faire au moins 3 caractères').max(100),
  content: z.string().min(10, 'Le contenu doit faire au moins 10 caractères').max(1000),
  eventId: z.string().optional(),
});

type CreatePostFormData = z.infer<typeof createPostSchema>;

export function PostFormScreen(): React.JSX.Element {
  const navigation = useNavigation();
  const { mutateAsync: createPost, isPending } = useCreatePost();
  const { isDebugMode } = useDebug();
  const queryClient = useQueryClient();
  const [isBatching, setIsBatching] = React.useState(false);

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
  });

  const selectedEventId = watch('eventId');

  const handleSelectEvent = useCallback(
    (eventId: string | undefined) => {
      setValue('eventId', eventId);
    },
    [setValue],
  );

  const onSubmit = async (data: CreatePostFormData) => {
    try {
      await createPost({
        title: data.title,
        content: data.content,
        eventId: data.eventId,
      });
      navigation.goBack();
    } catch (err) {
      console.error('Failed to create post:', err instanceof Error ? err.message : String(err));
    }
  };

  const handleCreate50Posts = React.useCallback(async (): Promise<void> => {
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

  return (
    <View style={styles.container}>
      <AppHeader />
      <ScrollView contentContainerStyle={styles.content}>
        <AppText style={{ fontSize: 24, fontWeight: 'bold', marginBottom: theme.spacing.lg }}>
          Créer un post
        </AppText>

        <Controller
          control={control}
          name="title"
          render={({ field: { onChange, onBlur, value } }) => (
            <AppInput
              label="Titre du post"
              placeholder="Mon super post"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              errorMessage={errors.title?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="content"
          render={({ field: { onChange, onBlur, value } }) => (
            <AppInput
              label="Contenu"
              placeholder="Exprimez-vous..."
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              errorMessage={errors.content?.message}
              multiline
              numberOfLines={6}
              style={{ height: 120, textAlignVertical: 'top' }}
            />
          )}
        />

        <EventSelector onSelectEvent={handleSelectEvent} selectedEventId={selectedEventId} />

        <AppButton
          text={isPending || isBatching ? 'Publication en cours...' : 'Publier'}
          onPress={(e?: GestureResponderEvent) => {
            void handleSubmit(onSubmit)(e);
          }}
          disabled={isPending || isBatching}
          style={styles.submitButton}
        />

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
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    padding: theme.spacing.lg,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: theme.spacing.xs,
    marginTop: theme.spacing.md,
  },
  submitButton: {
    marginTop: theme.spacing.xl,
  },
  testSection: {
    marginTop: theme.spacing.xxl,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.white,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.lightGrey,
    borderStyle: 'dashed',
    marginBottom: theme.spacing.xl,
  },
  testTitle: {
    fontSize: 12,
    color: theme.colors.grey,
    marginBottom: theme.spacing.sm,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
});
