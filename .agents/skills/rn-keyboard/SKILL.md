---
name: React Native Keyboard Handling
description: Mandatory rules and components for handling keyboard avoidance smoothly in the React Native app.
---

# 🎹 React Native Keyboard Handling

This skill outlines the standard way to handle the software keyboard avoiding behavior in the `nativapp` codebase.

> [!WARNING]
> Do **NOT** use React Native's built-in `<KeyboardAvoidingView>` or `useAnimatedKeyboard` from reanimated. It is prone to cross-platform bugs, jitter, and double-padding on Android when `adjustResize` is active.

## 🌟 The State-of-the-Art Solution

We use **`react-native-keyboard-controller`**, which uses C++ native modules to perfectly synchronize the UI with the keyboard frames at 60/120fps and natively handles auto-scrolling to focused inputs.

The app is already wrapped in `<KeyboardProvider>` in `_layout.tsx`.

We have created **three global tools** to standardize this:

### 1. `useAppKeyboard()` Hook

**Path**: `src/shared/hooks/use-app-keyboard.ts`
Use this hook if you need the raw keyboard height for a custom animation. Note that the height is usually NEGATIVE.

```tsx
import { useAppKeyboard } from '@/shared/hooks/use-app-keyboard';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';

const keyboard = useAppKeyboard();
const style = useAnimatedStyle(() => ({
  transform: [{ translateY: keyboard.height.value }],
}));
```

### 2. `<AppKeyboardScrollView>`

**Path**: `src/components/layout/AppKeyboardScrollView.tsx`
Use this component as a drop-in replacement for any `ScrollView` that contains inputs (e.g. large forms, Auth screens).
It automatically adds padding and **auto-scrolls to the focused input** magically.

```tsx
import { AppKeyboardScrollView } from '@/components/layout/AppKeyboardScrollView';

// Usage
<AppKeyboardScrollView bottomOffset={20}>
  <TextInput placeholder="Email" />
  <TextInput placeholder="Password" />
</AppKeyboardScrollView>;
```

### 3. `<AppKeyboardAvoidingView>`

**Path**: `src/components/layout/AppKeyboardAvoidingView.tsx`
Use this component as a drop-in replacement for standard `<View>` containers when you don't need a ScrollView but still need to avoid the keyboard (e.g., Centered Modals, Absolute positioned bottom buttons).

```tsx
import { AppKeyboardAvoidingView } from '@/components/layout/AppKeyboardAvoidingView';

// Usage inside a Modal or full screen view
<AppKeyboardAvoidingView style={styles.overlay} bottomOffset={80}>
  <View style={styles.centeredModalContent}>
    <TextInput placeholder="Titre" />
  </View>
</AppKeyboardAvoidingView>;
```

## 🛠️ Best Practices

- **Modals**: When creating Modals (like `AdminModal`), place the `<AppKeyboardAvoidingView>` directly inside the `<Modal>` as the outermost wrapper (`flex: 1`). This ensures the centered content inside it gets naturally pushed upward.
- **Offsets**: Always pass a `bottomOffset` (usually between `20` and `80`) to ensure there is a comfortable breathing room between the keyboard and the input/button.
