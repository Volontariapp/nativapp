import { validateSync } from 'class-validator';
import Constants from 'expo-constants';
import type { AppEnv } from './app-config';
import { AppConfig } from './app-config';

import defaultCfg from '../../config/default.config.json';
import localCfg from '../../config/local.config.json';
import devCfg from '../../config/development.config.json';
import prodCfg from '../../config/production.config.json';
import testCfg from '../../config/test.config.json';

const getRawConfig = (): Record<string, unknown> => {
  const extra = Constants.expoConfig?.extra;

  const appEnv = extra?.['APP_ENV'] as string | undefined;

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

  return {
    ...defaultCfg,
    ...selectedConfig,
  };
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
