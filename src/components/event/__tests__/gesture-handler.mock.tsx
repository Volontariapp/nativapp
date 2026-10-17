import type { ReactNode } from 'react';
import { View } from 'react-native';

// Les gestes natifs ne sont pas disponibles sous Jest : chaque appel de la chaîne de configuration
// (Pan().runOnJS(true).onStart(...)) renvoie le même objet inerte.
interface InertGesture {
  [method: string]: (...args: unknown[]) => InertGesture;
}

const inertGesture = (): InertGesture =>
  new Proxy<InertGesture>({}, { get: () => () => inertGesture() });

export const Gesture = {
  Pan: inertGesture,
  Pinch: inertGesture,
  Simultaneous: inertGesture,
};

export const GestureDetector = ({ children }: { children: ReactNode }): ReactNode => children;

export const GestureHandlerRootView = View;
