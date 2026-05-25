import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAdmin } from '../../context/admin/admin.context';
import { theme } from '@/shared/themes/theme';

import { ScreenHeader } from '@/components';
import { TagComponent } from '@/components/dataDisplay/Tags';
import { TagsNames } from '@volontariapp/shared';
import { AppText } from '@/components/typography/AppText';
import { InputBox } from '@/components/inputs/InputBox';
import { AppInput } from '@/components/inputs/AppInput';
import { EmailField } from '@/components/inputs/EmailField';
import { PasswordField } from '@/components/inputs/PasswordField';
import { AppButton } from '@/components/buttons/AppButton';
import { AppIcons } from '@/components/media/AppIcons';
import { AppIconsButton } from '@/components/buttons/AppIconsButton';
import { AppImage } from '@/components/media/AppImage';
import { AuthCard } from '@/components/layout/AuthCard';

import chienPng from '../../../assets/chien.png';

const Section = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}): React.JSX.Element => (
  <View style={styles.section}>
    <AppText variant="bigTitle" style={styles.sectionTitle}>
      {title}
    </AppText>
    <View style={styles.block}>{children}</View>
  </View>
);

export function SandBoxScreen(): React.JSX.Element {
  const { goBack, canGoBack } = useNavigation();
  const { setMode } = useAdmin();

  const [demoEmail, setDemoEmail] = useState('');
  const [demoPassword, setDemoPassword] = useState('');
  const [demoInput, setDemoInput] = useState('');

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <ScreenHeader
          title="SandBox de Volontariapp"
          subtitle="Consulte les composants dans leurs différents états"
        />
        <View style={styles.actions}>
          <AppButton
            variant="socio"
            text="Retourner à l'accueil"
            icon="home"
            iconLibrary="FontAwesome5"
            onPress={() => {
              if (canGoBack()) {
                goBack();
              } else {
                setMode('menu');
              }
            }}
          />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Section title="Textes">
          <AppText variant="title" font="primary">
            Exemple de texte (title primary)
          </AppText>
          <AppText variant="body" font="primary">
            Exemple de texte (body primary)
          </AppText>
          <AppText variant="caption" font="secondary">
            Exemple de texte (caption secondary)
          </AppText>
          <AppText variant="subtitle" font="secondary">
            Exemple de texte (subtitle secondary)
          </AppText>
        </Section>

        <Section title="Étiquettes">
          <View style={styles.rowWrap}>
            <TagComponent type={TagsNames.ECOLOGIE} />
            <TagComponent type={TagsNames.SOCIAL} />
            <TagComponent type={TagsNames.BENEVOLAT} />
            <TagComponent type={TagsNames.CERTIFIED} />
          </View>
        </Section>

        <Section title="Inputs Classiques (AppInput)">
          <AppInput
            value={demoInput}
            onChangeText={setDemoInput}
            placeholder="AppInput standard..."
            label="Input Standard"
          />
          <AppInput
            value={demoInput}
            onChangeText={setDemoInput}
            placeholder="AppInput..."
            label="Input Icon"
          />
          <AppInput
            value={demoInput}
            onChangeText={setDemoInput}
            placeholder="AppInput avec erreur"
            label="Input Erreur"
            validator={(text) => (text.length < 5 ? 'Trop court !' : null)}
          />
        </Section>

        <Section title="Inputs Spécialisés">
          <EmailField value={demoEmail} onChangeText={setDemoEmail} />
          <PasswordField value={demoPassword} onChangeText={setDemoPassword} />
        </Section>

        <Section title="Legacy Inputs (InputBox)">
          <InputBox placeholder="text personnalisé" />
          <InputBox label="Désactivé avec label" disabled />
          <InputBox
            errorMessage="Le texte doit être entre 3 et 5 caractères"
            minLength={3}
            maxLength={5}
          />
        </Section>

        <Section title="Auth Card">
          <AuthCard
            title="Demo AuthCard"
            subtitle="Ceci est un composant de layout global"
            error={null}
          >
            <AppText>Le contenu du formulaire se place ici.</AppText>
            <AppButton variant="eco" text="Action principale" />
          </AuthCard>
        </Section>

        <Section title="Icons">
          <AppText>
            Utilisation de react-native-vector-icons. Pour ajouter, utiliser AppIcons avec prop
            "icon" et "iconLibrary".
          </AppText>
          <View style={styles.rowWrap}>
            <AppIcons icon="folder-plus" color={theme.colors.grey} size={24} />
            <AppIcons
              icon="cart-plus"
              iconLibrary="FontAwesome"
              size={64}
              color={theme.colors.secondaryEco}
            />
            <AppIcons
              icon="user-plus"
              iconLibrary="FontAwesome5"
              size={32}
              color={theme.colors.primarySocio}
            />
          </View>
        </Section>

        <Section title="Buttons">
          <AppButton
            variant="eco"
            text="Participer"
            icon="hand-holding-heart"
            iconLibrary="FontAwesome5"
          />
          <AppButton variant="danger" text="Retirer la participation" icon="x-circle" />
          <AppButton
            variant="socio"
            text="Participer"
            icon="hand-holding-heart"
            iconLibrary="FontAwesome5"
          />
          <AppButton variant="socio" text="Sans icone" />
        </Section>

        <Section title="Icons Buttons">
          <View style={styles.rowWrap}>
            <AppIconsButton
              variant="eco"
              size={40}
              icon="hand-holding-heart"
              iconLibrary="FontAwesome5"
            />
            <AppIconsButton variant="danger" size={50} icon="trash" iconLibrary="FontAwesome5" />
            <AppIconsButton
              variant="noBackground"
              iconColor={theme.colors.success}
              size={50}
              icon="heart"
              iconLibrary="FontAwesome5"
            />
            <AppIconsButton
              variant="socio"
              iconColor={theme.colors.success}
              size={50}
              icon="pen"
              iconLibrary="FontAwesome5"
            />
          </View>
        </Section>

        <Section title="Images">
          <View style={styles.rowWrap}>
            <AppImage image={chienPng} height={200} width={200} />
            <AppImage image={chienPng} height={100} width={100} rounded={10} />
            <AppImage image={chienPng} height={170} width={300} rounded={5} />
          </View>
        </Section>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    backgroundColor: theme.colors.background,
    boxShadow: '0 1px 5px rgba(0,0,0,1)',
    zIndex: 10,
  },
  actions: {
    paddingHorizontal: theme.spacing.lg,
    gap: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  scrollContent: {
    padding: theme.spacing.md,
    gap: theme.spacing.xl,
    backgroundColor: theme.colors.background,
  },
  section: {
    gap: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.grey,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  block: {
    gap: theme.spacing.md,
  },
  rowWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.md,
  },
  link: {
    color: 'blue',
    textDecorationLine: 'underline',
  },
});
