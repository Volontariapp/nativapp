/**
 * HTTP method → color mapping.
 * Kept in its own file so it can be imported by non-component modules
 * without breaking Fast Refresh (files that export components must only export components).
 */
export const HTTP_METHOD_COLORS: Record<string, string> = {
  GET: '#22c55e',
  POST: '#3b82f6',
  PATCH: '#f59e0b',
  PUT: '#8b5cf6',
  DELETE: '#ef4444',
};
