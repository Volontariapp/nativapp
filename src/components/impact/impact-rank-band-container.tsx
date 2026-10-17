import React from 'react';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useProfile } from '@/api/user/hooks/use-profile';
import type { MainStackParamList } from '@/navigation/stacks/MainStack';
import { getImpactRankStatus } from '@/shared/lib/impact-ranks';
import { ImpactRankBand } from './impact-rank-band';

/** Frise de rang branchee sur le profil. Rien tant que le profil n'est pas disponible. */
export const ImpactRankBandContainer = (): React.JSX.Element | null => {
  const { data: profile } = useProfile();
  const navigation = useNavigation<NativeStackNavigationProp<MainStackParamList>>();

  if (profile === undefined) {
    return null;
  }

  return (
    <ImpactRankBand
      status={getImpactRankStatus(profile.totalImpactScore)}
      onPress={() => {
        navigation.navigate('Ranks');
      }}
    />
  );
};
