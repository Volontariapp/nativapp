---
name: React Native Architecture
description: Senior-level React Native architecture and patterns for Expo 54 apps.
---

# 🏗️ React Native Architecture & Patterns

You are acting as a Staff/Senior React Native Engineer. Follow these architectural guidelines strictly when modifying or creating new features in this codebase.

## 📚 Core Stack

- **Framework**: React Native 0.81.5, Expo SDK 54, React 19.
- **Language**: Strict TypeScript. No `any`. Use descriptive interfaces and types.
- **Navigation**: React Navigation v7.

## 📐 Architectural Principles

### 1. Folder Structure Adherence

- `src/components/`: Only highly reusable UI components. Subdivided by categories (`ui`, `layout`, `typography`, `inputs`, etc.). Do not place screen-specific logic here.
- `src/screens/`: Represents full pages. Must handle routing params and connect to global state/queries. Keep them as thin as possible by extracting complex UI to specific local components or shared ones if applicable.
- `src/navigation/`: All navigation stacks and tab configurations. Use TypeScript strongly typed navigators.
- `src/context/`: React Context providers for global state (e.g., `AuthContext`, `SocketContext`).
- `src/api/`: API client configurations (`client.ts`) and endpoint definitions.
- `src/shared/`: Shared utilities, constants, config, and the **Theme** (`shared/themes/theme`).

### 2. Component Design (Senior Practices)

- **Functional Components Only**: Use React 19 standards.
- **Destructure Props**: Always destructure props in the function signature.
- **Explicit Return Types**: Explicitly type your component returns as `React.JSX.Element` or `React.FC`.
- **Pure Functions**: Keep components pure. Extract heavy data transformations to separate utility files or custom hooks.
- **Memoization**: Do not blindly use `useMemo` or `useCallback`. React 19 compiler optimization often makes it redundant, but apply it if there are genuine expensive computations or referential stability requirements for child components.

### 3. Navigation (React Navigation v7)

- Use standard Hooks (`useNavigation`, `useRoute`).
- **Typing**: Strongly type all routes. Never use generic `any` for navigation props.
- Keep route parameters serializable. Do not pass complex objects or callbacks in route params; pass IDs instead and fetch the data.

### 4. Code Quality

- Prefer early returns to avoid deep nesting.
- Name variables descriptively (`isModalVisible` instead of `modal`).
- Export everything cleanly using index files where appropriate to avoid deep relative imports if paths grow too long.

> [!WARNING]
> Do NOT create messy "god components". If a screen is longer than 200-250 lines, it's a strong smell that you need to extract sub-components or custom hooks.
