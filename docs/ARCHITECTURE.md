=# Architecture & Guidelines

This document serves as the single source of truth for all engineering standards and architectural patterns used in the `nativapp` frontend. All contributors must strictly adhere to these rules.

## 1. Project Structure

The repository follows a feature-based architecture pattern:

- **`app/`**: Expo Router configuration and entry points (file-based routing).
- **`src/api/`**: API clients, custom React Query hooks, schemas, and types.
- **`src/components/`**: Reusable UI components grouped by feature (e.g., `admin/`, `layout/`, `forms/`).
- **`src/screens/`**: High-level screen components assembled from smaller UI pieces.
- **`src/shared/`**: Shared utilities, hooks, context providers, and the global theme.
- **`.agents/skills/`**: Mandatory AI Agent instructions and rules.

## 2. Core Libraries & Rules

### Shared Volontariapp Libraries

**DO NOT** hardcode generic types or Enums. Always import core types from the internal monorepo packages:

- `@volontariapp/contracts`: Contains all gRPC/Protobuf schemas.
- `@volontariapp/shared`: Common enums and generic TypeScript types.

### Strict Typing & Clean Code

- **No `any`**: `any` and `unknown` are strictly forbidden unless interacting with untyped legacy 3rd party modules.
- **Component Size**: Files exceeding 300 lines must be split.
- **No Deprecated APIs**: Never ignore deprecation warnings. Refactor immediately using modern equivalents.

## 3. Data Fetching (React Query)

Server state is strictly managed using `@tanstack/react-query`.

- **Custom Hooks**: Every API call must be wrapped in a custom hook (e.g., `useGetEvents()`, `useCreateEvent()`).
- **Invalidation**: Mutations must cleanly invalidate relevant query keys to trigger UI updates without manual re-fetching.
- **API Client**: All requests route through the centralized `axios` instance configured in `src/api/client.ts`.

## 4. Forms & Validation

Form state and validation are handled exclusively via **React Hook Form** + **Zod**.

- **Schemas**: Define Zod schemas alongside the API types.
- **Controller Pattern**: Use `<Controller />` wrappers for all complex inputs.
- **Error Handling**: Display clear inline validation messages driven by the Zod schema.

## 5. Keyboard Handling (React Native)

Keyboard avoidance in React Native can be notoriously difficult. We rely on the `react-native-keyboard-controller` package.

- **Do not use** `KeyboardAvoidingView` from `react-native` directly.
- **Modals & Cards**: Wrap them in `<AppKeyboardAvoidingView>`. Use the `bottomOffset` prop to control proximity.
- **Scrollable Forms**: Use `<AppKeyboardScrollView>` for automatic scroll-to-focus behavior.

## 6. Protobuf Interoperability

Our backend (API Gateway) communicates via gRPC JSON transcoded Protobufs.

- **Dates**: Protobuf `Timestamp` objects arrive as standard ISO strings (e.g., `"2025-05-18T15:00:00Z"`). Always cast them immediately to JavaScript `Date` objects upon retrieval, or format them via `formatDate()` before rendering.
- **Enums**: Numeric Protobuf Enums are serialized as strings by default (e.g., `"PUBLISHED"`, not `1`). Compare them against string literals or the string-based Enums from `@volontariapp/shared`.

## 7. Styling

- Use vanilla React Native `StyleSheet.create`.
- **Do not use** TailwindCSS or inline styles.
- **Theme**: All colors, typography, border radii, and spacing values MUST come from `src/shared/themes/theme.ts`. Never hardcode colors or paddings.
- **Responsiveness**: Ensure components scale fluidly using Flexbox.

## 8. GitNexus Integration

For safe refactoring and codebase exploration, always utilize **GitNexus**.

- Run `npx gitnexus impact <symbol>` before modifying any shared hook, component, or utility to understand the blast radius.
- Use `npx gitnexus analyze` after significant changes to update the local graph.
