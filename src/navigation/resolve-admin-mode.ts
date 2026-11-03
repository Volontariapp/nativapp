export type AdminMode = 'menu' | 'app' | 'sandbox' | 'panel';

export interface AdminModeEnv {
  isDev: boolean;
  appEnv: string;
}

const DEV_MENU_ENVS: readonly string[] = ['local', 'development', 'test'];

/**
 * Le menu de dev (Sandbox, Super Admin Panel) n'est visible qu'en build de dev
 * ou pour les APP_ENV non production. Tout le reste est ferme par defaut.
 */
export const isDevMenuEnabled = ({ isDev, appEnv }: AdminModeEnv): boolean =>
  isDev || DEV_MENU_ENVS.includes(appEnv);

export const resolveInitialAdminMode = (env: AdminModeEnv): AdminMode =>
  isDevMenuEnabled(env) ? 'menu' : 'app';

/**
 * Filtre une transition de mode : hors dev, seuls 'app' est accessible.
 */
export const resolveAllowedAdminMode = (requested: AdminMode, env: AdminModeEnv): AdminMode =>
  isDevMenuEnabled(env) ? requested : 'app';
