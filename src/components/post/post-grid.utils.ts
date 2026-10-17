import { useWindowDimensions } from 'react-native';

export const POST_GRID_COLUMNS = 3;
/** Écart, en pixels, entre deux carreaux et entre un carreau et le bord de l'écran. */
export const POST_GRID_GAP = 1;

/**
 * Côté d'un carreau pour une grille qui occupe toute la largeur : les colonnes sont séparées
 * et bordées par un écart (colonnes + 1 écarts). Arrondi vers le bas pour ne jamais déborder.
 */
export const computePostGridTileSize = (width: number): number =>
  Math.floor((width - POST_GRID_GAP * (POST_GRID_COLUMNS + 1)) / POST_GRID_COLUMNS);

export const usePostGridTileSize = (): number =>
  computePostGridTileSize(useWindowDimensions().width);
