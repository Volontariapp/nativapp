import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { AppText } from '@/components/typography/AppText';
import { AppButton } from '@/components/buttons/AppButton';
import AppHeader from '@/components/layout/AppHeader';
import { theme } from '@/shared/themes/theme';
import type { CreateStackParamList } from '@/navigation/stacks/CreateStack';

type CreateMenuNavigationProp = NativeStackNavigationProp<
  CreateStackParamList,
  'CreateMenu'
>;

export function CreateMenuScreen(): React.JSX.Element {
  const navigation = useNavigation<CreateMenuNavigationProp>();

  return (
    <View style={styles.container}>
      <AppHeader />
      <View style={styles.content}>
        <AppText style={styles.title}>Que souhaitez-vous créer ?</AppText>
        <AppText style={styles.subtitle}>Choisissez le type de contenu à partager</AppText>

        <View style={styles.buttonContainer}>
          <AppButton
            text="Événement"
            icon="calendar"
            onPress={() => {
              navigation.navigate('ManageEvents');
            }}
            style={styles.button}
          />
          <AppButton
            text="Post"
            icon="edit-3"
            onPress={() => {
              navigation.navigate('ManagePosts');
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
