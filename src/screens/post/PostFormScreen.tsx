import React, { useCallback } from 'react';
import { View, StyleSheet, ScrollView, type GestureResponderEvent } from 'react-native';
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

const createPostSchema = z.object({
  title: z.string().min(3, 'Le titre doit faire au moins 3 caractères').max(100),
  content: z.string().min(10, 'Le contenu doit faire au moins 10 caractères').max(1000),
  eventId: z.string().optional(),
});

type CreatePostFormData = z.infer<typeof createPostSchema>;

export function PostFormScreen(): React.JSX.Element {
  const navigation = useNavigation();
  const { mutateAsync: createPost, isPending } = useCreatePost();

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
          text={isPending ? 'Publication en cours...' : 'Publier'}
          onPress={(e?: GestureResponderEvent) => {
            void handleSubmit(onSubmit)(e);
          }}
          disabled={isPending}
          style={styles.submitButton}
        />
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
});
