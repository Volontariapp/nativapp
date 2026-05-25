# Volontariapp - Mobile Application (`nativapp`)

[![React Native](https://img.shields.io/badge/framework-ReactNative-blue.svg)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/platform-Expo-black.svg)](https://expo.dev/)
[![TypeScript](https://img.shields.io/badge/language-TypeScript-blue.svg)](https://www.typescriptlang.org/)
[![GitNexus](https://img.shields.io/badge/intelligence-GitNexus-orange.svg)](https://gitnexus.vercel.app/)

The Nativapp is the official mobile client for Volontariapp, built with React Native and Expo. It provides users with a seamless interface to discover, join, and manage volunteering events.

---

## Code Intelligence with GitNexus

This project uses GitNexus to maintain a live knowledge graph of the mobile codebase.

### Visualization

To see the codebase graph:

1. Run `npx gitnexus serve`
2. Visit [https://gitnexus.vercel.app/](https://gitnexus.vercel.app/)

---

## Getting Started

### Prerequisites

- Node.js (v18+)
- Yarn
- Expo Go (on your mobile device or emulator)

### Installation

```bash
yarn install
```

### Environment Setup

Before starting the app, a local environment file (`.env`) is required to connect to the backend API.
The `setup:env` script will automatically detect your local IP address and create the `.env` file with the `API_GATEWAY_URL`.

This script runs automatically when you start the server, or you can run it manually:

```bash
yarn setup:env
```

### Running the App

```bash
yarn start
```

### Running Tests

```bash
yarn run test

yarn run lint
```

---

## Architecture

- **App**: Entry points and Expo Router configuration.
- **Components**: Reusable UI elements.
- **Hooks**: Shared state and interaction logic.
- **Services**: Communications with the API Gateway.

---

## License

This project is [MIT licensed](LICENSE).
