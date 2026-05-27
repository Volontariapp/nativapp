import type { UserRoles } from '@volontariapp/shared';

export interface EndpointDefinition<Req, Res> {
  path: string;
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  requiresAuth: boolean;
  roles?: UserRoles[];
  /** Type fantôme pour l'inférence TypeScript */
  _req?: Req;
  /** Type fantôme pour l'inférence TypeScript */
  _res?: Res;
}
