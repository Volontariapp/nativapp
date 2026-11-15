import {
  CoreConfiguration,
  DdRum,
  DdSdkReactNative,
  ErrorSource,
  RumConfiguration,
  TrackingConsent,
} from '@datadog/mobile-react-native';

export interface MonitoringConfig {
  /** Pourcentage de sessions envoyees a Datadog (1000 sessions mobiles par mois incluses). */
  sessionSampleRate: number;
  /** Identifiant de l'application RUM Datadog (public, embarque dans l'appli). */
  applicationId?: string;
  /** Client token RUM Datadog (public, embarque dans l'appli, different de la cle d'API). */
  clientToken?: string;
}

// Le compte Datadog du projet est sur le site us5.
const DATADOG_SITE = 'US5';
const SERVICE_NAME = 'nativapp';

let isMonitoringActive = false;
// Partagee : la connexion peut arriver avant la fin de l'initialisation du SDK, les envois
// l'attendent.
let initPromise: Promise<void> | null = null;

/** Reinitialise l'etat du module entre deux tests. */
export const resetMonitoringForTests = (): void => {
  isMonitoringActive = false;
  initPromise = null;
};

const whenInitialized = async (): Promise<void> => {
  await (initPromise ?? Promise.resolve());
};

const isFilled = (value: string | undefined): value is string =>
  value !== undefined && value !== '';

/**
 * Construit la configuration du SDK, ou null si les identifiants Datadog manquent : le monitoring
 * est alors desactive, l'appli tourne sans.
 */
export const buildDatadogConfiguration = (
  monitoring: MonitoringConfig,
  nodeEnv: string,
): CoreConfiguration | null => {
  const { applicationId, clientToken, sessionSampleRate } = monitoring;
  if (!isFilled(applicationId) || !isFilled(clientToken)) {
    return null;
  }

  // Meme nom d'environnement que le backend (DD_ENV=prod), pour filtrer pareil dans Datadog.
  const env = nodeEnv === 'production' ? 'prod' : nodeEnv;

  // Pas de firstPartyHosts : aucun en-tete de trace n'est ajoute aux requetes vers l'API.
  const rumConfiguration = new RumConfiguration(applicationId, false, true, true, {
    sessionSampleRate,
    nativeCrashReportEnabled: true,
  });

  return new CoreConfiguration(clientToken, env, TrackingConsent.GRANTED, {
    site: DATADOG_SITE,
    service: SERVICE_NAME,
    rumConfiguration,
  });
};

const startMonitoring = async (monitoring: MonitoringConfig, nodeEnv: string): Promise<void> => {
  const configuration = buildDatadogConfiguration(monitoring, nodeEnv);
  if (configuration === null) {
    return;
  }
  try {
    await DdSdkReactNative.initialize(configuration);
    isMonitoringActive = true;
  } catch {
    isMonitoringActive = false;
  }
};

/**
 * Demarre le SDK, une seule fois. Ne lance jamais d'exception : l'appli ne doit pas tomber pour sa
 * telemetrie.
 */
export const initMonitoring = (monitoring: MonitoringConfig, nodeEnv: string): Promise<void> => {
  initPromise ??= startMonitoring(monitoring, nodeEnv);
  return initPromise;
};

/** Rattache les erreurs a l'utilisateur par son identifiant seul : jamais d'email ni de nom. */
export const setMonitoringUser = async (userId: string): Promise<void> => {
  await whenInitialized();
  if (!isMonitoringActive) {
    return;
  }
  try {
    await DdSdkReactNative.setUserInfo({ id: userId });
  } catch {
    // La telemetrie ne doit jamais faire echouer la connexion.
  }
};

export const clearMonitoringUser = async (): Promise<void> => {
  await whenInitialized();
  if (!isMonitoringActive) {
    return;
  }
  try {
    await DdSdkReactNative.clearUserInfo();
  } catch {
    // La telemetrie ne doit jamais faire echouer la deconnexion.
  }
};

/**
 * Envoie une erreur de test pour verifier la chaine de bout en bout (mode debug).
 * Retourne false si le monitoring est inactif.
 */
export const sendMonitoringTestError = async (): Promise<boolean> => {
  await whenInitialized();
  if (!isMonitoringActive) {
    return false;
  }
  try {
    await DdRum.addError(
      'Erreur de test du monitoring (mode debug)',
      ErrorSource.CUSTOM,
      new Error('monitoring test').stack ?? '',
    );
    return true;
  } catch {
    return false;
  }
};
