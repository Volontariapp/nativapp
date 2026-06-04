import React from 'react';
import { View, StyleSheet, Modal, Pressable, ScrollView, Alert } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Icon from 'react-native-vector-icons/Feather';
import * as ImagePicker from 'expo-image-picker';
import { AppText } from '@/components/typography/AppText';
import { AppButton } from '@/components/buttons/AppButton';
import { AppInput } from '@/components/inputs/AppInput';
import { AppKeyboardAvoidingView } from '@/components/layout/AppKeyboardAvoidingView';
import { theme } from '@/shared/themes/theme';
import type { UserProfile } from '@/api/user/user.api';

const profileSchema = z.object({
  pseudo: z.string().min(3, 'Le pseudo doit contenir au moins 3 caractères'),
  bio: z.string().optional(),
  phone: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

interface ProfileEditModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: ProfileFormData) => void;
  profile: UserProfile | undefined;
  isLoading?: boolean;
}

export const ProfileEditModal = ({
  visible,
  onClose,
  onSubmit,
  profile,
  isLoading = false,
}: ProfileEditModalProps): React.JSX.Element | null => {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    values: {
      pseudo: profile?.pseudo ?? '',
      bio: profile?.bio ?? '',
      phone: '',
    },
  });

  if (profile === undefined) return null;

  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== ImagePicker.PermissionStatus.GRANTED) {
      Alert.alert('Permission refusée', 'Nous avons besoin de votre permission pour accéder à vos photos.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      Alert.alert('Coming soon', "L'upload de photo sera bientôt disponible ! 📸");
    }
  };

  return (
    <Modal animationType="slide" transparent visible={visible} onRequestClose={onClose}>
      <AppKeyboardAvoidingView style={styles.overlay} bottomOffset={20}>
        <View style={styles.container}>
          <View style={styles.header}>
            <AppText style={styles.title}>Modifier mon profil</AppText>
            <Pressable onPress={onClose} style={styles.closeButton}>
              <Icon name="x" size={24} color={theme.colors.black} />
            </Pressable>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            <View style={styles.imagePickerSection}>
              <AppText style={styles.inputLabel}>Photo de profil</AppText>
              <AppButton
                text="Choisir une image"
                variant="eco"
                icon="image"
                onPress={() => {
                  void handlePickImage();
                }}
              />
            </View>

            <Controller
              control={control}
              name="pseudo"
              render={({ field: { onChange, onBlur, value } }) => (
                <AppInput
                  label="Pseudo"
                  placeholder="Ton nouveau pseudo"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  errorMessage={errors.pseudo?.message}
                  autoCapitalize="none"
                />
              )}
            />

            <Controller
              control={control}
              name="bio"
              render={({ field: { onChange, onBlur, value } }) => (
                <AppInput
                  label="Biographie"
                  placeholder="Raconte-nous ton histoire..."
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  errorMessage={errors.bio?.message}
                  multiline
                  numberOfLines={4}
                />
              )}
            />

            <Controller
              control={control}
              name="phone"
              render={({ field: { onChange, onBlur, value } }) => (
                <AppInput
                  label="Téléphone"
                  placeholder="+33 6 12 34 56 78"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  errorMessage={errors.phone?.message}
                  keyboardType="phone-pad"
                />
              )}
            />

            <View style={styles.actions}>
              <AppButton
                text="Annuler"
                variant="danger"
                onPress={onClose}
                disabled={isLoading}
              />
              <View style={styles.buttonSpacer} />
              <AppButton
                text="Enregistrer"
                variant="eco"
                onPress={() => {
                  void handleSubmit(onSubmit)();
                }}
                disabled={isLoading}
              />
            </View>
          </ScrollView>
        </View>
      </AppKeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    padding: theme.spacing.lg,
  },
  container: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.radius.lg,
    overflow: 'hidden',
    ...theme.shadows.card,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.lightGrey,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.black,
  },
  closeButton: {
    padding: theme.spacing.xs,
  },
  content: {
    padding: theme.spacing.lg,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.black,
    marginBottom: theme.spacing.sm,
  },
  imagePickerSection: {
    marginBottom: theme.spacing.lg,
  },
  actions: {
    flexDirection: 'row',
    marginTop: theme.spacing.xl,
    paddingBottom: theme.spacing.xl,
  },
  buttonSpacer: {
    width: theme.spacing.md,
  },
});
