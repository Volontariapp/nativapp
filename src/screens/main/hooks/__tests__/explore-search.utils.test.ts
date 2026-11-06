import { EventState } from '@volontariapp/contracts';
import { createEvent } from '@/components/event/__tests__/event-app.factory';
import {
  buildExploreSearchParams,
  isWithinDistance,
  MAP_EVENTS_PAGE_LIMIT,
  shouldLoadMoreMapEvents,
} from '../explore-search.utils';

const PARIS = { latitude: 48.8566, longitude: 2.3522 };
// A Versailles, environ 14 km de Paris (valeur de reference connue, pas recalculee ici).
const VERSAILLES = { latitude: 48.8049, longitude: 2.1204 };
// A Lyon, environ 392 km de Paris.
const LYON = { latitude: 45.764, longitude: 4.8357 };

describe('buildExploreSearchParams', () => {
  it('searches inside the chosen distance around the center, in meters', () => {
    const params = buildExploreSearchParams({ center: PARIS, distanceKm: 5 });

    expect(params.area).toEqual({ center: PARIS, radiusMeters: 5000 });
  });

  it('searches without any area when the distance is unlimited', () => {
    const params = buildExploreSearchParams({ center: PARIS, distanceKm: null });

    expect(params.area).toBeUndefined();
  });

  it('searches without any area when there is no center', () => {
    const params = buildExploreSearchParams({ center: undefined, distanceKm: 5 });

    expect(params.area).toBeUndefined();
  });

  it('only asks for published events of other organizers', () => {
    const params = buildExploreSearchParams({ center: PARIS, distanceKm: 5 });

    expect(params.statuses).toEqual([EventState.EVENT_STATE_PUBLISHED]);
    expect(params.excludeCreatedByMe).toBe(true);
  });

  it('uses the shared page size of the map', () => {
    const params = buildExploreSearchParams({ center: PARIS, distanceKm: 5 });

    expect(params.limit).toBe(MAP_EVENTS_PAGE_LIMIT);
  });
});

describe('isWithinDistance', () => {
  it('keeps an event closer than the distance', () => {
    const event = createEvent({ location: VERSAILLES });

    expect(isWithinDistance(event, PARIS, 20)).toBe(true);
  });

  it('drops an event farther than the distance', () => {
    const event = createEvent({ location: VERSAILLES });

    expect(isWithinDistance(event, PARIS, 10)).toBe(false);
  });

  it('keeps every event when the distance is unlimited', () => {
    const event = createEvent({ location: LYON });

    expect(isWithinDistance(event, PARIS, null)).toBe(true);
  });

  it('keeps an event that has no location', () => {
    const event = createEvent({ location: undefined });

    expect(isWithinDistance(event, PARIS, 5)).toBe(true);
  });

  it('keeps every event while the center is unknown', () => {
    const event = createEvent({ location: LYON });

    expect(isWithinDistance(event, undefined, 5)).toBe(true);
  });

  it('measures from the given center, not from another position', () => {
    const event = createEvent({ location: LYON });

    expect(isWithinDistance(event, LYON, 5)).toBe(true);
    expect(isWithinDistance(event, PARIS, 5)).toBe(false);
  });
});

describe('shouldLoadMoreMapEvents', () => {
  it('loads the next page while there is one and nothing is loading', () => {
    expect(
      shouldLoadMoreMapEvents({ hasNextPage: true, isFetchingNextPage: false, loadedPages: 1 }),
    ).toBe(true);
  });

  it('waits for the page being fetched', () => {
    expect(
      shouldLoadMoreMapEvents({ hasNextPage: true, isFetchingNextPage: true, loadedPages: 1 }),
    ).toBe(false);
  });

  it('stops when there is no next page', () => {
    expect(
      shouldLoadMoreMapEvents({ hasNextPage: false, isFetchingNextPage: false, loadedPages: 2 }),
    ).toBe(false);
  });

  it('stops after 6 pages to bound the network cost', () => {
    expect(
      shouldLoadMoreMapEvents({ hasNextPage: true, isFetchingNextPage: false, loadedPages: 5 }),
    ).toBe(true);
    expect(
      shouldLoadMoreMapEvents({ hasNextPage: true, isFetchingNextPage: false, loadedPages: 6 }),
    ).toBe(false);
  });
});
