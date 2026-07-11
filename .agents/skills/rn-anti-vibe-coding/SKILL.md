---
name: React Native Anti Vibe-Coding
description: Strict veto rules against "vibe coding" (bypassing TS, naked loaders, fat screens). Read this to avoid rookie mistakes.
---

# 🛑 Anti Vibe-Coding (Zero Tolerance)

This skill targets "vibe coding" – the practice of writing quick, unstructured code just to make things work visually, sacrificing architecture and safety.
**If you are an AI agent, you MUST NOT generate code that violates these strict rules.** They complement existing styling and clean-code skills.

## 1. ❌ NO TypeScript Bypasses

- You are **strictly forbidden** to use `// @ts-expect-error` or `// @ts-ignore`.
- Nested navigation MUST be typed properly using `CompositeNavigationProp`. Do not bypass it just because it's complex.
- `any` is already banned, but bypassing the compiler is equally illegal.

## 2. ❌ NO Fat Screens (Strict Separation of Concerns)

- A screen (`src/screens/...`) MUST NOT contain complex IIFEs (Immediately Invoked Function Expressions) inside `useEffect` mixed with heavy UI.
- **Rule**: If a screen fetches data AND requires device permissions (like Location, Camera) AND manages local state, you MUST use the **Presenter/Container** pattern or a Custom Hook (e.g., `useExploreScreen`).
- The Screen component itself should be dumb and mostly return JSX.

## 3. ❌ NO Naked Spinners for Main Content

- Using a basic `<ActivityIndicator />` centered on a blank screen for fetching main page data is considered cheap UX.
- **Rule**: For main content feeds (like lists or cards), you MUST implement or suggest **Skeleton Loaders** (e.g., `<EventCardSkeleton />`) instead of a simple spinner. Spinners are only allowed for small inline actions (like submitting a button).

## 4. ❌ NO Absolute Positioning Without SafeAreas

- Hardcoding `top: 50` in absolute positioning is forbidden as it breaks on modern devices with notches/dynamic islands.
- **Rule**: If you must use absolute positioning near the top or bottom of the screen, you MUST use `useSafeAreaInsets()` from `react-native-safe-area-context` to calculate the offset (e.g., `top: insets.top + 10`).

> [!WARNING]
> Do NOT output code if it violates the above. Take the extra time to create the custom hook, type the navigation, or implement the SafeArea. Quality > Speed.
