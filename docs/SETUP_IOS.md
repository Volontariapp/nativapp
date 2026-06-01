# iOS Setup Guide

This guide will walk you through the process of building and running the `nativapp` Dev Client on a physical iOS device or simulator.

## Prerequisites

Ensure you have the following installed on your Mac:

- **Xcode** (Download from the Mac App Store)
- **CocoaPods** (`sudo gem install cocoapods`)
- **Node.js** (v24.14+)
- **Yarn**

## 1. Apple Developer Code Signing (For Physical Devices)

To install the application directly onto your physical iPhone via a USB cable, Apple requires the application to be signed using a Developer Account. A free Personal Team account is sufficient.

1. Open the iOS project in Xcode by running the following command from the project root:
   ```bash
   xed -b ios
   ```
2. In the left sidebar of Xcode, click on the root project folder named **Volontariapp**.
3. In the main central window, select the **Signing & Capabilities** tab.
4. Check the box for **Automatically manage signing**.
5. In the **Team** dropdown menu:
   - If it says "None", select **Add an Account...**
   - Sign in with your standard Apple ID/iCloud account.
   - Once signed in, select your name (which will say _Personal Team_) in the Team dropdown.
6. Make sure there are no red error messages in the signing tab. You can now close Xcode.

## 2. Building the Dev Client

With signing configured, you can now build the native application.

1. Connect your iPhone to your Mac via USB.
2. Run the build command:
   ```bash
   yarn ios
   # OR
   npx expo run:ios -d
   ```
3. The CLI will prompt you to select a device. Choose your connected iPhone.
4. During the build, macOS will display a keychain prompt:

   > "codesign wants to access key 'Apple Development: Your Name' in your keychain"

   Enter your **Mac session password** (the one used to unlock your computer) and click **Always Allow (Toujours autoriser)**. Do not click "Allow", otherwise you will be prompted dozens of times.

## 3. Trusting the Developer Certificate

If this is the first time you are installing an app with your Personal Team on this iPhone, iOS will block it with an "Untrusted Developer" error.

To authorize the app:

1. Open the **Settings (Réglages)** app on your iPhone.
2. Go to **General**.
3. Scroll down to **VPN & Device Management (VPN et gestion de l'appareil)**.
4. Under the "Developer App" section, tap your Apple ID email.
5. Tap **Trust "Your Email"** and confirm in the popup.

## 4. Enabling Developer Mode (iOS 16+)

On modern iOS versions, you must explicitly enable Developer Mode to run sideloaded apps.

1. Open **Settings (Réglages)**.
2. Go to **Privacy & Security (Confidentialité et sécurité)**.
3. Scroll to the very bottom and tap **Developer Mode (Mode Développeur)**.
4. Toggle the switch to ON.
5. Your iPhone will prompt you to restart.
6. After unlocking your phone post-restart, tap **Turn On** in the prompt and enter your passcode.

## 5. Running the App

Once installed and trusted:

1. Ensure the Metro bundler is running on your Mac:
   ```bash
   yarn start:local
   ```
2. Open the **Camera** app on your iPhone and scan the QR code displayed in your terminal.
3. Tap the notification to open the link in your custom `nativapp` Dev Client.
4. The JS bundle will load, and you're ready to develop!
