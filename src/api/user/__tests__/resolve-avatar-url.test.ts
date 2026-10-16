import { resolveAvatarUrl } from '../resolve-avatar-url';
import { AVATAR_URL } from './user.factory';

describe('resolveAvatarUrl', () => {
  it('prefers the avatar URL over the legacy logo path', () => {
    expect(resolveAvatarUrl({ avatarUrl: AVATAR_URL, logoPath: '/legacy/logo.png' })).toBe(
      AVATAR_URL,
    );
  });

  it('falls back to the legacy logo path when there is no avatar URL', () => {
    expect(resolveAvatarUrl({ logoPath: '/legacy/logo.png' })).toBe('/legacy/logo.png');
  });

  it('treats an empty avatar URL as absent', () => {
    expect(resolveAvatarUrl({ avatarUrl: '', logoPath: '/legacy/logo.png' })).toBe(
      '/legacy/logo.png',
    );
  });

  it('returns undefined when the user has no image at all', () => {
    expect(resolveAvatarUrl({})).toBeUndefined();
  });
});
