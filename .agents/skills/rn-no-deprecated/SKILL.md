---
name: React Native No Deprecated
description: Mandatory rule to never use deprecated APIs or ignore deprecation warnings.
---

# 🚫 React Native No Deprecated

This project enforces a strict **zero-deprecation** policy to ensure the codebase remains maintainable, secure, and compatible with future library updates.

## 📋 Rules for Deprecations

### 1. Never Use Deprecated APIs

You must never introduce new usages of deprecated APIs, functions, enums, or libraries. Always consult the library's documentation to find the recommended modern alternative.

### 2. Never Ignore Deprecation Warnings

Do NOT use `// eslint-disable-next-line @typescript-eslint/no-deprecated` or any similar comments to bypass deprecation warnings. Bypassing these warnings is strictly prohibited.

### 3. Actively Replace Deprecated Code

If you encounter existing code that relies on deprecated features or uses an eslint disable comment for deprecations, you must refactor it to use the modern equivalent.

#### Example: Zod `nativeEnum`

**❌ Incorrect (Deprecated)**

```tsx
const schema = z.object({
  type: z.nativeEnum(EventType),
});
```

**✅ Correct (Modern API)**

```tsx
const schema = z.object({
  type: z.enum(Object.values(EventType) as [string, ...string[]]),
});
```

> [!CAUTION]
> Using deprecated features accumulates technical debt and increases the risk of breaking changes in future dependency upgrades. Always fix the root cause instead of suppressing the warning.
