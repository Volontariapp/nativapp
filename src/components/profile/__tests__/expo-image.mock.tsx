import React from 'react';
import { View } from 'react-native';

interface ImageStubProps {
  testID?: string;
}

/** Remplace expo-image : une simple vue repérable par son testID. */
export const Image = ({ testID }: ImageStubProps): React.JSX.Element => <View testID={testID} />;
