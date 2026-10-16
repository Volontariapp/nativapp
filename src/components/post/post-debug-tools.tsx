import React, { useCallback, useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useQueryClient } from '@tanstack/react-query';
import { AppText } from '@/components/typography/AppText';
import { AppButton } from '@/components/buttons/AppButton';
import { useStyles } from '@/context/ThemeContext';
import { useDebug } from '@/context/DebugContext';
import { useCreatePost } from '@/api/post/hooks';
import type { AppTheme } from '@/shared/themes/theme';

const BATCH_SIZE = 50;

const TITLES = [
  "Aujourd'hui on se bouge !",
  'Super initiative dans le quartier',
  "J'ai besoin de bras",
  'Merci à tous les participants',
  'Prochain événement la semaine prochaine',
  "C'est quoi votre projet préféré ?",
];

const CONTENTS = [
  "On a fait du super boulot ce matin. N'hésitez pas à nous rejoindre pour la prochaine session. Plus on est de fous, plus on rit !",
  "C'était intense mais tellement gratifiant. La planète vous dit merci.",
  'Si des personnes sont motivées pour nous aider à trier les dons demain, envoyez-moi un message !',
  "Un immense merci à la communauté pour votre générosité, ça fait chaud au cœur de voir autant d'entraide.",
  "Je lance l'idée comme ça, mais qui serait chaud pour monter un groupe de nettoyage dans le centre-ville ?",
  'Regardez-moi cette belle équipe ! Merci encore pour tout.',
];

interface PostDebugToolsProps {
  selectedEventId: string | undefined;
  disabled: boolean;
  onBatchingChange: (isBatching: boolean) => void;
}

/** Outils de test du formulaire de post, visibles seulement en mode debug. */
export function PostDebugTools({
  selectedEventId,
  disabled,
  onBatchingChange,
}: PostDebugToolsProps): React.JSX.Element | null {
  const styles = useStyles(createStyles);
  const navigation = useNavigation();
  const queryClient = useQueryClient();
  const { isDebugMode } = useDebug();
  const { mutateAsync: createPost } = useCreatePost();
  const [isBatching, setIsBatching] = useState(false);

  const updateBatching = useCallback(
    (value: boolean): void => {
      setIsBatching(value);
      onBatchingChange(value);
    },
    [onBatchingChange],
  );

  const handleCreateBatch = useCallback(async (): Promise<void> => {
    updateBatching(true);
    try {
      const promises = [];
      for (let i = 0; i < BATCH_SIZE; i++) {
        const randomTitle = TITLES[Math.floor(Math.random() * TITLES.length)] ?? '';
        const randomContent = CONTENTS[Math.floor(Math.random() * CONTENTS.length)] ?? '';
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
      updateBatching(false);
    }
  }, [createPost, queryClient, navigation, selectedEventId, updateBatching]);

  if (!isDebugMode) {
    return null;
  }

  return (
    <View style={styles.testSection}>
      <AppText style={styles.testTitle}>Debug: Outils de test</AppText>
      <AppButton
        text={isBatching ? 'Création en cours...' : 'Créer 50 posts'}
        variant="socio"
        onPress={() => {
          void handleCreateBatch();
        }}
        disabled={disabled || isBatching}
      />
    </View>
  );
}

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
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
  });
