# Volontariapp - Mobile Application (`nativapp`)

[![React Native](https://img.shields.io/badge/framework-React_Native-blue.svg?logo=react)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/platform-Expo_54-black.svg?logo=expo)](https://expo.dev/)
[![TypeScript](https://img.shields.io/badge/language-TypeScript_5-blue.svg?logo=typescript)](https://www.typescriptlang.org/)
[![GitNexus](https://img.shields.io/badge/intelligence-GitNexus-orange.svg)](https://gitnexus.vercel.app/)

Welcome to the `nativapp` repository! This is the official mobile client for **Volontariapp**, built from the ground up using React Native and Expo SDK 54. It provides users with a seamless, native-feeling interface to discover, join, and manage volunteering events.

---

## 📚 Documentation Hub

To keep this repository clean and maintainable, we have separated our documentation into dedicated guides. Please refer to the following documents for deep dives into specific topics:

### Setup Guides

Whether you are building for iOS or Android, read the dedicated setup guides carefully. They contain crucial information regarding Apple Developer certificates, Xcode configurations, and Android Studio setups.

- 📱 [**iOS Setup Guide**](./docs/SETUP_IOS.md) - Learn how to build the Dev Client on a physical iPhone and bypass iOS 16+ Developer Mode restrictions.
- 🤖 [**Android Setup Guide**](./docs/SETUP_ANDROID.md) - Learn how to configure `ANDROID_HOME`, set up an emulator, and build the APK.

### Engineering Standards

This repository adheres to strict enterprise-grade rules regarding clean code, architecture, and tool usage.

- 🏛️ [**Architecture & Guidelines**](./docs/ARCHITECTURE.md) - Read this before contributing. It covers our usage of React Query, React Hook Form + Zod, strict TypeScript rules, custom styling themes, and Protobuf interoperability.

---

## 🚀 Quick Start

If your local environment is already configured according to the Setup Guides above, you can quickly spin up the project.

### 1. Installation

```bash
yarn install
```

### 2. Environment Setup

Before starting the app, a local environment file (`.env`) is required to connect to the backend API.
The `setup:env` script will automatically detect your local IP address and create the `.env` file with the correct `API_GATEWAY_URL`.

```bash
yarn setup:env
```

### 3. Running the Metro Bundler

```bash
yarn start:local
```

Once the bundler is running, scan the QR code displayed in your terminal using your physical device's camera to launch the custom Dev Client.

---

## 🧠 Code Intelligence & Diagnostics

This project leverages advanced AI and graph tools to maintain stability and prevent regressions.

### GitNexus

We use **GitNexus** to maintain a live knowledge graph of the mobile codebase. **Never perform major refactoring without running impact analysis first.**

- Visualization: `npx gitnexus serve`
- Impact Analysis: `npx gitnexus impact <symbolName>`

### React-Doctor

We enforce strict bundle sizes and linting rules using **React-Doctor**.
Before committing your changes, always run:

```bash
yarn doctor
```

---

## 📄 License

This project is [MIT licensed](LICENSE).
