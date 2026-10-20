/**
 * Service pour interagir avec l'API Nominatim d'OpenStreetMap.
 *
 * RESPECT STRICT DE LA POLITIQUE D'UTILISATION OPENSTREETMAP (Usage Policy) :
 * 1. Rate-limit strict : Maximum 1 requête par seconde (1000ms d'intervalle minimum garanti par file d'attente).
 * 2. Header User-Agent identifié et contact fourni.
 * 3. Mise en cache mémoire (TTL 5 minutes) des requêtes de recherche et géocodage inversé.
 * 4. Support des AbortSignal pour annuler les requêtes obsolètes.
 */

export interface NominatimPlace {
  placeId: number;
  displayName: string;
  primaryText: string;
  secondaryText: string;
  latitude: number;
  longitude: number;
}

export interface OsmReverseGeocodeResult {
  displayName: string;
  primaryText: string;
  isNearby: boolean;
  distanceMeters?: number;
  latitude: number;
  longitude: number;
}

/**
 * Calcule la distance en mètres entre deux points géographiques (formule de Haversine).
 */
export function calculateDistanceMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371e3; // Rayon moyen de la Terre en mètres
  const rad = Math.PI / 180;
  const dLat = (lat2 - lat1) * rad;
  const dLon = (lon2 - lon1) * rad;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * rad) * Math.cos(lat2 * rad) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

function formatOsmAddress(item: RawNominatimItem): { displayName: string; primaryText: string } {
  const parts = item.display_name.split(',').map((p) => p.trim());
  const primaryText =
    typeof item.name === 'string' && item.name.length > 0 ? item.name : (parts[0] ?? '');

  if (item.address) {
    const {
      house_number,
      road,
      pedestrian,
      street,
      amenity,
      building,
      postcode,
      city,
      town,
      village,
      municipality,
    } = item.address;

    const streetName = road ?? pedestrian ?? street;
    const streetPart = [house_number, streetName].filter(Boolean).join(' ');
    const placeName = building ?? amenity ?? item.name;
    const cityName = city ?? town ?? village ?? municipality;
    const cityPart = [postcode, cityName].filter(Boolean).join(' ');

    const addressParts: string[] = [];
    if (
      typeof placeName === 'string' &&
      placeName.length > 0 &&
      placeName !== streetPart &&
      placeName !== streetName
    ) {
      addressParts.push(placeName);
    }
    if (streetPart.length > 0) {
      addressParts.push(streetPart);
    }
    if (cityPart.length > 0) {
      addressParts.push(cityPart);
    }

    if (addressParts.length > 0) {
      return {
        displayName: addressParts.join(', '),
        primaryText:
          typeof placeName === 'string' && placeName.length > 0
            ? placeName
            : streetPart.length > 0
              ? streetPart
              : primaryText,
      };
    }
  }

  const shortened = parts.slice(0, 4).join(', ');
  return {
    displayName: shortened.length > 0 ? shortened : item.display_name,
    primaryText,
  };
}

interface RawNominatimItem {
  place_id: number;
  lat: string;
  lon: string;
  display_name: string;
  name?: string;
  address?: Record<string, string>;
}

const NOMINATIM_BASE_URL = 'https://nominatim.openstreetmap.org';
const USER_AGENT = 'Volontariapp-Mobile/1.0 (contact@volontariapp.fr)';
const RATE_LIMIT_INTERVAL_MS = 1000;
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

export async function fetchWithHardTimeout(
  url: string,
  options: RequestInit,
  timeoutMs = 4000,
): Promise<Response> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timer = setTimeout(() => {
      reject(new Error(`Timeout de ${String(timeoutMs)}ms dépassé pour ${url}`));
    }, timeoutMs);
  });
  try {
    return await Promise.race([fetch(url, options), timeoutPromise]);
  } finally {
    clearTimeout(timer);
  }
}

class NominatimRateLimiter {
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

          const onAbort = () => {
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
    // On conserve la chaîne sans propager l'erreur à la file
    this.queue = result.then(
      () => {},
      () => {},
    );
    return result;
  }
}

class NominatimService {
  private rateLimiter = new NominatimRateLimiter();
  private searchCache = new Map<string, { timestamp: number; data: NominatimPlace[] }>();
  private reverseCache = new Map<
    string,
    { timestamp: number; data: { displayName: string; primaryText: string } }
  >();
  private fallbackCache = new Map<string, { timestamp: number; data: OsmReverseGeocodeResult }>();

  /**
   * Formate un résultat brut Nominatim en titre principal et sous-titre
   */
  private formatPlace(item: RawNominatimItem): NominatimPlace {
    const lat = parseFloat(item.lat);
    const lon = parseFloat(item.lon);
    const parts = item.display_name.split(',').map((p) => p.trim());
    const primaryText =
      typeof item.name === 'string' && item.name.length > 0 ? item.name : (parts[0] ?? '');
    const secondaryParts = parts.slice(1).filter((p) => p !== primaryText);
    const secondaryText = secondaryParts.slice(0, 3).join(', ');

    return {
      placeId: item.place_id,
      displayName: item.display_name,
      primaryText,
      secondaryText,
      latitude: lat,
      longitude: lon,
    };
  }

  /**
   * Recherche de lieux avec autocomplétion (OpenStreetMap Nominatim)
   */
  async searchPlaces(query: string, signal?: AbortSignal): Promise<NominatimPlace[]> {
    const trimmed = query.trim();
    if (trimmed.length < 3) {
      return [];
    }

    const normalizedKey = trimmed.toLowerCase();
    const cached = this.searchCache.get(normalizedKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return cached.data;
    }

    return this.rateLimiter.schedule(async () => {
      if (signal?.aborted === true) {
        return [];
      }

      const url = `${NOMINATIM_BASE_URL}/search?q=${encodeURIComponent(
        trimmed,
      )}&format=json&addressdetails=1&limit=5`;

      const timeoutController = new AbortController();
      const timeoutId = setTimeout(() => {
        timeoutController.abort();
      }, 4000);
      const onSignalAbort = () => {
        timeoutController.abort();
      };
      signal?.addEventListener('abort', onSignalAbort, { once: true });

      try {
        const response = await fetchWithHardTimeout(
          url,
          {
            method: 'GET',
            headers: {
              'User-Agent': USER_AGENT,
              'Accept-Language': 'fr, fr-FR;q=0.9, en;q=0.5',
            },
            signal: timeoutController.signal,
          },
          3500,
        );

        if (!response.ok) {
          throw new Error(`Nominatim error: ${String(response.status)}`);
        }

        const data = (await response.json()) as RawNominatimItem[];
        const places = data.map((item) => this.formatPlace(item));

        this.searchCache.set(normalizedKey, {
          timestamp: Date.now(),
          data: places,
        });

        return places;
      } finally {
        clearTimeout(timeoutId);
        signal?.removeEventListener('abort', onSignalAbort);
      }
    }, signal);
  }

  /**
   * Géocodage inversé : transforme des coordonnées (lat, lon) en adresse
   */
  async reverseGeocode(
    latitude: number,
    longitude: number,
    signal?: AbortSignal,
  ): Promise<{ displayName: string; primaryText: string } | null> {
    // Coordonnées arrondies à 4 décimales (~11 mètres) pour le cache
    const cacheKey = `${latitude.toFixed(4)},${longitude.toFixed(4)}`;
    const cached = this.reverseCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return cached.data;
    }

    return this.rateLimiter.schedule(async () => {
      if (signal?.aborted === true) {
        return null;
      }

      const url = `${NOMINATIM_BASE_URL}/reverse?lat=${latitude.toString()}&lon=${longitude.toString()}&format=json&addressdetails=1`;

      const timeoutController = new AbortController();
      const timeoutId = setTimeout(() => {
        timeoutController.abort();
      }, 3500);
      const onSignalAbort = () => {
        timeoutController.abort();
      };
      signal?.addEventListener('abort', onSignalAbort, { once: true });

      try {
        const response = await fetchWithHardTimeout(
          url,
          {
            method: 'GET',
            headers: {
              'User-Agent': USER_AGENT,
              'Accept-Language': 'fr, fr-FR;q=0.9, en;q=0.5',
            },
            signal: timeoutController.signal,
          },
          3500,
        );

        if (!response.ok) {
          throw new Error(`Nominatim reverse error: ${String(response.status)}`);
        }

        const data = (await response.json()) as RawNominatimItem;
        const formatted = this.formatPlace(data);
        const result = {
          displayName: formatted.displayName,
          primaryText: formatted.primaryText,
        };

        this.reverseCache.set(cacheKey, {
          timestamp: Date.now(),
          data: result,
        });

        return result;
      } finally {
        clearTimeout(timeoutId);
        signal?.removeEventListener('abort', onSignalAbort);
      }
    }, signal);
  }

  /**
   * Exécute une requête avec détection d'attente/lenteur et retries en cas de bug OSM.
   */
  private async executeWithOsmRetry<T>(
    fetchFn: (sig?: AbortSignal) => Promise<T>,
    options?: {
      signal?: AbortSignal;
      onWaitingOsm?: () => void;
      maxRetries?: number;
    },
  ): Promise<T> {
    const maxRetries = options?.maxRetries ?? 2;
    let attempt = 0;

    let slowTimer: ReturnType<typeof setTimeout> | null = setTimeout(() => {
      options?.onWaitingOsm?.();
    }, 1000);

    const clearSlowTimer = () => {
      if (slowTimer !== null) {
        clearTimeout(slowTimer);
        slowTimer = null;
      }
    };

    const isAborted = (): boolean => options?.signal?.aborted === true;

    while (attempt <= maxRetries) {
      if (isAborted()) {
        clearSlowTimer();
        throw new DOMException('Aborted', 'AbortError');
      }

      try {
        const result = await fetchFn(options?.signal);
        clearSlowTimer();
        return result;
      } catch (err) {
        clearSlowTimer();
        options?.onWaitingOsm?.();

        if (attempt >= maxRetries || isAborted()) {
          throw err;
        }

        attempt++;
        // Pause de 1 seconde avant retry pour respecter le rate limiter et laisser OSM respirer
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    throw new Error('OSM_MAX_RETRIES_EXCEEDED');
  }

  /**
   * Géocodage inversé intelligent avec recherche dans un rayon de 500 mètres :
   * 1. Vérifie si une adresse précise existe aux coordonnées exactes (zoom 18).
   * 2. Si non trouvée, recherche l'adresse la plus proche dans un rayon de 500m (zoom 16 puis bounding box 500m).
   * 3. Si OpenStreetMap est lent ou bug, appelle `onWaitingOsm` pour notifier l'UI.
   */
  async reverseGeocodeWithFallback(
    latitude: number,
    longitude: number,
    options?: {
      radiusMeters?: number;
      signal?: AbortSignal;
      onWaitingOsm?: () => void;
      maxRetries?: number;
    },
  ): Promise<OsmReverseGeocodeResult | null> {
    const radiusMeters = options?.radiusMeters ?? 500;
    const cacheKey = `${latitude.toFixed(4)},${longitude.toFixed(4)},${String(radiusMeters)}`;

    const cached = this.fallbackCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return cached.data;
    }

    try {
      return await this.executeWithOsmRetry(async (sig) => {
        // --- ÉTAPE 1 : Requête exacte aux coordonnées (zoom 18) ---
        const exactUrl = `${NOMINATIM_BASE_URL}/reverse?lat=${latitude.toString()}&lon=${longitude.toString()}&format=json&addressdetails=1&zoom=18`;

        const exactData = await this.rateLimiter.schedule(async () => {
          if (sig?.aborted === true) return null;
          const res = await fetchWithHardTimeout(
            exactUrl,
            {
              method: 'GET',
              headers: {
                'User-Agent': USER_AGENT,
                'Accept-Language': 'fr, fr-FR;q=0.9, en;q=0.5',
              },
            },
            3000,
          );
          if (res.status === 429 || res.status >= 500) {
            throw new Error(`OSM error ${String(res.status)}`);
          }
          if (!res.ok) return null;
          return (await res.json()) as RawNominatimItem & { error?: string };
        }, sig);

        // Vérification de la pertinence de l'adresse exacte (doit comporter un nom de voie, bâtiment ou numéro)
        const hasRoadOrPlace =
          exactData !== null &&
          exactData.error === undefined &&
          exactData.address !== undefined &&
          ((typeof exactData.address.road === 'string' && exactData.address.road.length > 0) ||
            (typeof exactData.address.street === 'string' && exactData.address.street.length > 0) ||
            (typeof exactData.address.pedestrian === 'string' &&
              exactData.address.pedestrian.length > 0) ||
            (typeof exactData.address.building === 'string' &&
              exactData.address.building.length > 0) ||
            (typeof exactData.address.amenity === 'string' &&
              exactData.address.amenity.length > 0) ||
            (typeof exactData.address.house_number === 'string' &&
              exactData.address.house_number.length > 0));

        if (exactData !== null && exactData.error === undefined && hasRoadOrPlace) {
          const itemLat = parseFloat(exactData.lat) || latitude;
          const itemLon = parseFloat(exactData.lon) || longitude;
          const dist = calculateDistanceMeters(latitude, longitude, itemLat, itemLon);

          const formatted = formatOsmAddress(exactData);
          const result: OsmReverseGeocodeResult = {
            displayName: formatted.displayName,
            primaryText: formatted.primaryText,
            isNearby: false,
            distanceMeters: dist,
            latitude: itemLat,
            longitude: itemLon,
          };

          this.fallbackCache.set(cacheKey, { timestamp: Date.now(), data: result });
          return result;
        }

        // --- ÉTAPE 2 : Recherche de repli dans un rayon de 500 m (zoom 16) ---
        const zoom16Url = `${NOMINATIM_BASE_URL}/reverse?lat=${latitude.toString()}&lon=${longitude.toString()}&format=json&addressdetails=1&zoom=16`;
        const zoom16Data = await this.rateLimiter.schedule(async () => {
          if (sig?.aborted === true) return null;
          const res = await fetchWithHardTimeout(
            zoom16Url,
            {
              method: 'GET',
              headers: {
                'User-Agent': USER_AGENT,
                'Accept-Language': 'fr, fr-FR;q=0.9, en;q=0.5',
              },
            },
            3000,
          );
          if (res.status === 429 || res.status >= 500) {
            throw new Error(`OSM error ${String(res.status)}`);
          }
          if (!res.ok) return null;
          return (await res.json()) as RawNominatimItem & { error?: string };
        }, sig);

        if (
          zoom16Data !== null &&
          zoom16Data.error === undefined &&
          zoom16Data.address !== undefined
        ) {
          const itemLat = parseFloat(zoom16Data.lat);
          const itemLon = parseFloat(zoom16Data.lon);
          const dist = calculateDistanceMeters(latitude, longitude, itemLat, itemLon);

          if (dist <= radiusMeters) {
            const formatted = formatOsmAddress(zoom16Data);
            const result: OsmReverseGeocodeResult = {
              displayName: formatted.displayName,
              primaryText: formatted.primaryText,
              isNearby: true,
              distanceMeters: dist,
              latitude: itemLat,
              longitude: itemLon,
            };

            this.fallbackCache.set(cacheKey, { timestamp: Date.now(), data: result });
            return result;
          }
        }

        // --- ÉTAPE 3 : Recherche via Bounding Box 500m ---
        const deltaLat = radiusMeters / 111320;
        const cosLat = Math.cos((latitude * Math.PI) / 180);
        const deltaLon = radiusMeters / (111320 * (Math.abs(cosLat) > 0.01 ? Math.abs(cosLat) : 1));

        const left = (longitude - deltaLon).toFixed(5);
        const right = (longitude + deltaLon).toFixed(5);
        const top = (latitude + deltaLat).toFixed(5);
        const bottom = (latitude - deltaLat).toFixed(5);

        const searchUrl = `${NOMINATIM_BASE_URL}/search?format=json&addressdetails=1&viewbox=${left},${top},${right},${bottom}&bounded=1&q=rue+street+road+avenue+chemin+place&limit=5`;

        const searchResults = await this.rateLimiter.schedule(async () => {
          if (sig?.aborted === true) return [];
          const res = await fetchWithHardTimeout(
            searchUrl,
            {
              method: 'GET',
              headers: {
                'User-Agent': USER_AGENT,
                'Accept-Language': 'fr, fr-FR;q=0.9, en;q=0.5',
              },
            },
            3000,
          );
          if (res.status === 429 || res.status >= 500) {
            throw new Error(`OSM error ${String(res.status)}`);
          }
          if (!res.ok) return [];
          return (await res.json()) as RawNominatimItem[];
        }, sig);

        let bestItem: RawNominatimItem | null = null;
        let bestDistance = Infinity;

        for (const item of searchResults) {
          const itemLat = parseFloat(item.lat);
          const itemLon = parseFloat(item.lon);
          if (!isNaN(itemLat) && !isNaN(itemLon)) {
            const dist = calculateDistanceMeters(latitude, longitude, itemLat, itemLon);
            if (dist <= radiusMeters && dist < bestDistance) {
              bestDistance = dist;
              bestItem = item;
            }
          }
        }

        if (bestItem !== null) {
          const formatted = formatOsmAddress(bestItem);
          const result: OsmReverseGeocodeResult = {
            displayName: formatted.displayName,
            primaryText: formatted.primaryText,
            isNearby: true,
            distanceMeters: bestDistance,
            latitude: parseFloat(bestItem.lat),
            longitude: parseFloat(bestItem.lon),
          };

          this.fallbackCache.set(cacheKey, { timestamp: Date.now(), data: result });
          return result;
        }

        // Aucune adresse trouvée même dans le rayon de 500m
        return null;
      }, options);
    } catch {
      options?.onWaitingOsm?.();
      return null;
    }
  }
}

export const nominatimService = new NominatimService();
