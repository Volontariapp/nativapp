import { routingService } from '../routing.service';
import type { Coordinates } from '../routing.service';
import {
  createMockOsrmErrorResponse,
  createMockOsrmRouteResponse,
  createMockOsrmTableResponse,
} from './osrm-response.mock';

const ORIGIN: Coordinates = { latitude: 48.8566, longitude: 2.3522 };
const DEST_A: Coordinates = { latitude: 48.86, longitude: 2.35 };
const DEST_B: Coordinates = { latitude: 48.87, longitude: 2.36 };

const okResponse = (body: object): Response => new Response(JSON.stringify(body), { status: 200 });

describe('routingService', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-11-07T12:00:00.000Z'));
    routingService.resetForTesting();
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.useRealTimers();
  });

  describe('fetchWalkingDurations', () => {
    it('construit l URL table en ordre longitude,latitude sur le bon hote', async () => {
      const fetchSpy = jest
        .spyOn(global, 'fetch')
        .mockResolvedValue(okResponse(createMockOsrmTableResponse([[0, 100, 200]])));

      await routingService.fetchWalkingDurations(ORIGIN, [DEST_A, DEST_B]);

      expect(fetchSpy).toHaveBeenCalledTimes(1);
      expect(fetchSpy.mock.calls[0]?.[0]).toBe(
        'https://routing.openstreetmap.de/routed-foot/table/v1/foot/2.3522,48.8566;2.35,48.86;2.36,48.87?sources=0&annotations=duration',
      );
    });

    it('retire la source et conserve les durees null', async () => {
      jest
        .spyOn(global, 'fetch')
        .mockResolvedValue(okResponse(createMockOsrmTableResponse([[0, 1005.5, null]])));

      const result = await routingService.fetchWalkingDurations(ORIGIN, [DEST_A, DEST_B]);

      expect(result.durationsSeconds).toEqual([1005.5, null]);
    });

    it('envoie le User-Agent identifiant l application', async () => {
      const fetchSpy = jest
        .spyOn(global, 'fetch')
        .mockResolvedValue(okResponse(createMockOsrmTableResponse([[0, 10]])));

      await routingService.fetchWalkingDurations(ORIGIN, [DEST_A]);

      expect(fetchSpy.mock.calls[0]?.[1]?.headers).toEqual({
        'User-Agent': 'Volontariapp-Mobile/1.0 (contact@volontariapp.fr)',
      });
    });

    it('rejette si le code OSRM differe de Ok', async () => {
      jest.spyOn(global, 'fetch').mockResolvedValue(okResponse(createMockOsrmErrorResponse()));

      await expect(routingService.fetchWalkingDurations(ORIGIN, [DEST_A])).rejects.toThrow(
        'OSRM table error',
      );
    });

    it('rejette si le statut HTTP est en erreur', async () => {
      jest.spyOn(global, 'fetch').mockResolvedValue(new Response('boom', { status: 503 }));

      await expect(routingService.fetchWalkingDurations(ORIGIN, [DEST_A])).rejects.toThrow('503');
    });

    it('sert le deuxieme appel identique depuis le cache pendant 60 s', async () => {
      const fetchSpy = jest
        .spyOn(global, 'fetch')
        .mockImplementation(() =>
          Promise.resolve(okResponse(createMockOsrmTableResponse([[0, 10]]))),
        );

      await routingService.fetchWalkingDurations(ORIGIN, [DEST_A]);
      await routingService.fetchWalkingDurations(ORIGIN, [DEST_A]);
      expect(fetchSpy).toHaveBeenCalledTimes(1);

      jest.setSystemTime(new Date('2026-11-07T12:01:01.000Z'));
      const pending = routingService.fetchWalkingDurations(ORIGIN, [DEST_A]);
      await jest.advanceTimersByTimeAsync(1100);
      await pending;
      expect(fetchSpy).toHaveBeenCalledTimes(2);
    });

    it('espace deux requetes d au moins 1100 ms', async () => {
      const fetchSpy = jest
        .spyOn(global, 'fetch')
        .mockImplementation(() =>
          Promise.resolve(okResponse(createMockOsrmTableResponse([[0, 10]]))),
        );

      await routingService.fetchWalkingDurations(ORIGIN, [DEST_A]);
      const second = routingService.fetchWalkingDurations(ORIGIN, [DEST_B]);

      await jest.advanceTimersByTimeAsync(1099);
      expect(fetchSpy).toHaveBeenCalledTimes(1);

      await jest.advanceTimersByTimeAsync(1);
      await second;
      expect(fetchSpy).toHaveBeenCalledTimes(2);
    });
  });

  describe('fetchWalkingRoute', () => {
    it('construit l URL route et convertit [lng, lat] en latitude, longitude', async () => {
      const fetchSpy = jest.spyOn(global, 'fetch').mockResolvedValue(
        okResponse(
          createMockOsrmRouteResponse(812.4, 640.6, [
            [2.3522, 48.8566],
            [2.35, 48.86],
          ]),
        ),
      );

      const route = await routingService.fetchWalkingRoute(ORIGIN, DEST_A);

      expect(fetchSpy.mock.calls[0]?.[0]).toBe(
        'https://routing.openstreetmap.de/routed-foot/route/v1/foot/2.3522,48.8566;2.35,48.86?overview=full&geometries=geojson',
      );
      expect(route.distanceMeters).toBe(812);
      expect(route.durationSeconds).toBe(641);
      expect(route.geometry).toEqual([
        { latitude: 48.8566, longitude: 2.3522 },
        { latitude: 48.86, longitude: 2.35 },
      ]);
    });

    it('rejette si le code OSRM differe de Ok', async () => {
      jest
        .spyOn(global, 'fetch')
        .mockResolvedValue(okResponse(createMockOsrmErrorResponse('NoRoute', 'none')));

      await expect(routingService.fetchWalkingRoute(ORIGIN, DEST_A)).rejects.toThrow(
        'OSRM route error: NoRoute',
      );
    });

    it('rejette si le statut HTTP est en erreur', async () => {
      jest.spyOn(global, 'fetch').mockResolvedValue(new Response('x', { status: 500 }));

      await expect(routingService.fetchWalkingRoute(ORIGIN, DEST_A)).rejects.toThrow('500');
    });
  });
});
