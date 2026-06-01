# Android Setup Guide

This guide details the process for building and running the `nativapp` Dev Client on an Android device or emulator.

## Prerequisites

Ensure you have the following installed on your machine:

- **Node.js** (v24.14+)
- **Yarn**
- **Android Studio** (Download from [developer.android.com](https://developer.android.com/studio))
- **Java Development Kit (JDK) 17+**

## 1. Environment Configuration

React Native requires the `ANDROID_HOME` environment variable to be set, pointing to your Android SDK location.

1. Open your terminal profile (`~/.zshrc` or `~/.bash_profile`).
2. Add the following lines:
   ```bash
   export ANDROID_HOME=$HOME/Library/Android/sdk
   export PATH=$PATH:$ANDROID_HOME/emulator
   export PATH=$PATH:$ANDROID_HOME/platform-tools
   ```
3. Reload your profile: `source ~/.zshrc`

## 2. Setting Up an Emulator (Optional)

If you prefer not to use a physical device, you can create a virtual device (AVD).

1. Open **Android Studio**.
2. Go to **More Actions** > **Virtual Device Manager**.
3. Click **Create Device** and select a phone profile (e.g., Pixel 7).
4. Download a system image (API 34 or higher is recommended) and finish the setup.
5. Launch the emulator by clicking the "Play" button.

## 3. Building the Dev Client

With an emulator running, or a physical device connected via USB (with USB Debugging enabled in Developer Options), you can build the app.

1. Run the build command from the project root:
   ```bash
   yarn android
   # OR
   npx expo run:android
   ```
2. The CLI will compile the native Android code and install the Dev Client application (`.apk`) onto your device.

## 4. Running the App

Once installed:

1. Ensure the Metro bundler is running on your Mac:
   ```bash
   yarn start:local
   ```
2. If using an emulator, pressing `a` in the terminal will automatically open the app.
3. If using a physical device, open the Camera app, scan the QR code from the terminal, and open the deep link to launch the Dev Client.
