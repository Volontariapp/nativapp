import { useEffect, useState } from 'react';

/** Vaut true une fois `delayMs` ecoules apres le montage. Sert a borner une attente. */
export const useElapsed = (delayMs: number): boolean => {
  const [elapsed, setElapsed] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setElapsed(true);
    }, delayMs);
    return (): void => {
      clearTimeout(timer);
    };
  }, [delayMs]);

  return elapsed;
};
