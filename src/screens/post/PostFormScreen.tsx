import React from 'react';
import { View, StyleSheet, TextInput } from 'react-native';
import { AppKeyboardScrollView } from '@/components/layout/AppKeyboardScrollView';
import { AppText } from '@/components/typography/AppText';
import { AppButton } from '@/components/buttons/AppButton';
import AppHeader from '@/components/layout/AppHeader';
import { theme } from '@/shared/themes/theme';

import type { CreatePostRequest } from '@volontariapp/contracts';

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { postSchema, type PostFormValues } from '@/api/post/post.schema';
import { useCreatePost } from '@/api/post/hooks/use-create-post';

export function PostFormScreen(): React.JSX.Element {
  const mutation = useCreatePost();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<PostFormValues>({
    resolver: zodResolver(postSchema),
    defaultValues: {
      title: '',
      content: '',
    },
  });

  const onSubmit = handleSubmit((data) => {
    const payload: CreatePostRequest = {
      title: data.title,
      content: data.content,
    };
    mutation.mutate(payload);
  });

  return (
    <View style={styles.container}>
      <AppHeader showBack />
      <AppKeyboardScrollView
        contentContainerStyle={styles.scrollContent}
        contentInsetAdjustmentBehavior="automatic"
        bottomOffset={16}
      >
        <AppText style={styles.title}>Créer un Post</AppText>

        <View style={styles.inputGroup}>
          <AppText style={styles.label}>Titre du post</AppText>
          <Controller
            control={control}
            name="title"
            render={({ field: { onChange, value } }) => (
              <TextInput
                style={styles.input}
                value={value}
                onChangeText={onChange}
                placeholder="Un titre accrocheur..."
              />
            )}
          />
          {errors.title ? <AppText style={styles.errorText}>{errors.title.message}</AppText> : null}
        </View>

        <View style={styles.inputGroup}>
          <AppText style={styles.label}>Contenu du post</AppText>
          <Controller
            control={control}
            name="content"
            render={({ field: { onChange, value } }) => (
              <TextInput
                style={[styles.input, styles.textArea]}
                value={value}
                onChangeText={onChange}
                multiline
                numberOfLines={6}
                placeholder="Partagez quelque chose avec la communauté..."
              />
            )}
          />
          {errors.content ? (
            <AppText style={styles.errorText}>{errors.content.message}</AppText>
          ) : null}
        </View>

        <AppButton
          text={mutation.isPending ? 'Création en cours...' : 'Publier le post'}
          onPress={() => {
            void onSubmit();
          }}
          disabled={mutation.isPending}
        />
        <View style={styles.bottomSpacer} />
      </AppKeyboardScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
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
    color: theme.colors.black,
    marginBottom: theme.spacing.xl,
  },
  inputGroup: {
    marginBottom: theme.spacing.lg,
  },
  label: {
    fontSize: 14,
    color: theme.colors.grey,
    marginBottom: theme.spacing.xs,
    fontWeight: '600',
  },
  input: {
    backgroundColor: theme.colors.white,
    borderWidth: 1,
    borderColor: theme.colors.lightGrey,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    fontSize: 16,
    color: theme.colors.black,
  },
  textArea: {
    height: 150,
    textAlignVertical: 'top',
  },
  errorText: {
    color: theme.colors.danger,
    fontSize: 12,
    marginTop: 4,
  },
  bottomSpacer: {
    height: theme.spacing.xxl,
  },
});
