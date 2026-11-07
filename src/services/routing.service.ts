import { fetchWithHardTimeout } from './nominatim.service';

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface WalkingRoute {
  distanceMeters: number;
  durationSeconds: number;
  geometry: Coordinates[];
}

export interface WalkingDurations {
  durationsSeconds: (number | null)[];
}

export interface RoutingService {
  fetchWalkingDurations(
    origin: Coordinates,
    destinations: Coordinates[],
    signal?: AbortSignal,
  ): Promise<WalkingDurations>;
  fetchWalkingRoute(
    origin: Coordinates,
    destination: Coordinates,
    signal?: AbortSignal,
  ): Promise<WalkingRoute>;
}

interface OsrmTableResponse {
  code: string;
  durations?: (number | null)[][];
  message?: string;
}

interface OsrmRouteGeometry {
  coordinates: [number, number][];
  type: string;
}

interface OsrmRouteItem {
  distance: number;
  duration: number;
  geometry: OsrmRouteGeometry;
}

interface OsrmRouteResponse {
  code: string;
  routes?: OsrmRouteItem[];
  message?: string;
}

const ROUTING_BASE_URL = 'https://routing.openstreetmap.de/routed-foot';
const USER_AGENT = 'Volontariapp-Mobile/1.0 (contact@volontariapp.fr)';
const RATE_LIMIT_INTERVAL_MS = 1100;
const CACHE_TTL_MS = 60 * 1000;

class RoutingRateLimiter {
  private lastRequestTime = 0;
  private queue: Promise<void> = Promise.resolve();

  async schedule<T>(fn: () => Promise<T>, signal?: AbortSignal): Promise<T> {
    const isAborted = (): boolean => signal?.aborted === true;

    if (isAborted()) {
      return Promise.reject(new DOMException('Aborted', 'AbortError'));
    }

    const run = async (): Promise<T> => {
      if (isAborted()) {
        throw new DOMException('Aborted', 'AbortError');
      }

      const now = Date.now();
      const elapsed = now - this.lastRequestTime;
      if (elapsed < RATE_LIMIT_INTERVAL_MS) {
        const waitTime = RATE_LIMIT_INTERVAL_MS - elapsed;
        await new Promise<void>((resolve, reject) => {
          let timer: ReturnType<typeof setTimeout> | null = null;

          const onAbort = (): void => {
            if (timer !== null) {
              clearTimeout(timer);
            }
            signal?.removeEventListener('abort', onAbort);
            reject(new DOMException('Aborted', 'AbortError'));
          };

          if (isAborted()) {
            reject(new DOMException('Aborted', 'AbortError'));
            return;
          }

          signal?.addEventListener('abort', onAbort, { once: true });

          timer = setTimeout(() => {
            signal?.removeEventListener('abort', onAbort);
            resolve();
          }, waitTime);
        });
      }

      if (isAborted()) {
        throw new DOMException('Aborted', 'AbortError');
      }

      this.lastRequestTime = Date.now();
      return fn();
    };

    const result = this.queue.then(run, run);
    this.queue = result.then(
      () => {},
      () => {},
    );
    return result;
  }
}

function formatCoordKey(coord: Coordinates): string {
  return `${coord.latitude.toFixed(4)},${coord.longitude.toFixed(4)}`;
}

class RoutingServiceImpl implements RoutingService {
  private rateLimiter = new RoutingRateLimiter();
  private durationsCache = new Map<string, { timestamp: number; data: WalkingDurations }>();
  private routesCache = new Map<string, { timestamp: number; data: WalkingRoute }>();

  resetForTesting(): void {
    this.durationsCache.clear();
    this.routesCache.clear();
    this.rateLimiter = new RoutingRateLimiter();
  }

  async fetchWalkingDurations(
    origin: Coordinates,
    destinations: Coordinates[],
    signal?: AbortSignal,
  ): Promise<WalkingDurations> {
    if (destinations.length === 0) {
      return { durationsSeconds: [] };
    }

    const originKey = formatCoordKey(origin);
    const destinationsKey = destinations.map(formatCoordKey).join(';');
    const cacheKey = `durations:${originKey}|${destinationsKey}`;

    const cached = this.durationsCache.get(cacheKey);
    if (cached !== undefined && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return cached.data;
    }

    return this.rateLimiter.schedule(async () => {
      const originCoord = `${String(origin.longitude)},${String(origin.latitude)}`;
      const destinationCoords = destinations
        .map((dest) => `${String(dest.longitude)},${String(dest.latitude)}`)
        .join(';');
      const allCoords = `${originCoord};${destinationCoords}`;
      const url = `${ROUTING_BASE_URL}/table/v1/foot/${allCoords}?sources=0&annotations=duration`;

      const response = await fetchWithHardTimeout(
        url,
        {
          method: 'GET',
          headers: {
            'User-Agent': USER_AGENT,
          },
          signal,
        },
        4000,
      );

      if (!response.ok) {
        throw new Error(`OSRM table error: ${String(response.status)}`);
      }

      const data = (await response.json()) as OsrmTableResponse;
      if (
        data.code !== 'Ok' ||
        !Array.isArray(data.durations) ||
        !Array.isArray(data.durations[0])
      ) {
        throw new Error(`OSRM table error: ${data.code}`);
      }

      const rawDurations = data.durations[0].slice(1);
      const durationsSeconds: (number | null)[] = rawDurations.map((duration) =>
        typeof duration === 'number' ? duration : null,
      );

      const result: WalkingDurations = { durationsSeconds };
      this.durationsCache.set(cacheKey, { timestamp: Date.now(), data: result });
      return result;
    }, signal);
  }

  async fetchWalkingRoute(
    origin: Coordinates,
    destination: Coordinates,
    signal?: AbortSignal,
  ): Promise<WalkingRoute> {
    const originKey = formatCoordKey(origin);
    const destinationKey = formatCoordKey(destination);
    const cacheKey = `route:${originKey}|${destinationKey}`;

    const cached = this.routesCache.get(cacheKey);
    if (cached !== undefined && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return cached.data;
    }

    return this.rateLimiter.schedule(async () => {
      const originCoord = `${String(origin.longitude)},${String(origin.latitude)}`;
      const destinationCoord = `${String(destination.longitude)},${String(destination.latitude)}`;
      const url = `${ROUTING_BASE_URL}/route/v1/foot/${originCoord};${destinationCoord}?overview=full&geometries=geojson`;

      const response = await fetchWithHardTimeout(
        url,
        {
          method: 'GET',
          headers: {
            'User-Agent': USER_AGENT,
          },
          signal,
        },
        4000,
      );

      if (!response.ok) {
        throw new Error(`OSRM route error: ${String(response.status)}`);
      }

      const data = (await response.json()) as OsrmRouteResponse;
      if (data.code !== 'Ok' || !Array.isArray(data.routes) || data.routes.length === 0) {
        throw new Error(`OSRM route error: ${data.code}`);
      }

      const route = data.routes[0];
      if (route === undefined || !Array.isArray(route.geometry.coordinates)) {
        throw new Error('OSRM route error: invalid geometry');
      }

      const geometry: Coordinates[] = route.geometry.coordinates.map((coord) => ({
        latitude: coord[1],
        longitude: coord[0],
      }));

      const result: WalkingRoute = {
        distanceMeters: Math.round(route.distance),
        durationSeconds: Math.round(route.duration),
        geometry,
      };

      this.routesCache.set(cacheKey, { timestamp: Date.now(), data: result });
      return result;
    }, signal);
  }
}

export const routingService = new RoutingServiceImpl();
