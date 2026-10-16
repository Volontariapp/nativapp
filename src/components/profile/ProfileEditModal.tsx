import React, { useEffect } from 'react';
import { View, StyleSheet, Modal, Pressable, ScrollView } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Icon from 'react-native-vector-icons/Feather';
import { AppText } from '@/components/typography/AppText';
import { AppButton } from '@/components/buttons/AppButton';
import { AppInput } from '@/components/inputs/AppInput';
import { AppKeyboardAvoidingView } from '@/components/layout/AppKeyboardAvoidingView';
import { useAppTheme, useStyles } from '@/context/ThemeContext';
import type { AppTheme } from '@/shared/themes/theme';
import type { UserProfile } from '@/api/user/user.api';
import { resolveAvatarUrl } from '@/api/user/resolve-avatar-url';
import { useAvatarUpload } from '@/api/user/hooks/use-avatar-upload';
import { AvatarUploadSection } from './AvatarUploadSection';
import type { ProfileSubmitData } from './profile-edit.types';

const profileSchema = z.object({
  pseudo: z.string().min(3, 'Le pseudo doit contenir au moins 3 caractères'),
  bio: z.string().optional(),
  phone: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

interface ProfileEditModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: ProfileSubmitData) => void;
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
  const { theme } = useAppTheme();
  const styles = useStyles(createStyles);
  const avatarUpload = useAvatarUpload();
  const { reset: resetAvatarUpload } = avatarUpload;
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

  useEffect(() => {
    if (!visible) resetAvatarUpload();
  }, [visible, resetAvatarUpload]);

  if (profile === undefined) return null;

  const submit = handleSubmit((data) => {
    onSubmit(
      avatarUpload.avatarFileId === undefined
        ? data
        : { ...data, avatarFileId: avatarUpload.avatarFileId },
    );
  });

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
            <AvatarUploadSection
              upload={avatarUpload}
              currentAvatarUrl={resolveAvatarUrl(profile)}
              disabled={isLoading}
            />

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
              <AppButton text="Annuler" variant="danger" onPress={onClose} disabled={isLoading} />
              <View style={styles.buttonSpacer} />
              <AppButton
                text="Enregistrer"
                variant="eco"
                onPress={() => {
                  void submit();
                }}
                disabled={isLoading || avatarUpload.isUploading}
              />
            </View>
          </ScrollView>
        </View>
      </AppKeyboardAvoidingView>
    </Modal>
  );
};

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
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
      color: theme.colors.text,
    },
    closeButton: {
      padding: theme.spacing.xs,
    },
    content: {
      padding: theme.spacing.lg,
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
