---
name: React Native Volontariapp Libs
description: Mandatory use of shared libraries (@volontariapp/shared, @volontariapp/contracts) for types and enums instead of hardcoding values.
---

# 📦 Volontariapp Shared Libraries

When developing features, creating interfaces, or handling data types, **you must prioritize using the internal NPM libraries** rather than redefining types, enums, or hardcoding string values.

## 📚 Available Libraries

This project uses shared monorepo packages installed via npm:

- `@volontariapp/contracts` : Contains all API requests/responses types, entity definitions (`Event`, `UserWeb`), and related enums (`EventType`, `EventState`, etc.).
- `@volontariapp/shared` : Contains shared utilities, authorization roles (`UserRoles`), and common business logic.

## 🛑 Strict Rules

### 1. Never Hardcode Enums or States

If you are evaluating a role, an event state, or a thematic type, **ALWAYS** import the corresponding enum from the shared libraries.

```tsx
// ❌ BAD
if (user.role === 'ADMIN') { ... }
if (event.state === 'PUBLISHED') { ... }

// ✅ GOOD
import { UserRoles } from '@volontariapp/shared';
import { EventState } from '@volontariapp/contracts';

if (user.role === (UserRoles.ADMIN as string)) { ... }
if (event.state === EventState.EVENT_STATE_PUBLISHED) { ... }
```

### 2. Do Not Redefine Types

If an API endpoint returns an entity (e.g. user, event) or expects a specific request payload, use the exact type provided by the contracts. Never create local interfaces like `interface MyUser` if `UserWeb` already exists.

```tsx
// ✅ GOOD
import type { UserWeb, Event, CreateEventRequest } from '@volontariapp/contracts';

const handleCreateEvent = (payload: CreateEventRequest) => { ... }
```

### 3. Integrating with Form Validators (Zod)

When using `zod` alongside `react-hook-form`, integrate it directly with the shared enums to guarantee your forms match the expected backend contracts natively.

```tsx
import { z } from 'zod';
import { UserRoles } from '@volontariapp/shared';
import { EventType } from '@volontariapp/contracts';

const schema = z.object({
  // Disable eslint deprecation warning if z.nativeEnum is flagged
  // eslint-disable-next-line @typescript-eslint/no-deprecated
  role: z.nativeEnum(UserRoles),
  // eslint-disable-next-line @typescript-eslint/no-deprecated
  type: z.nativeEnum(EventType),
});
```

> [!WARNING]
> Failing to use the shared libraries leads to "The two values in this comparison do not have a shared enum type" errors during TS validation and breaks the single source of truth principle. Always check `@volontariapp/contracts` and `@volontariapp/shared` before creating a new type.
