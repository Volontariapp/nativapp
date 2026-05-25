import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TextInput, Alert } from 'react-native';
import { AppText } from '@/components/typography/AppText';
import { AppButton } from '@/components/buttons/AppButton';
import AppHeader from '@/components/layout/AppHeader';
import { theme } from '@/themes/theme';

import { eventApi } from '@/api/event/event.api';
import type { CreateEventRequest } from '@volontariapp/contracts';
import { EventType } from '@volontariapp/contracts';

export function CreateEventScreen(): React.JSX.Element {
  // Valeurs par défaut basées sur le CreateEventRequest
  const [formData, setFormData] = useState({
    title: 'Nettoyage de la plage',
    description: 'Rejoignez-nous pour nettoyer la plage et protéger notre environnement !',
    localisationName: 'Plage du Prado, Marseille',
    type: EventType.EVENT_TYPE_ECOLOGY,
    awardedImpactScore: '100',
    maxParticipants: '50',
    startAt: '2026-06-01T10:00:00Z',
    endAt: '2026-06-01T18:00:00Z',
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (field: string, value: string | number): void => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleCreate = async (): Promise<void> => {
    setLoading(true);
    try {
      const payload: CreateEventRequest = {
        title: formData.title,
        description: formData.description,
        localisationName: formData.localisationName,
        type: formData.type,
        awardedImpactScore: parseInt(formData.awardedImpactScore, 10),
        maxParticipants: parseInt(formData.maxParticipants, 10),
        startAt: new Date(formData.startAt),
        endAt: new Date(formData.endAt),
        tagIds: [], // TODO: peut etre mettre ca en optionel dans le backend
      };

      const newEvent = await eventApi.createEvent(payload);
      Alert.alert('Succès', `L'évènement "${newEvent.title}" a été créé avec succès !`);
    } catch (err) {
      console.error(err);
      Alert.alert('Erreur', "Impossible de créer l'évènement.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <AppHeader />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        contentInsetAdjustmentBehavior="automatic"
      >
        <AppText style={styles.title}>Créer un Évènement</AppText>

        <View style={styles.inputGroup}>
          <AppText style={styles.label}>Titre de l'évènement</AppText>
          <TextInput
            style={styles.input}
            value={formData.title}
            onChangeText={(text) => {
              handleChange('title', text);
            }}
          />
        </View>

        <View style={styles.inputGroup}>
          <AppText style={styles.label}>Description</AppText>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={formData.description}
            onChangeText={(text) => {
              handleChange('description', text);
            }}
            multiline
            numberOfLines={4}
          />
        </View>

        <View style={styles.inputGroup}>
          <AppText style={styles.label}>Lieu</AppText>
          <TextInput
            style={styles.input}
            value={formData.localisationName}
            onChangeText={(text) => {
              handleChange('localisationName', text);
            }}
          />
        </View>

        <View style={styles.row}>
          <View style={[styles.inputGroup, { flex: 1, marginRight: theme.spacing.sm }]}>
            <AppText style={styles.label}>Date de début</AppText>
            <TextInput
              style={styles.input}
              value={formData.startAt}
              onChangeText={(text) => {
                handleChange('startAt', text);
              }}
            />
          </View>
          <View style={[styles.inputGroup, { flex: 1, marginLeft: theme.spacing.sm }]}>
            <AppText style={styles.label}>Date de fin</AppText>
            <TextInput
              style={styles.input}
              value={formData.endAt}
              onChangeText={(text) => {
                handleChange('endAt', text);
              }}
            />
          </View>
        </View>

        <View style={styles.row}>
          <View style={[styles.inputGroup, { flex: 1, marginRight: theme.spacing.sm }]}>
            <AppText style={styles.label}>Participants Max</AppText>
            <TextInput
              style={styles.input}
              value={formData.maxParticipants}
              keyboardType="numeric"
              onChangeText={(text) => {
                handleChange('maxParticipants', text);
              }}
            />
          </View>
          <View style={[styles.inputGroup, { flex: 1, marginLeft: theme.spacing.sm }]}>
            <AppText style={styles.label}>Score d'impact</AppText>
            <TextInput
              style={styles.input}
              value={formData.awardedImpactScore}
              keyboardType="numeric"
              onChangeText={(text) => {
                handleChange('awardedImpactScore', text);
              }}
            />
          </View>
        </View>

        <AppButton
          text={loading ? 'Création en cours...' : "Créer l'évènement"}
          onPress={() => {
            void handleCreate();
          }}
          disabled={loading}
        />
        <View style={{ height: theme.spacing.xxl }} />
      </ScrollView>
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
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    fontSize: 16,
    color: theme.colors.black,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});
