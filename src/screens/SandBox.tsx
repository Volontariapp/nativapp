import {View, StyleSheet, ScrollView, Linking} from "react-native";
import {ScreenHeader} from "@/components";
import {useRouter} from "expo-router";
import {theme} from "@/themes/theme";
import {TagComponent} from "@/components/Tags";
import {TagsNames} from "@/types/tagsTypes";
import {AppText} from "@/components/AppText";
import {InputBox} from "@/components/InputBox";
import {AppButton} from "@/components/AppButton";
import {AppIcons} from "@/components/AppIcons";
import {AppIconsButton} from "@/components/AppIconsButton";
import {AppImage} from "@/components/AppImage";
import React from "react";

import chienPng from "../../assets/chien.png";

export function SandBoxScreen(): React.JSX.Element {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        {/* HEADER */}
        <ScreenHeader
          title="SandBox de Volontariapp"
          subtitle="Consulte les composants dans leurs différents états"
        />

        {/* ACTIONS FIXES */}
        <View style={styles.actions}>
          <AppButton
            variant="socio"
            text="Retourner à l'accueil"
            icon="home"
            iconLibrary="FontAwesome5"
            onPress={() => {router.push("/")}}
          />
        </View>
      </View>

      {/* SCROLLABLE CONTENT */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* TEXTES */}
        <View style={styles.section}>
          <AppText variant="bigTitle" style={styles.sectionTitle}>
            Textes
          </AppText>

          <View style={styles.block}>
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
          </View>
        </View>

        {/* TAGS */}
        <View style={styles.section}>
          <AppText variant="bigTitle" style={styles.sectionTitle}>
            Étiquettes
          </AppText>

          <View style={styles.rowWrap}>
            <TagComponent type={TagsNames.ECOLOGIE}/>
            <TagComponent type={TagsNames.SOCIAL}/>
            <TagComponent type={TagsNames.BENEVOLAT}/>
            <TagComponent type={TagsNames.CERTIFIED}/>
          </View>
        </View>

        {/* INPUTS */}
        <View style={styles.section}>
          <AppText variant="bigTitle" style={styles.sectionTitle}>
            Input box
          </AppText>

          <View style={styles.block}>
            <AppText>Input personnalisé</AppText>
            <InputBox placeholder="text personnalisé"/>

            <AppText>Input désactivé avec label</AppText>
            <InputBox label="label" disabled/>

            <AppText>Input avec erreur</AppText>
            <InputBox
              errorMessage="Le texte doit être entre 3 et 5 caractères"
              minLength={3}
              maxLength={5}
            />
          </View>
        </View>

        {/* ICONS */}
        <View style={styles.section}>
          <AppText variant="bigTitle" style={styles.sectionTitle}>
            Icons
          </AppText>

          <AppText>
            Nous utilisons react-native-vector-icons voir{" "}
            <AppText
              style={styles.link}
              onPress={() => {
                void Linking.openURL(
                  "https://oblador.github.io/react-native-vector-icons/"
                )
              }}
            >
              ici
            </AppText>
            {"\n"} Pour Ajouter une icone, renseignez son nom dans le composant AppIcons.tsx avec le props "icon" et la
            librairie dont il provient dans le props iconLibrary.
          </AppText>


          <View style={styles.rowWrap}>
            <AppIcons icon="folder-plus" color={theme.colors.grey} size={24}/>
            <AppIcons
              icon="cart-plus"
              iconLibrary="FontAwesome"
              size={64}
              color={theme.colors.secondaryEco}
            />
            <AppIcons
              icon="user-plus"
              iconLibrary="FontAwesome5"
              size={16}
              color={theme.colors.primarySocio}
            />
          </View>
        </View>

        {/* BUTTONS */}
        <View style={styles.section}>
          <AppText variant="bigTitle" style={styles.sectionTitle}>
            Buttons
          </AppText>

          <View style={styles.block}>
            <AppButton
              variant="eco"
              text="Participer"
              icon="hand-holding-heart"
              iconLibrary="FontAwesome5"
            />
            <AppButton
              variant="danger"
              text="Retirer la participation"
              icon="x-circle"
            />
            <AppButton
              variant="socio"
              text="Participer"
              icon="hand-holding-heart"
              iconLibrary="FontAwesome5"
            />
            <AppButton variant="socio" text="Sans icone"/>
          </View>
        </View>

        {/* Icon BUTTONS */}
        <View style={styles.section}>
          <AppText variant="bigTitle" style={styles.sectionTitle}>
            Icons Buttons
          </AppText>
          <View style={styles.rowWrap}>
            <AppIconsButton variant="eco" size={40} icon="hand-holding-heart" iconLibrary="FontAwesome5"/>
            <AppIconsButton variant="danger" size={50} icon="trash" iconLibrary="FontAwesome5"/>
            <AppIconsButton variant="noBackground" iconColor={theme.colors.success} size={50} icon="heart"
                            iconLibrary="FontAwesome5"/>
            <AppIconsButton variant="socio" iconColor={theme.colors.success} size={50} icon="pen"
                            iconLibrary="FontAwesome5"/>
          </View>
        </View>

        {/* Images */}
        <View style={styles.section}>
          <AppText variant="bigTitle" style={styles.sectionTitle}>
            Images
          </AppText>
          <View style={styles.rowWrap}>
            <AppImage image={chienPng} height={200} width={200}/>
            <AppImage image={chienPng} height={100} width={100} rounded={10}/>
            <AppImage image={chienPng} height={170} width={300} rounded={5}/>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
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
    textTransform: "uppercase",
    letterSpacing: 1,
  },

  header: {
    backgroundColor: theme.colors.background,

    // iOS
    shadowColor: theme.colors.black,
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 1,
    shadowRadius: 5,
    zIndex: 9999,

    // Android
    elevation: 20,
  },

  block: {
    gap: theme.spacing.md,
  },

  rowWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.md,
  },

  link: {
    color: "blue",
    textDecorationLine: "underline",
  },
});
