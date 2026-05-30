import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { theme } from '@/shared/themes/theme';
import { AppText } from '@/components/typography/AppText';
import { AppButton } from '@/components/buttons/AppButton';
import { AppInput } from '@/components/inputs/AppInput';
import { FilterChip } from '@/components/ui/FilterChip';
import { AdminModal } from '@/components/admin/ui/AdminModal';
import { UserRoles } from '@volontariapp/shared';
import type { SignUpRequest } from '@volontariapp/contracts';

const userSchema = z.object({
  // eslint-disable-next-line @typescript-eslint/no-deprecated
  email: z.string().email('Adresse email invalide'),
  pseudo: z.string().min(3, 'Le pseudo doit contenir au moins 3 caractères'),
  password: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
  // eslint-disable-next-line @typescript-eslint/no-deprecated
  role: z.nativeEnum(UserRoles),
});

type UserFormData = z.infer<typeof userSchema>;

interface AdminUserFormModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: SignUpRequest) => void;
  isLoading?: boolean;
}

export function AdminUserFormModal({
  visible,
  onClose,
  onSubmit,
  isLoading,
}: AdminUserFormModalProps): React.JSX.Element {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: { email: '', pseudo: '', password: '', role: UserRoles.VOLUNTEER },
  });

  const handleClose = (): void => {
    reset();
    onClose();
  };

  const submitForm = (data: UserFormData): void => {
    let finalPseudo = data.pseudo;
    if (data.role === UserRoles.ADMIN) {
      const emailLower = data.email.toLowerCase();
      const pseudoLower = data.pseudo.toLowerCase();
      if (!emailLower.includes('admin') && !pseudoLower.includes('admin')) {
        finalPseudo = `${data.pseudo}_admin`;
      }
    }
    onSubmit({
      email: data.email,
      password: data.password,
      pseudo: finalPseudo,
      organisationInfo: data.role === UserRoles.ORGANIZATION ? { rna: 'RNA-PENDING' } : undefined,
    });
  };

  return (
    <AdminModal visible={visible} onClose={handleClose} title="Créer un Utilisateur">
      <Controller
        control={control}
        name="email"
        render={({ field: { onChange, onBlur, value } }) => (
          <AppInput
            label="Adresse Email *"
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
            errorMessage={errors.email?.message}
            placeholder="exemple@volontariapp.fr"
            keyboardType="email-address"
            autoCapitalize="none"
          />
        )}
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

      <Controller
        control={control}
        name="password"
        render={({ field: { onChange, onBlur, value } }) => (
          <AppInput
            label="Mot de passe *"
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
            errorMessage={errors.password?.message}
            placeholder="••••••••"
            secureTextEntry
            autoCapitalize="none"
          />
        )}
      />

      <Controller
        control={control}
        name="role"
        render={({ field: { onChange, value } }) => (
          <View style={styles.inputGroup}>
            <AppText style={styles.label}>Type d'Utilisateur</AppText>
            <View style={styles.roleChips}>
              <FilterChip
                label="Bénévole"
                selected={value === UserRoles.VOLUNTEER}
                color={theme.colors.primaryEco}
                onPress={() => {
                  onChange(UserRoles.VOLUNTEER);
                }}
              />
              <FilterChip
                label="Organisation"
                selected={value === UserRoles.ORGANIZATION}
                color={theme.colors.primarySocio}
                onPress={() => {
                  onChange(UserRoles.ORGANIZATION);
                }}
              />
              <FilterChip
                label="Admin"
                selected={value === UserRoles.ADMIN}
                color={theme.colors.danger}
                onPress={() => {
                  onChange(UserRoles.ADMIN);
                }}
              />
            </View>
            {errors.role && <AppText style={styles.errorText}>{errors.role.message}</AppText>}
          </View>
        )}
      />

      <View style={styles.modalActions}>
        <AppButton text="Annuler" variant="eco" onPress={handleClose} disabled={isLoading} />
        <AppButton
          text="Créer"
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
  inputGroup: { gap: theme.spacing.xs },
  label: { fontSize: theme.typography.fontSize.xs, fontWeight: '600', color: theme.colors.grey },
  roleChips: { flexDirection: 'row', gap: theme.spacing.sm, marginTop: theme.spacing.xs },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: theme.spacing.md,
    marginTop: theme.spacing.md,
  },
  errorText: { color: theme.colors.danger, fontSize: 12, marginTop: 4 },
});
