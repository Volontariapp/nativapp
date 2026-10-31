import React from 'react';
import { View } from 'react-native';

export const mockUseProfile = jest.fn();

interface mockHeaderStubProps {
  showBack?: boolean;
}

/** Remplace AppHeader : expose seulement la présence du bouton retour. */
export const mockHeaderStub = ({
  showBack = false,
}: mockHeaderStubProps): React.JSX.Element | null =>
  showBack ? React.createElement(View, { testID: 'header-back' }) : null;
