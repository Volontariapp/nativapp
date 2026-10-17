/**
 * Cadres dans lesquels la photo d'un évènement s'affiche. Les dimensions fixes sont partagées
 * avec les composants réels, pour que l'aperçu du formulaire ne diverge pas de l'application.
 */
export const DETAIL_COVER_HEIGHT = 200;
export const LIST_THUMBNAIL_SIZE = 70;
export const LIST_THUMBNAIL_RADIUS = 15;
export const MAP_THUMBNAIL_SIZE = 60;

/** Hauteur du contenu de l'en-tête du swipe (hors encoche) : une estimation, non mesurable depuis le formulaire. */
const SWIPE_HEADER_HEIGHT_ESTIMATE = 56;
/** `paddingBottom` de `swiperContainer` dans SwipeScreen. */
const SWIPE_CONTAINER_PADDING_BOTTOM = 20;

export interface SwipeLayoutInput {
  insetsBottom: number;
  isIos: boolean;
}

/** Décalages du swipe au-dessus de la barre d'onglets, partagés avec SwipeScreen. */
export const computeSwipeLayout = ({ insetsBottom, isIos }: SwipeLayoutInput) => {
  const bottomInset = isIos ? Math.max(insetsBottom, 15) : insetsBottom;
  const tabBarHeight = isIos ? 64 : 60;
  const safeBottomOffset = bottomInset + tabBarHeight;
  // Les boutons like / nope flottent juste au-dessus de la barre, les cartes au-dessus des boutons.
  const buttonsBottom = safeBottomOffset + 10;
  const swiperMarginBottom = buttonsBottom + 80;
  return { tabBarHeight, safeBottomOffset, buttonsBottom, swiperMarginBottom };
};

export type EventImageFrameId = 'swipe' | 'detail' | 'list' | 'map';

export interface EventImageFrame {
  id: EventImageFrameId;
  label: string;
  width: number;
  height: number;
  radius: number;
}

export interface EventImageFramesInput {
  windowWidth: number;
  windowHeight: number;
  insetsTop: number;
  insetsBottom: number;
  isIos: boolean;
  /** `theme.spacing.sm`, marge du conteneur du swipe. */
  spacingSm: number;
  /** `theme.radius.md`, arrondi de la carte de swipe et de l'aperçu sur la carte. */
  radiusMd: number;
}

export const computeEventImageFrames = ({
  windowWidth,
  windowHeight,
  insetsTop,
  insetsBottom,
  isIos,
  spacingSm,
  radiusMd,
}: EventImageFramesInput): EventImageFrame[] => {
  const { swiperMarginBottom } = computeSwipeLayout({ insetsBottom, isIos });
  const swipeHeight =
    windowHeight -
    insetsTop -
    SWIPE_HEADER_HEIGHT_ESTIMATE -
    spacingSm -
    SWIPE_CONTAINER_PADDING_BOTTOM -
    swiperMarginBottom;

  return [
    {
      id: 'swipe',
      label: 'Swipe',
      width: windowWidth - 2 * spacingSm,
      height: Math.max(swipeHeight, 1),
      radius: radiusMd,
    },
    { id: 'detail', label: 'Détail', width: windowWidth, height: DETAIL_COVER_HEIGHT, radius: 0 },
    {
      id: 'list',
      label: 'Liste et profil',
      width: LIST_THUMBNAIL_SIZE,
      height: LIST_THUMBNAIL_SIZE,
      radius: LIST_THUMBNAIL_RADIUS,
    },
    {
      id: 'map',
      label: 'Carte',
      width: MAP_THUMBNAIL_SIZE,
      height: MAP_THUMBNAIL_SIZE,
      radius: radiusMd,
    },
  ];
};

/** Réduit un cadre pour qu'il tienne dans la boîte donnée, sans jamais l'agrandir. */
export const fitFrame = (
  frame: Pick<EventImageFrame, 'width' | 'height'>,
  box: { maxWidth: number; maxHeight: number },
): { width: number; height: number } => {
  const scale = Math.min(1, box.maxWidth / frame.width, box.maxHeight / frame.height);
  return { width: Math.round(frame.width * scale), height: Math.round(frame.height * scale) };
};
