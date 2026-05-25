import type { JSX } from 'react';
import React from 'react';
import { AppInput, type AppInputProps } from './AppInput';

export const PasswordField = (props: Omit<AppInputProps, 'label'>): JSX.Element => (
  <AppInput
    label="Mot de passe"
    placeholder="••••••••"
    secureTextEntry
    validator={(val) => {
      if (val.length > 0 && val.length < 6)
        return 'Le mot de passe doit contenir au moins 6 caractères';
      return null;
    }}
    {...props}
  />
);
