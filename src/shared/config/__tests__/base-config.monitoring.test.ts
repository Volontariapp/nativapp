import type { AppConfig } from '../app-config';
import type * as BaseConfigModule from '../base-config';

const loadConfig = (extra: Record<string, unknown>): AppConfig => {
  let loaded: AppConfig | undefined;
  jest.isolateModules(() => {
    jest.doMock('expo-constants', () => ({
      __esModule: true,
      default: { expoConfig: { extra } },
    }));
    const module = jest.requireActual<typeof BaseConfigModule>('../base-config');
    loaded = module.config;
  });
  if (loaded === undefined) {
    throw new Error('config not loaded');
  }
  return loaded;
};

describe('base-config : monitoring', () => {
  afterEach(() => {
    jest.dontMock('expo-constants');
  });

  it('garde le taux d echantillonnage par defaut sans identifiants Datadog', () => {
    const config = loadConfig({ APP_ENV: 'test' });

    expect(config.monitoring.sessionSampleRate).toBe(100);
    expect(config.monitoring.applicationId).toBeUndefined();
    expect(config.monitoring.clientToken).toBeUndefined();
  });

  it('ajoute les identifiants Datadog venus de l environnement du build', () => {
    const config = loadConfig({
      APP_ENV: 'test',
      DD_RUM_APPLICATION_ID: 'app-id-123',
      DD_RUM_CLIENT_TOKEN: 'pub-token-456',
    });

    expect(config.monitoring).toEqual({
      sessionSampleRate: 100,
      applicationId: 'app-id-123',
      clientToken: 'pub-token-456',
    });
  });

  it('ignore des identifiants incomplets : le monitoring reste desactive', () => {
    const config = loadConfig({ APP_ENV: 'test', DD_RUM_APPLICATION_ID: 'app-id-123' });

    expect(config.monitoring.applicationId).toBeUndefined();
    expect(config.monitoring.clientToken).toBeUndefined();
  });
});
