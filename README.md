# Volontariapp - Application Mobile (`nativapp`)

[![React Native](https://img.shields.io/badge/framework-React_Native-blue.svg?logo=react)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/platform-Expo_54-black.svg?logo=expo)](https://expo.dev/)
[![TypeScript](https://img.shields.io/badge/language-TypeScript_5-blue.svg?logo=typescript)](https://www.typescriptlang.org/)
[![GitNexus](https://img.shields.io/badge/intelligence-GitNexus-orange.svg)](https://gitnexus.vercel.app/)

Bienvenue dans le dépôt `nativapp` ! Il s'agit du client mobile officiel de **Volontariapp**, conçu de A à Z avec React Native et Expo SDK 54. Il offre aux utilisateurs une interface fluide et native pour découvrir, rejoindre et gérer des événements de bénévolat.

---

## Hub de Documentation

Pour garder ce dépôt propre et maintenable, nous avons séparé notre documentation dans des guides dédiés. Veuillez vous référer aux documents suivants pour approfondir des sujets spécifiques :

### Guides d'Installation

Que vous compiliez pour iOS ou Android, lisez attentivement les guides d'installation. Ils contiennent des informations cruciales concernant les certificats Apple Developer, les configurations Xcode et l'installation d'Android Studio.

- [**Guide d'Installation iOS**](./docs/SETUP_IOS.md) - Apprenez à compiler le Dev Client sur un iPhone physique et à contourner les restrictions du Mode Développeur d'iOS 16+.
- [**Guide d'Installation Android**](./docs/SETUP_ANDROID.md) - Apprenez à configurer `ANDROID_HOME`, à préparer un émulateur et à générer l'APK.

### Standards d'Ingénierie

Ce dépôt adhère à des règles strictes de niveau entreprise concernant la propreté du code, l'architecture et l'utilisation des outils.

- ️ [**Architecture & Lignes Directrices**](./docs/ARCHITECTURE.md) - Lisez ceci avant de contribuer. Ce document couvre notre utilisation de React Query, React Hook Form + Zod, les règles strictes TypeScript, les thèmes personnalisés, et l'interopérabilité avec les Protobuf.

---

## Démarrage Rapide

Si votre environnement local est déjà configuré selon les Guides d'Installation ci-dessus, vous pouvez rapidement lancer le projet.

### 1. Installation

```bash
yarn install
```

### 2. Configuration de l'Environnement

Avant de démarrer l'application, un fichier d'environnement local (`.env`) est requis pour se connecter à l'API backend.
Le script `setup:env` détectera automatiquement votre adresse IP locale et créera le fichier `.env` avec la bonne URL `API_GATEWAY_URL`.

```bash
yarn setup:env
```

### 3. Lancement du Metro Bundler

```bash
yarn start:local
```

Une fois le bundler en cours d'exécution, scannez le QR code affiché dans votre terminal avec l'appareil photo de votre téléphone physique pour lancer le Dev Client personnalisé.

---

## Intelligence Artificielle & Diagnostics

Ce projet exploite des outils d'IA avancés et des graphes pour maintenir la stabilité et prévenir les régressions.

### GitNexus

Nous utilisons **GitNexus** pour maintenir un graphe de connaissances en direct du code mobile. **Ne réalisez jamais de refonte majeure (refactoring) sans avoir lancé une analyse d'impact au préalable.**

- Visualisation : `npx gitnexus serve`
- Analyse d'impact : `npx gitnexus impact <nomDuSymbole>`

### React-Doctor

Nous imposons des tailles de bundle strictes et des règles de linting via **React-Doctor**.
Avant de commiter vos modifications, exécutez toujours :

```bash
yarn doctor
```

---

## Licence

Ce projet est sous [licence MIT](LICENSE).
