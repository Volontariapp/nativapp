import type { JSX } from 'react';
import { AppInput, type AppInputProps } from './AppInput';

export const EmailField = (props: Omit<AppInputProps, 'label'>): JSX.Element => (
  <AppInput
    label="Adresse e-mail"
    placeholder="jean.dupont@email.com"
    autoCapitalize="none"
    keyboardType="email-address"
    validator={(val) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (val.length > 0 && !emailRegex.test(val)) return "Format d'email invalide";
      return null;
    }}
    {...props}
  />
);
