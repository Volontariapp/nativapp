---
name: React Native Forms & Validation
description: Best practices for implementing forms with React Hook Form and Zod.
---

# 📝 React Native Forms & Validation

We use **React Hook Form (RHF)** and **Zod** to manage all form state and validation.

## 🛠️ The Stack

- `react-hook-form`
- `@hookform/resolvers/zod`
- `zod`

## 📋 Rules for Forms

### 1. Define Zod Schemas First

Always start by defining a strict Zod schema for your form data. This provides both runtime validation and static TypeScript types.

```tsx
import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Adresse email invalide'),
  password: z.string().min(8, 'Le mot de passe doit contenir 8 caractères minimum'),
});

export type LoginFormData = z.infer<typeof loginSchema>;
```

### 2. Setup React Hook Form

Use the `zodResolver` to connect your schema to RHF.

```tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

const {
  control,
  handleSubmit,
  formState: { errors },
} = useForm<LoginFormData>({
  resolver: zodResolver(loginSchema),
  defaultValues: { email: '', password: '' },
});
```

### 3. Controller Usage

Because React Native does not use native HTML `<form>` tags, you must wrap all inputs in RHF's `<Controller>` component.

```tsx
import { Controller } from 'react-hook-form';

<Controller
  control={control}
  name="email"
  render={({ field: { onChange, onBlur, value } }) => (
    <AppTextInput
      onBlur={onBlur}
      onChangeText={onChange}
      value={value}
      error={errors.email?.message}
    />
  )}
/>;
```

> [!WARNING]
> Do not use local `useState` for form fields. Let React Hook Form manage the entire state to prevent unnecessary re-renders.
