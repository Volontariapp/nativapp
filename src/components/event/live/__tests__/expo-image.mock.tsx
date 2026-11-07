import React from 'react';
import { View } from 'react-native';

interface ImageStubProps {
  testID?: string;
  source?: { uri: string };
}

/** Remplace expo-image : une vue repérable par son testID, dont le libellé est l'URI de la source. */
export const Image = ({ testID, source }: ImageStubProps): React.JSX.Element => (
  <View testID={testID} accessibilityLabel={source?.uri} />
);
