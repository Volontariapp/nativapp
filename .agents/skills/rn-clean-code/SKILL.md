---
name: React Native Clean Code & Standards
description: Strict coding standards, naming conventions, file size limits, and typing rules.
---

# 🧼 Clean Code & Quality Standards

Follow these strict rules for every piece of code you write in this project. Quality and consistency are non-negotiable.

## 📏 File Size Limits

- **Maximum Lines of Code**: A single file MUST NOT exceed **250 lines** of code.
- If a file approaches this limit, it is a strict indicator that the component or logic is too complex and must be refactored.
- **Action**: Extract sub-components, move logic to custom hooks, or delegate utilities to helper files.

## 🏷️ Naming Conventions

- **Files and Folders**: Use strictly **`kebab-case`** for all files and directories (e.g., `user-profile.tsx`, `auth-context.ts`, `format-date.utils.ts`).
- **Components**: The actual React component function and export must be `PascalCase` (e.g., `export const UserProfile = () => ...`).
- **Variables and Functions**: Use `camelCase`.
- **Constants**: Use `UPPER_SNAKE_CASE` for global, non-exported constant primitives.

## 🧱 Interfaces and Types Organization

- Never leave types or interfaces cluttered inside component files if they are larger than 5-10 lines or shared across files.
- Move complex or shared types to dedicated `*.types.ts` files (e.g., `user-profile.types.ts`).
- Keep interfaces highly coherent. An interface should only describe one specific domain entity or component prop structure.

## 🛡️ Strict Typing (No Escapes)

TypeScript is used to guarantee safety. You are explicitly forbidden to use escape hatches:

- ❌ **NO `any`**: Never use `any`.
- ❌ **NO `unknown`**: Avoid `unknown` unless dealing with a generic `catch (error)` block, but cast it using Zod or error guards immediately.
- ❌ **NO `never`**: Avoid assigning `never` manually.
- ❌ **NO `@ts-expect-error` or `@ts-ignore`**: You are forbidden to bypass the compiler, especially for nested navigation props.
- **Action**: Always take the time to write precise, strict types or interfaces. Use generics if a type is dynamic.

## 📐 Architecture Coherence

- Respect the existing boundaries. Do not mix business logic (API calls, complex state) inside UI components.
- UI components (in `src/components/ui/`) must be "dumb" (purely presentational). They receive data via props and emit events via callbacks.
- Screens (in `src/screens/`) act as "smart" containers. They connect to React Query, manage Context, and orchestrate the UI components.
