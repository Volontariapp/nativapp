import { nominatimService } from '../nominatim.service';

describe('NominatimService', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('retourne un tableau vide si la recherche fait moins de 3 caractères sans appel réseau', async () => {
    const fetchMock = jest.fn();
    global.fetch = fetchMock;

    const result = await nominatimService.searchPlaces('ab');
    expect(result).toEqual([]);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('appelle l API Nominatim avec le User-Agent et formate les résultats', async () => {
    const mockApiResponse = [
      {
        place_id: 101,
        lat: '43.2612',
        lon: '5.3789',
        name: 'Plage du Prado',
        display_name: 'Plage du Prado, 8e Arrondissement, Marseille, Bouches-du-Rhône, France',
      },
    ];

    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => Promise.resolve(mockApiResponse),
    });
    global.fetch = fetchMock;

    const places = await nominatimService.searchPlaces('Plage du Prado');

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('https://nominatim.openstreetmap.org/search?q=Plage%20du%20Prado'),
      expect.anything(),
    );

    expect(places).toHaveLength(1);
    expect(places[0]?.primaryText).toBe('Plage du Prado');
    expect(places[0]?.latitude).toBeCloseTo(43.2612);
    expect(places[0]?.longitude).toBeCloseTo(5.3789);
  });

  it('utilise le cache mémoire pour les recherches identiques', async () => {
    const mockApiResponse = [
      {
        place_id: 202,
        lat: '48.8566',
        lon: '2.3522',
        display_name: 'Paris, Île-de-France, France',
      },
    ];

    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => Promise.resolve(mockApiResponse),
    });
    global.fetch = fetchMock;

    const res1 = await nominatimService.searchPlaces('Paris Centre');
    const res2 = await nominatimService.searchPlaces('Paris Centre');

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(res1).toEqual(res2);
  });

  it('effectue un géocodage inversé et met en cache par coordonnées', async () => {
    const mockReverseResponse = {
      place_id: 303,
      lat: '43.2965',
      lon: '5.3698',
      name: 'Vieux-Port',
      display_name: 'Vieux-Port, 1er Arrondissement, Marseille, France',
    };

    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => Promise.resolve(mockReverseResponse),
    });
    global.fetch = fetchMock;

    const result = await nominatimService.reverseGeocode(43.2965, 5.3698);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(result).not.toBeNull();
    expect(result?.displayName).toBe('Vieux-Port, 1er Arrondissement, Marseille, France');
    expect(result?.primaryText).toBe('Vieux-Port');

    // Deuxième appel avec coordonnées quasi identiques (arrondi à 4 décimales)
    const cachedResult = await nominatimService.reverseGeocode(43.29651, 5.36982);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(cachedResult).toEqual(result);
  });

  describe('reverseGeocodeWithFallback', () => {
    it('trouve l adresse exacte aux coordonnées avec zoom 18', async () => {
      const mockExactResponse = {
        place_id: 404,
        lat: '48.8566',
        lon: '2.3522',
        name: 'Hôtel de Ville',
        display_name: 'Hôtel de Ville, Place de l Hôtel de Ville, 4e Arrondissement, Paris, France',
        address: {
          road: 'Place de l Hôtel de Ville',
          city: 'Paris',
          postcode: '75004',
          country: 'France',
        },
      };

      const fetchMock = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => Promise.resolve(mockExactResponse),
      });
      global.fetch = fetchMock;

      const result = await nominatimService.reverseGeocodeWithFallback(48.8566, 2.3522);

      expect(result).not.toBeNull();
      expect(result?.isNearby).toBe(false);
      expect(result?.displayName).toContain('Hôtel de Ville');
      expect(result?.latitude).toBeCloseTo(48.8566);
    });

    it('trouve l adresse la plus proche dans le rayon de 500m si zoom 18 ne donne pas de rue', async () => {
      // Zoom 18 : pas de rue
      const mockEmptyResponse = {
        place_id: 501,
        lat: '48.8000',
        lon: '2.3000',
        display_name: 'France',
        address: {
          country: 'France',
        },
      };

      // Zoom 16 : rue à proximité (~100m)
      const mockNearbyResponse = {
        place_id: 502,
        lat: '48.8008',
        lon: '2.3005',
        name: 'Rue de la Paix',
        display_name: 'Rue de la Paix, 92120 Montrouge, France',
        address: {
          road: 'Rue de la Paix',
          city: 'Montrouge',
          postcode: '92120',
          country: 'France',
        },
      };

      const fetchMock = jest
        .fn()
        .mockResolvedValueOnce({
          ok: true,
          json: async () => Promise.resolve(mockEmptyResponse),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => Promise.resolve(mockNearbyResponse),
        });
      global.fetch = fetchMock;

      const result = await nominatimService.reverseGeocodeWithFallback(48.8, 2.3, {
        radiusMeters: 500,
      });

      expect(result).not.toBeNull();
      expect(result?.isNearby).toBe(true);
      expect(result?.distanceMeters).toBeLessThanOrEqual(500);
      expect(result?.displayName).toContain('Rue de la Paix');
    });

    it('déclenche onWaitingOsm en cas d anomalie ou lenteur OpenStreetMap', async () => {
      const onWaitingOsm = jest.fn();

      // Première tentative échoue (ex: 503 Service Unavailable), deuxième tentative réussit
      const mockSuccessResponse = {
        place_id: 601,
        lat: '48.8566',
        lon: '2.3522',
        name: 'Notre-Dame',
        display_name: 'Notre-Dame de Paris, 75004 Paris, France',
        address: {
          building: 'Notre-Dame de Paris',
          road: 'Parvis Notre-Dame',
          city: 'Paris',
          postcode: '75004',
        },
      };

      const fetchMock = jest
        .fn()
        .mockRejectedValueOnce(new Error('Network error 503'))
        .mockResolvedValueOnce({
          ok: true,
          json: async () => Promise.resolve(mockSuccessResponse),
        });
      global.fetch = fetchMock;

      const result = await nominatimService.reverseGeocodeWithFallback(48.853, 2.3499, {
        onWaitingOsm,
        maxRetries: 1,
      });

      expect(onWaitingOsm).toHaveBeenCalled();
      expect(result).not.toBeNull();
      expect(result?.displayName).toContain('Notre-Dame');
    });
  });
});
