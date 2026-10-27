const encode = (value: object): string =>
  btoa(JSON.stringify(value)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

/** Construit un JWT non signe dont le claim `exp` est decale de `expiresInSeconds` par rapport a maintenant. */
export const createJwt = (expiresInSeconds: number): string => {
  const exp = Math.floor(Date.now() / 1000) + expiresInSeconds;
  return `${encode({ alg: 'RS256' })}.${encode({ id: 'user-1', exp })}.signature`;
};
