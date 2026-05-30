---
name: React Native Verification & RTK
description: Mandatory verification steps using RTK (Rust Token Killer) after making code changes.
---

# ✅ Quality Verification (RTK)

This project uses **RTK (Rust Token Killer)** to optimize dev operations and ensure quality.

## 🛑 The Golden Rule

**Before finalizing any task or declaring your work done, you MUST verify the codebase.** Do not skip this step under any circumstances.

## 🛠️ Verification Commands

Whenever you modify, create, or refactor code, run the following verification commands using the `rtk` proxy:

### 1. Static Typing Check

Ensure no TypeScript errors were introduced (especially since `any`, `unknown`, and `never` are banned).

```bash
rtk yarn ts:check
# OR
rtk tsc
```

### 2. Linting

Ensure the code conforms to the project's ESLint and Prettier rules, and the kebab-case naming conventions.

```bash
rtk yarn lint
# OR
rtk lint
```

### 3. Impact Analysis (GitNexus)

If you modified core architecture, public functions, or heavily used UI components, use GitNexus to verify the blast radius.

- See `AGENTS.md` for specific `npx gitnexus` commands.

## 📝 Process Checklist

1. Write the code according to the `rn-clean-code`, `rn-architecture`, and `rn-styling` guidelines.
2. Run `rtk yarn lint`. Fix all warnings and errors.
3. Run `rtk yarn ts:check`. Fix all type errors.
4. If everything passes, you may commit or notify the user of task completion.
