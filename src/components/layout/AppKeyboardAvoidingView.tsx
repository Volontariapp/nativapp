import React from 'react';
import type { ViewProps } from 'react-native';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';

export interface AppKeyboardAvoidingViewProps extends ViewProps {
  children: React.ReactNode;
  /**
   * Espace supplémentaire à ajouter en bas (au-dessus du clavier).
   */
  bottomOffset?: number;
}

/**
 * AppKeyboardAvoidingView
 *
 * Composant global utilisant react-native-keyboard-controller pour décaler une vue.
 * Auto-scroll magique inclus avec la librairie C++.
 */
export function AppKeyboardAvoidingView({
  children,
  bottomOffset = 0,
  style,
  ...props
}: AppKeyboardAvoidingViewProps) {
  return (
    <KeyboardAvoidingView
      behavior="padding"
      keyboardVerticalOffset={bottomOffset}
      style={[{ flex: 1 }, style]}
      {...props}
    >
      {children}
    </KeyboardAvoidingView>
  );
}
