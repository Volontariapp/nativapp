---
name: React Native Protobuf Dates
description: How to correctly handle and format protobuf Timestamp dates sent by the API Gateway to prevent "Invalid Date" issues.
---

# 📅 React Native Protobuf Dates

When working with events or any API endpoints returning Protobuf `Timestamp` objects via the API Gateway, you **MUST** be extremely careful with date parsing.

## ⚠️ The Problem

By default, Protobuf serializes `Timestamp` in JSON using various formats depending on the backend configuration, `ts-proto` settings, and integer limits (Long.js).

When a `Timestamp` is received in React Native, the `seconds` property is often NOT a simple number! It can be:

- A standard ISO date string (`"2026-05-31T20:00:00Z"`)
- A numerical timestamp (`171231231000`)
- A standard object with a number `seconds` (`{ seconds: 171231231 }`)
- A standard object with a string `seconds` (`{ seconds: "171231231" }`)
- An object containing a `Long` representation because 64-bit integers exceed standard JS safe integer limits (`{ seconds: { low: 171231231, high: 0, unsigned: false } }`)
- A Firestore Timestamp representation (`{ _seconds: 171231231 }` or `{ toDate: () => Date }`)

If you naively parse `new Date(timestamp.seconds * 1000)` and `seconds` is a Long object like `{low, high}`, it will result in `NaN` and display **"Invalid Date"** in the UI.

## ✅ The Solution

You MUST NEVER write custom date parsing logic for API timestamps.

Always use the shared, bulletproof `formatDate` utility provided in `@/shared/lib/format-date.utils.ts`. This utility handles all possible Protobuf serialization quirks, including `Long` parsing and string fallbacks.

### Usage Example

```typescript
import { formatDate } from '@/shared/lib/format-date.utils';

// Default formatting: 'DD/MM/YYYY HH:MM'
const displayDate = formatDate(event.startAt);

// Custom formatting options
const shortDate = formatDate(event.startAt, {
  day: '2-digit',
  month: '2-digit',
  year: '2-digit',
});
```

### Strict Rule

- **Never** use `new Date()` directly on properties derived from a Protobuf `Timestamp`.
- **Always** import and use `formatDate` from `@/shared/lib/format-date.utils` to display dates securely and consistently across the app.
