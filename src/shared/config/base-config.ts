import { validateSync } from 'class-validator';
import Constants from 'expo-constants';
import type { AppEnv } from './app-config';
import { AppConfig } from './app-config';

import defaultCfg from '../../../config/default.config.json';
import localCfg from '../../../config/local.config.json';
import devCfg from '../../../config/development.config.json';
import prodCfg from '../../../config/production.config.json';
import testCfg from '../../../config/test.config.json';

const getFallback = (inlineValue: string | undefined, extraValue: unknown): string | undefined => {
  if (inlineValue !== undefined && inlineValue !== '') {
    return inlineValue;
  }
  if (typeof extraValue === 'string' && extraValue !== '') {
    return extraValue;
  }
  return undefined;
};

const getRawConfig = (): Record<string, unknown> => {
  const extra = Constants.expoConfig?.extra;

  const appEnv = getFallback(process.env.EXPO_PUBLIC_APP_ENV, extra?.['APP_ENV']);

  const validEnvs: AppEnv[] = ['local', 'development', 'production', 'test'];

  if (appEnv === undefined || !validEnvs.includes(appEnv as AppEnv)) {
    throw new Error(
      `Invalid or missing APP_ENV: ${String(appEnv)}. Check your app.config.js and npm scripts.`,
    );
  }

  const env = appEnv as AppEnv;

  const configs: Record<AppEnv, Record<string, unknown>> = {
    local: localCfg,
    development: devCfg,
    production: prodCfg,
    test: testCfg,
  };

  const selectedConfig = configs[env];

  const merged = {
    ...defaultCfg,
    ...selectedConfig,
  };

  const apiGatewayUrlFromEnv = getFallback(
    process.env.EXPO_PUBLIC_API_GATEWAY_URL,
    extra?.['API_GATEWAY_URL'],
  );
  if (apiGatewayUrlFromEnv !== undefined) {
    merged['apiGatewayUrl'] = apiGatewayUrlFromEnv;
  }

  const cfClientId = extra?.['CF_ACCESS_CLIENT_ID'] as string | undefined;
  const cfClientSecret = extra?.['CF_ACCESS_CLIENT_SECRET'] as string | undefined;
  if (cfClientId !== undefined && cfClientSecret !== undefined) {
    merged['cloudflareAccess'] = {
      clientId: cfClientId,
      clientSecret: cfClientSecret,
    };
  }

  return merged;
};

const initConfig = (): AppConfig => {
  const rawData = getRawConfig();
  const instance = new AppConfig();

  Object.assign(instance, rawData);

  const errors = validateSync(instance);

  if (errors.length > 0) {
    const errorMessages = errors
      .map((e) => `${e.property}: ${Object.values(e.constraints ?? {}).join(', ')}`)
      .join('\n');

    throw new Error(`Config validation failed:\n${errorMessages}`);
  }

  return instance;
};

export const config = initConfig();
