import { createJwt } from '../../../services/__tests__/jwt.factory';
import { isJwtExpired } from '../jwt-expiry';

describe('isJwtExpired', () => {
  it('returns false for a token that expires in the future', () => {
    expect(isJwtExpired(createJwt(3600))).toBe(false);
  });

  it('returns true for a token whose exp is in the past', () => {
    expect(isJwtExpired(createJwt(-60))).toBe(true);
  });

  it('treats a token about to expire as expired (leeway)', () => {
    expect(isJwtExpired(createJwt(2))).toBe(true);
  });

  it('returns true for a malformed token', () => {
    expect(isJwtExpired('not-a-jwt')).toBe(true);
    expect(isJwtExpired('a.%%%.c')).toBe(true);
  });
});
