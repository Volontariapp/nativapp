import { DdRum, DdSdkReactNative, TrackingConsent } from '@datadog/mobile-react-native';
import {
  buildDatadogConfiguration,
  clearMonitoringUser,
  initMonitoring,
  resetMonitoringForTests,
  sendMonitoringTestError,
  setMonitoringUser,
  type MonitoringConfig,
} from '../monitoring';

const configured: MonitoringConfig = {
  sessionSampleRate: 40,
  applicationId: 'app-id-123',
  clientToken: 'pub-token-456',
};

describe('monitoring', () => {
  beforeEach(() => {
    resetMonitoringForTests();
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

  describe('buildDatadogConfiguration', () => {
    it('retourne null sans identifiant d application', () => {
      expect(buildDatadogConfiguration({ ...configured, applicationId: undefined }, 'production')).toBeNull();
    });

    it('retourne null sans client token', () => {
      expect(buildDatadogConfiguration({ ...configured, clientToken: '' }, 'production')).toBeNull();
    });

    it('vise le site us5 et nomme l environnement prod pour la production', () => {
      const result = buildDatadogConfiguration(configured, 'production');

      expect(result?.site).toBe('US5');
      expect(result?.env).toBe('prod');
      expect(result?.service).toBe('nativapp');
      expect(result?.clientToken).toBe('pub-token-456');
    });

    it('garde le nom de l environnement hors production', () => {
      expect(buildDatadogConfiguration(configured, 'development')?.env).toBe('development');
    });

    it('applique le taux d echantillonnage des sessions et suit erreurs et crashs natifs', () => {
      const rum = buildDatadogConfiguration(configured, 'production')?.rumConfiguration;

      expect(rum?.applicationId).toBe('app-id-123');
      expect(rum?.sessionSampleRate).toBe(40);
      expect(rum?.trackErrors).toBe(true);
      expect(rum?.trackResources).toBe(true);
      expect(rum?.nativeCrashReportEnabled).toBe(true);
    });

    it('ne propage pas de traces vers le backend (aucun firstPartyHosts)', () => {
      const rum = buildDatadogConfiguration(configured, 'production')?.rumConfiguration;

      expect(rum?.firstPartyHosts).toEqual([]);
    });

    it('donne le consentement de collecte', () => {
      expect(buildDatadogConfiguration(configured, 'production')?.trackingConsent).toBe(
        TrackingConsent.GRANTED,
      );
    });
  });

  describe('initMonitoring', () => {
    it('n initialise pas le SDK sans identifiants', async () => {
      await initMonitoring({ sessionSampleRate: 100 }, 'production');

      expect(DdSdkReactNative.initialize).not.toHaveBeenCalled();
    });

    it('initialise le SDK une seule fois', async () => {
      await initMonitoring(configured, 'production');
      await initMonitoring(configured, 'production');

      expect(DdSdkReactNative.initialize).toHaveBeenCalledTimes(1);
    });

    it('ne lance pas d exception si l initialisation echoue', async () => {
      jest.spyOn(DdSdkReactNative, 'initialize').mockRejectedValueOnce(new Error('native failure'));

      await expect(initMonitoring(configured, 'production')).resolves.toBeUndefined();
    });
  });

  describe('utilisateur', () => {
    it('envoie l identifiant seul, sans email ni nom', async () => {
      await initMonitoring(configured, 'production');

      await setMonitoringUser('user-42');

      expect(DdSdkReactNative.setUserInfo).toHaveBeenCalledWith({ id: 'user-42' });
    });

    it('attend la fin de l initialisation avant d envoyer l utilisateur', async () => {
      let finishInit: () => void = () => undefined;
      jest.spyOn(DdSdkReactNative, 'initialize').mockImplementationOnce(
        () =>
          new Promise<void>((resolve) => {
            finishInit = resolve;
          }),
      );
      const init = initMonitoring(configured, 'production');

      const pending = setMonitoringUser('user-42');
      expect(DdSdkReactNative.setUserInfo).not.toHaveBeenCalled();

      finishInit();
      await init;
      await pending;

      expect(DdSdkReactNative.setUserInfo).toHaveBeenCalledWith({ id: 'user-42' });
    });

    it('lance une seule initialisation meme appelee deux fois en parallele', async () => {
      await Promise.all([
        initMonitoring(configured, 'production'),
        initMonitoring(configured, 'production'),
      ]);

      expect(DdSdkReactNative.initialize).toHaveBeenCalledTimes(1);
    });

    it('n envoie rien tant que le monitoring est inactif', async () => {
      await setMonitoringUser('user-42');
      await clearMonitoringUser();

      expect(DdSdkReactNative.setUserInfo).not.toHaveBeenCalled();
      expect(DdSdkReactNative.clearUserInfo).not.toHaveBeenCalled();
    });

    it('efface l utilisateur a la deconnexion', async () => {
      await initMonitoring(configured, 'production');

      await clearMonitoringUser();

      expect(DdSdkReactNative.clearUserInfo).toHaveBeenCalledTimes(1);
    });

    it('ne lance pas d exception si l envoi de l utilisateur echoue', async () => {
      await initMonitoring(configured, 'production');
      jest.spyOn(DdSdkReactNative, 'setUserInfo').mockRejectedValueOnce(new Error('boom'));

      await expect(setMonitoringUser('user-42')).resolves.toBeUndefined();
    });
  });

  describe('sendMonitoringTestError', () => {
    it('retourne false et n envoie rien tant que le monitoring est inactif', async () => {
      await expect(sendMonitoringTestError()).resolves.toBe(false);
      expect(DdRum.addError).not.toHaveBeenCalled();
    });

    it('envoie une erreur de test sans donnee personnelle', async () => {
      await initMonitoring(configured, 'production');

      await expect(sendMonitoringTestError()).resolves.toBe(true);

      expect(DdRum.addError).toHaveBeenCalledTimes(1);
      const [message] = (DdRum.addError as jest.Mock).mock.calls[0] as [string];
      expect(message).toContain('test');
    });
  });
});
