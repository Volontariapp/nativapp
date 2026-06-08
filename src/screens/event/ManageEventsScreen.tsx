import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { AppText } from '@/components/typography/AppText';
import { AppButton } from '@/components/buttons/AppButton';
import AppHeader from '@/components/layout/AppHeader';
import { theme } from '@/shared/themes/theme';
import type { CreateEventStackParamList } from '@/navigation/stacks/CreateEventStack';

type ManageEventsNavigationProp = NativeStackNavigationProp<
  CreateEventStackParamList,
  'ManageEvents'
>;

export function ManageEventsScreen(): React.JSX.Element {
  const navigation = useNavigation<ManageEventsNavigationProp>();

  return (
    <View style={styles.container}>
      <AppHeader />
      <View style={styles.content}>
        <AppText style={styles.title}>Gestion de contenu</AppText>
        <AppText style={styles.subtitle}>Que souhaitez-vous faire ?</AppText>

        <View style={styles.buttonContainer}>
          <AppButton
            text="Créer un événement"
            onPress={() => {
              navigation.navigate('EventForm');
            }}
            style={styles.button}
          />
          <AppButton
            text="Mes événements créés"
            onPress={() => {
              navigation.navigate('MyEvents');
            }}
            style={styles.button}
            variant="secondary"
          />
          <AppButton
            text="Créer un post"
            onPress={() => {
              navigation.navigate('PostForm');
            }}
            style={styles.button}
          />
          <AppButton
            text="Mes posts créés"
            onPress={() => {
              navigation.navigate('MyPosts');
            }}
            style={styles.button}
            variant="secondary"
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    flex: 1,
    padding: theme.spacing.xl,
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.colors.black,
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: theme.colors.grey,
    marginBottom: theme.spacing.xxl,
    textAlign: 'center',
  },
  buttonContainer: {
    gap: theme.spacing.lg,
  },
  button: {
    width: '100%',
  },
});
