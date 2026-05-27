// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ApiFunction = (...args: any[]) => Promise<unknown>;
export type ApiModule = Record<string, ApiFunction>;

export type ApiResponseStatus = 'SUCCESS' | 'ERROR';

export type ApiResponse = { status: 'SUCCESS'; data: unknown } | { status: 'ERROR'; error: string };

export interface EndpointMeta {
  /** HTTP verb */
  method: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  /** Path pattern as defined in the gateway, e.g. /users/:id */
  path: string;
  /** Example body payload – null when the endpoint has no body */
  examplePayload: Record<string, unknown> | null;
  /** Example path params – null when there are none */
  examplePathParams: Record<string, string> | null;
  /** Short human-readable summary */
  description?: string;
}
