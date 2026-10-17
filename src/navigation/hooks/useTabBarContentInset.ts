import { useMemo } from 'react';
import type { ViewStyle } from 'react-native';
import { useFloatingTabBarOffset } from './useFloatingTabBarOffset';

/**
 * Style de contenu pour les listes et ScrollView affichées sous la barre
 * d'onglets flottante : ajoute en bas l'espace nécessaire pour que le dernier
 * élément puisse défiler au-dessus de la barre et du bouton (+).
 * À combiner avec le contentContainerStyle existant : [styles.content, tabBarInset].
 */
export function useTabBarContentInset(): Pick<ViewStyle, 'paddingBottom'> {
  const { cardBottomOffset } = useFloatingTabBarOffset();

  return useMemo(() => ({ paddingBottom: cardBottomOffset }), [cardBottomOffset]);
}
