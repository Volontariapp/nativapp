const EXPIRY_LEEWAY_MS = 5_000;

/**
 * Indique si un JWT est expire (ou illisible) en lisant son claim `exp`, sans verifier la signature.
 * Sert uniquement a decider s'il faut rafraichir le token ; la gateway reste seule juge.
 */
export const isJwtExpired = (token: string, now: number = Date.now()): boolean => {
  try {
    const payload = token.split('.')[1];
    if (payload === undefined) {
      return true;
    }
    const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    const { exp } = JSON.parse(decoded) as { exp?: unknown };
    return typeof exp !== 'number' || exp * 1000 <= now + EXPIRY_LEEWAY_MS;
  } catch {
    return true;
  }
};
