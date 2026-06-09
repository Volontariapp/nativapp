import React from 'react';
import { View, StyleSheet, TextInput, Pressable } from 'react-native';
import { Control, FieldErrors } from 'react-hook-form';
import Feather from 'react-native-vector-icons/Feather';
import { AppText } from '@/components/typography/AppText';
import { EventInput } from '@/components/inputs';
import { AppFormController } from '@/components/forms/AppFormController';
import { theme } from '@/shared/themes/theme';
import type { EventFormValues } from '@/api/event/event.schema';

interface EventRequirementItemProps {
  control: Control<EventFormValues>;
  errors: FieldErrors<EventFormValues>;
  index: number;
  onRemove: (index: number) => void;
}

export function EventRequirementItem({
  control,
  errors,
  index,
  onRemove,
}: EventRequirementItemProps): React.JSX.Element {
  return (
    <View style={styles.requirementCard}>
      <View style={styles.requirementHeaderRow}>
        <AppText style={styles.requirementIndex}>Matériel #{index + 1}</AppText>
        <Pressable onPress={() => onRemove(index)} style={styles.removeButton}>
          <Feather name="trash-2" size={16} color={theme.colors.danger} />
        </Pressable>
      </View>

      <AppFormController
        control={control}
        name={`requirements.${index}.name`}
        label="Nom de l'objet"
        errors={errors}
        render={({ field: { onChange, value } }) => (
          <EventInput value={value} onChangeText={onChange} placeholder="Ex: Gants de protection" />
        )}
      />

      <AppFormController
        control={control}
        name={`requirements.${index}.description`}
        label="Description"
        errors={errors}
        render={({ field: { onChange, value } }) => (
          <TextInput
            style={[styles.input, styles.reqTextArea]}
            value={value}
            onChangeText={onChange}
            placeholder="À quoi ça va servir ?"
            multiline
          />
        )}
      />

      <AppFormController
        control={control}
        name={`requirements.${index}.neededQuantity`}
        label="Quantité requise"
        errors={errors}
        render={({ field: { onChange, value } }) => (
          <TextInput
            style={styles.input}
            value={value ? String(value) : ''}
            keyboardType="numeric"
            onChangeText={(v) => {
              onChange(Number(v) || 0);
            }}
            placeholder="1"
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  requirementCard: {
    backgroundColor: theme.colors.white,
    padding: theme.spacing.md,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.lightGrey,
    marginBottom: theme.spacing.md,
  },
  requirementHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  requirementIndex: {
    fontSize: 14,
    fontWeight: 'bold',
    color: theme.colors.primarySocio,
  },
  removeButton: {
    padding: theme.spacing.xs,
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
  reqTextArea: {
    height: 60,
    textAlignVertical: 'top',
  },
});
