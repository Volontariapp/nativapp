import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { theme } from '@/shared/themes/theme';
import { AppButton } from '@/components/buttons/AppButton';
import { AppInput } from '@/components/inputs/AppInput';
import { AdminModal } from '@/components/admin/ui/AdminModal';
import type { UserWeb, UpdateUserRequest } from '@volontariapp/contracts';

const editUserSchema = z.object({
  pseudo: z.string().min(3, 'Le pseudo doit contenir au moins 3 caractères'),
});

type EditUserFormData = z.infer<typeof editUserSchema>;

interface AdminUserEditModalProps {
  visible: boolean;
  user: UserWeb | null;
  onClose: () => void;
  onSubmit: (userId: string, data: UpdateUserRequest) => void;
  isLoading?: boolean;
}

export function AdminUserEditModal({
  visible,
  user,
  onClose,
  onSubmit,
  isLoading,
}: AdminUserEditModalProps): React.JSX.Element {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EditUserFormData>({
    resolver: zodResolver(editUserSchema),
    values: user ? { pseudo: user.pseudo } : { pseudo: '' },
  });

  const handleClose = (): void => {
    reset();
    onClose();
  };

  const submitForm = (data: EditUserFormData): void => {
    if (!user) return;
    onSubmit(user.id, { pseudo: data.pseudo });
  };

  return (
    <AdminModal visible={visible} onClose={handleClose} title="Modifier l'Utilisateur">
      <AppInput
        label="Adresse Email (Non modifiable)"
        value={user?.email}
        editable={false}
        onChangeText={() => {}}
      />

      <Controller
        control={control}
        name="pseudo"
        render={({ field: { onChange, onBlur, value } }) => (
          <AppInput
            label="Pseudo *"
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
            errorMessage={errors.pseudo?.message}
            placeholder="JeanDupont"
            autoCapitalize="none"
          />
        )}
      />

      <View style={styles.modalActions}>
        <AppButton text="Annuler" variant="eco" onPress={handleClose} disabled={isLoading} />
        <AppButton
          text="Enregistrer"
          variant="eco"
          onPress={() => {
            void handleSubmit(submitForm)();
          }}
          disabled={isLoading}
        />
      </View>
    </AdminModal>
  );
}

const styles = StyleSheet.create({
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: theme.spacing.md,
    marginTop: theme.spacing.md,
  },
});
