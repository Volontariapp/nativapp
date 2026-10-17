import { useCallback, useState } from 'react';
import type { PickedImage } from '@/api/storage/file-upload.types';

interface PendingAdjustment {
  image: PickedImage;
  resolve: (result: PickedImage | undefined) => void;
}

export interface CoverAdjuster {
  /** À passer à `useEventCover` : ouvre l'éditeur et attend le résultat. */
  adjustImage: (image: PickedImage) => Promise<PickedImage | undefined>;
  /** Image en cours de cadrage ; undefined quand l'éditeur est fermé. */
  pendingImage: PickedImage | undefined;
  /** Termine le cadrage : l'image à envoyer, ou undefined pour annuler. */
  settle: (result: PickedImage | undefined) => void;
}

/** Relie l'éditeur de cadrage (composant) à l'étape d'ajustement du choix de photo (hook). */
export const useCoverAdjuster = (): CoverAdjuster => {
  const [pending, setPending] = useState<PendingAdjustment | undefined>();

  const adjustImage = useCallback(
    (image: PickedImage): Promise<PickedImage | undefined> =>
      new Promise((resolve) => {
        setPending({ image, resolve });
      }),
    [],
  );

  const settle = useCallback(
    (result: PickedImage | undefined): void => {
      pending?.resolve(result);
      setPending(undefined);
    },
    [pending],
  );

  return { adjustImage, pendingImage: pending?.image, settle };
};
