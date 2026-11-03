import {
  isDevMenuEnabled,
  resolveAllowedAdminMode,
  resolveInitialAdminMode,
} from '../resolve-admin-mode';

describe('resolve-admin-mode', () => {
  describe('isDevMenuEnabled', () => {
    it.each(['local', 'development', 'test'])('est actif pour APP_ENV=%s', (appEnv) => {
      expect(isDevMenuEnabled({ isDev: false, appEnv })).toBe(true);
    });

    it('est actif en build __DEV__ meme en production', () => {
      expect(isDevMenuEnabled({ isDev: true, appEnv: 'production' })).toBe(true);
    });

    it('est inactif en production hors __DEV__', () => {
      expect(isDevMenuEnabled({ isDev: false, appEnv: 'production' })).toBe(false);
    });

    it('est inactif pour une valeur inconnue', () => {
      expect(isDevMenuEnabled({ isDev: false, appEnv: 'staging' })).toBe(false);
    });
  });

  describe('resolveInitialAdminMode', () => {
    it('demarre sur le menu en dev', () => {
      expect(resolveInitialAdminMode({ isDev: true, appEnv: 'local' })).toBe('menu');
    });

    it('demarre directement sur app en production', () => {
      expect(resolveInitialAdminMode({ isDev: false, appEnv: 'production' })).toBe('app');
    });
  });

  describe('resolveAllowedAdminMode', () => {
    it.each(['menu', 'app', 'sandbox', 'panel'] as const)('laisse passer %s en dev', (mode) => {
      expect(resolveAllowedAdminMode(mode, { isDev: true, appEnv: 'development' })).toBe(mode);
    });

    it.each(['menu', 'sandbox', 'panel'] as const)('force app en production pour %s', (mode) => {
      expect(resolveAllowedAdminMode(mode, { isDev: false, appEnv: 'production' })).toBe('app');
    });
  });
});
