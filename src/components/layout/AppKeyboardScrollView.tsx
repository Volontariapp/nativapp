import React from 'react';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';

export interface AppKeyboardScrollViewProps extends React.ComponentProps<
  typeof KeyboardAwareScrollView
> {
  children: React.ReactNode;
  /**
   * Espace supplémentaire à ajouter en bas de la ScrollView.
   */
  bottomOffset?: number;
}

/**
 * AppKeyboardScrollView
 *
 * Remplace la ScrollView native par la KeyboardAwareScrollView ultra optimisée
 * du package react-native-keyboard-controller. Gère l'auto-scroll vers l'input.
 */
export function AppKeyboardScrollView({
  children,
  bottomOffset = 0,
  contentContainerStyle,
  ...props
}: AppKeyboardScrollViewProps) {
  return (
    <KeyboardAwareScrollView
      bottomOffset={bottomOffset}
      contentContainerStyle={contentContainerStyle}
      keyboardShouldPersistTaps="handled"
      {...props}
    >
      {children}
    </KeyboardAwareScrollView>
  );
}
