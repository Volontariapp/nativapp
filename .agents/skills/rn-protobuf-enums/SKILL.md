---
name: React Native Protobuf Enums
description: How to correctly handle and compare numeric protobuf enums that are serialized as strings by the API Gateway.
---

# 🔄 React Native Protobuf Enums Handling

In this project, the backend microservices communicate using gRPC, and the API Gateway exposes these services via a REST API. **By default, the protobuf-to-JSON serialization process converts numeric enums into their string representations.**

This means that while TypeScript types define `EventType` (or other protobuf enums) as numeric enums, the frontend will actually receive the string key in the API response payload.

## 📋 Rules for Protobuf Enums

### 1. Beware of Enum Comparisons

Do not directly compare the API response field against the numeric enum value because it will evaluate to `false` (e.g., `"EVENT_TYPE_SOCIAL" === 1`).

**❌ Incorrect (Will always be false):**

```tsx
// item.type is "EVENT_TYPE_SOCIAL" (string) at runtime
if (item.type === EventType.EVENT_TYPE_SOCIAL) {
  // ...
}
```

### 2. Compare Using the Enum's String Representation

You must compare the received string value against the string representation of the numeric enum. In TypeScript, you can access the string key of a numeric enum using bracket notation: `EnumName[EnumName.VALUE]`.

To avoid TypeScript complaining without using forbidden casts like `as unknown as`, you can use `String()` or a compound logical check.

**❌ Forbidden Casts:**

```tsx
// NEVER use "as unknown as" or "as any" to bypass TypeScript checking
const isSocial = item.type === (EventType[EventType.EVENT_TYPE_SOCIAL] as unknown as EventType);
```

**✅ Correct:**

```tsx
// Use a compound check for both the numeric value and the string representation
if (
  item.type === EventType.EVENT_TYPE_SOCIAL ||
  String(item.type) === EventType[EventType.EVENT_TYPE_SOCIAL]
) {
  // ...
}
```

### 3. Submitting Enum Values in Forms (Zod)

When validating or submitting form payloads, you should also be aware that you might need to send the numeric value or the string value depending on the Gateway's deserialization settings. With modern Zod versions, you can pass the enum directly.

**Example for Zod Validation:**

```tsx
const schema = z.object({
  type: z.enum(EventType),
});
```
