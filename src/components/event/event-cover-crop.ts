/**
 * Géométrie du cadrage de la photo d'un évènement. Toutes les régions sont exprimées en pixels
 * de l'image source ; l'éditeur et les aperçus partagent ces calculs pour montrer exactement
 * ce qui sera enregistré.
 */
export interface Size {
  width: number;
  height: number;
}

export interface Point {
  x: number;
  y: number;
}

export interface CropRegion {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface CropRatioOption {
  id: 'portrait' | 'square' | 'wide';
  label: string;
  /** Largeur sur hauteur. */
  ratio: number;
}

/** Formats proposés pour la photo enregistrée ; le carré est le meilleur compromis entre les cadres. */
export const CROP_RATIO_OPTIONS: readonly CropRatioOption[] = [
  { id: 'portrait', label: 'Portrait', ratio: 3 / 4 },
  { id: 'square', label: 'Carré', ratio: 1 },
  { id: 'wide', label: 'Paysage', ratio: 16 / 9 },
];

export const DEFAULT_CROP_RATIO = 1;
export const MAX_COVER_ZOOM = 4;

const clamp = (value: number, min: number, max: number): number =>
  Math.min(Math.max(value, min), max);

/** Plus grande région du ratio donné qui tient dans `container`, centrée. */
const largestCenteredRegion = (container: CropRegion, ratio: number): CropRegion => {
  const containerRatio = container.width / container.height;
  const width = containerRatio > ratio ? container.height * ratio : container.width;
  const height = containerRatio > ratio ? container.height : container.width / ratio;
  return {
    x: container.x + (container.width - width) / 2,
    y: container.y + (container.height - height) / 2,
    width,
    height,
  };
};

export const computeBaseRegion = (image: Size, ratio: number): CropRegion =>
  largestCenteredRegion({ x: 0, y: 0, ...image }, ratio);

export const clampZoom = (zoom: number): number => clamp(zoom, 1, MAX_COVER_ZOOM);

/** Région visible pour un zoom et un centre donnés, toujours contenue dans l'image. */
export const computeRegion = (
  image: Size,
  ratio: number,
  zoom: number,
  center: Point,
): CropRegion => {
  const base = computeBaseRegion(image, ratio);
  const width = base.width / clampZoom(zoom);
  const height = base.height / clampZoom(zoom);
  return {
    x: clamp(center.x - width / 2, 0, image.width - width),
    y: clamp(center.y - height / 2, 0, image.height - height),
    width,
    height,
  };
};

export const regionCenter = (region: CropRegion): Point => ({
  x: region.x + region.width / 2,
  y: region.y + region.height / 2,
});

/** Déplacer le doigt de `translation` pixels d'écran déplace le centre en sens inverse. */
export const panCenter = (
  start: Point,
  translation: Point,
  screenPxPerSourcePx: number,
): Point => ({
  x: start.x - translation.x / screenPxPerSourcePx,
  y: start.y - translation.y / screenPxPerSourcePx,
});

/** Ce qu'un cadre de ratio donné montre de la région enregistrée (recadrage centré, `cover`). */
export const computeFrameRegion = (region: CropRegion, frameRatio: number): CropRegion =>
  largestCenteredRegion(region, frameRatio);

export interface PositionedImageStyle {
  width: number;
  height: number;
  left: number;
  top: number;
}

/** Style de l'image entière à poser dans un cadre pour n'en montrer que `region`. */
export const regionToImageStyle = (
  region: CropRegion,
  frame: Size,
  image: Size,
): PositionedImageStyle => {
  const scale = frame.width / region.width;
  return {
    width: image.width * scale,
    height: image.height * scale,
    left: -region.x * scale,
    top: -region.y * scale,
  };
};

export interface CropRect {
  originX: number;
  originY: number;
  width: number;
  height: number;
}

/** Rectangle entier pour `ImageManipulator.crop`, jamais en dehors de l'image. */
export const toCropRect = (region: CropRegion, image: Size): CropRect => {
  const originX = clamp(Math.round(region.x), 0, image.width - 1);
  const originY = clamp(Math.round(region.y), 0, image.height - 1);
  return {
    originX,
    originY,
    width: clamp(Math.round(region.width), 1, image.width - originX),
    height: clamp(Math.round(region.height), 1, image.height - originY),
  };
};
