---
name: React Native Styling
description: Senior-level styling guidelines for React Native using custom theme and StyleSheet.
---

# 🎨 React Native Styling Guidelines

Follow these rules strictly when styling components.

## 🚫 No Inline Styles

**Never** use inline styles unless it's strictly necessary for dynamic values (e.g., animations or dynamically computed dimensions).

```tsx
// ❌ BAD
<View style={{ marginTop: 10, backgroundColor: 'red' }} />

// ✅ GOOD
<View style={styles.container} />
```

## 📐 The Design System (Theme)

You must ALWAYS use the shared theme object for spacing, colors, typography, and border radius.

```ts
import { theme } from '@/shared/themes/theme';

const styles = StyleSheet.create({
  container: {
    padding: theme.spacing.md,
    backgroundColor: theme.colors.background,
    borderRadius: theme.radius.lg,
  },
});
```

> [!WARNING]
> **FATAL RULE: NEVER HARDCODE COLORS OR HEX CODES (`#FFF`, `rgba`).** This is considered amateur "vibe coding" and is strictly forbidden. If a color is missing from the theme, you MUST add it to `src/shared/themes/theme.ts` instead of hardcoding it in the component.

## 🔤 Typography

Do NOT use the bare `<Text>` component from `react-native`.
Always use the custom `AppText` component (located in `src/components/typography/AppText`) which applies correct default fonts, colors, and accessibility traits.

## 🧩 Component Composition

When creating custom UI components (like buttons, chips, inputs):

1. **Pass style props**: Always allow the parent to pass an overriding `style` prop.
2. **Use array syntax**: Combine default styles with passed styles using array syntax: `style={[styles.base, style]}`.
3. **Pressable over TouchableOpacity**: Use `Pressable` for buttons to handle complex state (e.g., `pressed`, `hovered`) more elegantly.

> [!TIP]
> Use `SafeAreaView` or `useSafeAreaInsets` from `react-native-safe-area-context` for screens, not manual padding, to handle notches and home indicators gracefully.
