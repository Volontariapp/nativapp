import React, { useCallback } from 'react';
import { View, StyleSheet, TextInput, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { AppText } from '@/components/typography/AppText';
import { AppButton } from '@/components/buttons/AppButton';
import AppHeader from '@/components/layout/AppHeader';
import { AppKeyboardScrollView } from '@/components/layout/AppKeyboardScrollView';
import { AppFormController } from '@/components/forms';
import { EventInput } from '@/components/inputs';
import { useAppTheme, useStyles } from '@/context/ThemeContext';
import type { AppTheme } from '@/shared/themes/theme';
import { useCreatePost } from '@/api/post/hooks';
import { EventSelector } from '@/components/post/event-selector';
import { PostImagesPicker } from '@/components/post/post-images-picker';
import { PostDebugTools } from '@/components/post/post-debug-tools';
import { usePostImages } from '@/api/post/hooks/use-post-images';
import { generateIdempotencyKey } from '@/shared/lib/idempotency.utils';
import { useTabBarContentInset } from '@/navigation/hooks/useTabBarContentInset';

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

const PENDING_TITLE = 'Post en cours de traitement';
const PENDING_MESSAGE =
  'Vos images sont en cours de vérification. Votre post sera visible des autres utilisateurs dès qu’elles seront validées.';
const UPLOADING_HINT = 'Envoi des images en cours...';
const BLOCKING_HINT = 'Retirez ou renvoyez les images en échec ou refusées avant de publier.';

export function PostFormScreen(): React.JSX.Element {
  const { theme } = useAppTheme();
  const styles = useStyles(createStyles);
  const tabBarInset = useTabBarContentInset();

  const navigation = useNavigation();
  const { mutateAsync: createPost, isPending } = useCreatePost();
  const postImages = usePostImages();
  // Une seule clé par formulaire : un réessai après échec reste idempotent côté serveur.
  const [idempotencyKey] = React.useState(generateIdempotencyKey);
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

  const isBusy = isPending || isBatching;
  const cannotPublish = isBusy || postImages.isUploading || postImages.hasBlockingImage;

  const onSubmit = async (data: CreatePostFormData) => {
    try {
      const response = await createPost({
        title: data.title.trim(),
        content: data.content.trim(),
        eventId: data.eventId,
        fileIds: postImages.fileIds,
        idempotencyKey,
      });
      if (response.post.mediaStatus === 'PENDING') {
        Alert.alert(PENDING_TITLE, PENDING_MESSAGE, [
          {
            text: 'OK',
            onPress: () => {
              navigation.goBack();
            },
          },
        ]);
        return;
      }
      navigation.goBack();
    } catch (err) {
      console.error('Failed to create post:', err instanceof Error ? err.message : String(err));
      Alert.alert('Erreur', 'Impossible de publier votre post.');
    }
  };

  return (
    <View style={styles.container}>
      <AppHeader showBack />
      <AppKeyboardScrollView
        contentContainerStyle={[styles.scrollContent, tabBarInset]}
        contentInsetAdjustmentBehavior="automatic"
        bottomOffset={16}
      >
        <AppText style={styles.title}>Créer un Post</AppText>

        <PostImagesPicker
          images={postImages.images}
          remainingSlots={postImages.remainingSlots}
          onAdd={() => {
            void postImages.addImages();
          }}
          onRetry={postImages.retryImage}
          onRemove={postImages.removeImage}
        />

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
          {postImages.isUploading && <AppText style={styles.hint}>{UPLOADING_HINT}</AppText>}
          {postImages.hasBlockingImage && (
            <AppText style={styles.hintError}>{BLOCKING_HINT}</AppText>
          )}
          <AppButton
            text={isBusy ? 'Publication...' : 'Publier le post'}
            variant="socio"
            onPress={() => {
              if (!cannotPublish) {
                void handleSubmit(onSubmit)();
              }
            }}
            disabled={cannotPublish}
            style={styles.publishButton}
          />
        </View>

        <PostDebugTools
          selectedEventId={selectedEventId}
          disabled={isPending}
          onBatchingChange={setIsBatching}
        />

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
    hint: {
      marginBottom: theme.spacing.sm,
      fontSize: 13,
      color: theme.colors.grey,
    },
    hintError: {
      marginBottom: theme.spacing.sm,
      fontSize: 13,
      color: theme.colors.danger,
    },
    bottomSpacer: {
      height: theme.spacing.xxl,
    },
  });
