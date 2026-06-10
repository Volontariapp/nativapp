import React from 'react';
import { View, StyleSheet, TextInput } from 'react-native';
import { Controller } from 'react-hook-form';
import type { Control, FieldErrors } from 'react-hook-form';
import { AppText } from '@/components/typography/AppText';
import { AppDateTimePicker, AppInfoCard } from '@/components/inputs';
import { theme } from '@/shared/themes/theme';
import type { EventFormValues } from '@/api/event/event.schema';

interface EventInfoGridProps {
  control: Control<EventFormValues>;
  errors: FieldErrors<EventFormValues>;
}

export function EventInfoGrid({ control, errors }: EventInfoGridProps): React.JSX.Element {
  return (
    <View style={styles.infoGrid}>
      <View style={styles.infoRow}>
        <View style={styles.infoCol}>
          <AppInfoCard
            label="Quand commence l'évènement ?"
            iconName="calendar"
            iconColor={theme.colors.primaryEco}
            iconBackgroundColor="#eef3ef"
          >
            <Controller
              control={control}
              name="startAt"
              render={({ field: { onChange, value } }) => (
                <AppDateTimePicker
                  value={value}
                  onChange={onChange}
                  mode="datetime"
                  inputStyle={styles.cleanInputWrapper}
                  hideIcon
                />
              )}
            />
            {errors.startAt ? (
              <AppText style={styles.errorText}>{errors.startAt.message}</AppText>
            ) : null}
          </AppInfoCard>
        </View>
        <View style={styles.infoCol}>
          <AppInfoCard
            label="Quand se termine-t-il ?"
            iconName="calendar"
            iconColor={theme.colors.primaryEco}
            iconBackgroundColor="#eef3ef"
          >
            <Controller
              control={control}
              name="endAt"
              render={({ field: { onChange, value } }) => (
                <AppDateTimePicker
                  value={value}
                  onChange={onChange}
                  mode="datetime"
                  inputStyle={styles.cleanInputWrapper}
                  hideIcon
                />
              )}
            />
            {errors.endAt ? (
              <AppText style={styles.errorText}>{errors.endAt.message}</AppText>
            ) : null}
          </AppInfoCard>
        </View>
      </View>

      <View style={styles.infoRow}>
        <View style={styles.infoCol}>
          <AppInfoCard
            label="Combien de personnes attendez vous ?"
            iconName="users"
            iconColor={theme.colors.primarySocio}
            iconBackgroundColor="#e6f0f3"
          >
            <Controller
              control={control}
              name="maxParticipants"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  style={styles.cleanNumberInput}
                  value={value ? String(value) : ''}
                  keyboardType="numeric"
                  onChangeText={onChange}
                  placeholder="0"
                  placeholderTextColor={theme.colors.lightGrey}
                />
              )}
            />
            {errors.maxParticipants ? (
              <AppText style={styles.errorText}>{errors.maxParticipants.message}</AppText>
            ) : null}
          </AppInfoCard>
        </View>
        <View style={styles.infoCol}>
          <AppInfoCard
            label="Quel sera le score d'impact ?"
            iconName="target"
            iconColor={theme.colors.primaryEco}
            iconBackgroundColor="#eef3ef"
          >
            <Controller
              control={control}
              name="awardedImpactScore"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  style={styles.cleanNumberInput}
                  value={value ? String(value) : ''}
                  keyboardType="numeric"
                  onChangeText={onChange}
                  placeholder="0"
                  placeholderTextColor={theme.colors.lightGrey}
                />
              )}
            />
            {errors.awardedImpactScore ? (
              <AppText style={styles.errorText}>{errors.awardedImpactScore.message}</AppText>
            ) : null}
          </AppInfoCard>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  infoGrid: {
    marginBottom: theme.spacing.lg,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  infoCol: {
    flex: 1,
  },
  cleanInputWrapper: {
    borderWidth: 0,
    paddingHorizontal: 0,
    paddingVertical: 0,
    height: 'auto',
    backgroundColor: 'transparent',
  },
  cleanNumberInput: {
    fontSize: 14,
    color: theme.colors.primarySocio,
    fontWeight: 'bold',
    padding: 0,
    margin: 0,
  },
  errorText: {
    color: theme.colors.danger,
    fontSize: 12,
    marginTop: 4,
  },
});
