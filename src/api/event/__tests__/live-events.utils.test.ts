import { EventState, EventType } from '@volontariapp/contracts';
import { createMockAppEvent } from '@/components/post/__tests__/event.factory';
import type { Coordinates } from '@/services/routing.service';
import {
  buildLiveEventsResult,
  haversineMeters,
  isEventFull,
  isEventJoinableLive,
  LIVE_MAX_FULL_SHOWN,
  LIVE_MAX_JOINABLE,
  LIVE_MAX_ROUTING_CANDIDATES,
  LIVE_MAX_WALK_S,
  preselectLiveCandidates,
  WALKING_SPEED_MPS,
} from '../live-events.utils';

describe('live-events.utils', () => {
  const NOW = new Date('2026-11-07T12:00:00.000Z').getTime();
  const ORIGIN: Coordinates = { latitude: 48.8566, longitude: 2.3522 };

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('isEventFull', () => {
    it('renvoie false si maxParticipants <= 0 quelle que soit l affluence', () => {
      expect(isEventFull({ maxParticipants: 0, currentParticipants: 50 })).toBe(false);
      expect(isEventFull({ maxParticipants: -1, currentParticipants: 10 })).toBe(false);
    });

    it('renvoie false si la capacite n est pas atteinte', () => {
      expect(isEventFull({ maxParticipants: 10, currentParticipants: 9 })).toBe(false);
    });

    it('renvoie true si complet exactement a la capacite ou au-dela', () => {
      expect(isEventFull({ maxParticipants: 10, currentParticipants: 10 })).toBe(true);
      expect(isEventFull({ maxParticipants: 10, currentParticipants: 12 })).toBe(true);
    });
  });

  describe('isEventJoinableLive', () => {
    const baseEvent = createMockAppEvent({
      startAt: '2026-11-07T11:00:00.000Z',
      endAt: '2026-11-07T13:00:00.000Z',
      state: EventState.EVENT_STATE_PUBLISHED,
      location: { latitude: 48.8584, longitude: 2.347 },
    });

    it('accepte un evenement dans sa plage horaire avec statut publie et coordonnees', () => {
      expect(isEventJoinableLive(baseEvent, NOW)).toBe(true);
    });

    it('accepte un evenement IN_PROGRESS dont la fin n est pas depassee', () => {
      const inProgress = createMockAppEvent({
        ...baseEvent,
        startAt: '2026-11-07T10:00:00.000Z',
        endAt: '2026-11-07T13:00:00.000Z',
        state: EventState.EVENT_STATE_IN_PROGRESS,
      });
      expect(isEventJoinableLive(inProgress, NOW)).toBe(true);
    });

    it('ecarte un evenement IN_PROGRESS dont la fin est depassee', () => {
      const expiredInProgress = createMockAppEvent({
        ...baseEvent,
        startAt: '2026-11-07T10:00:00.000Z',
        endAt: '2026-11-07T11:59:00.000Z',
        state: EventState.EVENT_STATE_IN_PROGRESS,
      });
      expect(isEventJoinableLive(expiredInProgress, NOW)).toBe(false);
    });

    it('ecarte un evenement CANCELLED ou FINISHED meme dans sa plage horaire', () => {
      const cancelled = createMockAppEvent({
        ...baseEvent,
        state: EventState.EVENT_STATE_CANCELLED,
      });
      const finished = createMockAppEvent({
        ...baseEvent,
        state: EventState.EVENT_STATE_FINISHED,
      });
      expect(isEventJoinableLive(cancelled, NOW)).toBe(false);
      expect(isEventJoinableLive(finished, NOW)).toBe(false);
    });

    it('ecarte un evenement sans localisation', () => {
      const withoutLocation = createMockAppEvent({
        ...baseEvent,
        location: undefined,
      });
      expect(isEventJoinableLive(withoutLocation, NOW)).toBe(false);
    });

    it('ecarte un evenement pas encore commence ou deja termine', () => {
      const future = createMockAppEvent({
        ...baseEvent,
        startAt: '2026-11-07T13:00:00.000Z',
        endAt: '2026-11-07T15:00:00.000Z',
      });
      const past = createMockAppEvent({
        ...baseEvent,
        startAt: '2026-11-07T09:00:00.000Z',
        endAt: '2026-11-07T11:00:00.000Z',
      });
      expect(isEventJoinableLive(future, NOW)).toBe(false);
      expect(isEventJoinableLive(past, NOW)).toBe(false);
    });
  });

  describe('haversineMeters', () => {
    it('renvoie 0 metre pour deux points identiques', () => {
      expect(haversineMeters(ORIGIN, ORIGIN)).toBe(0);
    });

    it('calcule la distance entre deux coordonnees connues', () => {
      const destination: Coordinates = { latitude: 48.8675, longitude: 2.3638 };
      const distance = haversineMeters(ORIGIN, destination);
      expect(distance).toBeGreaterThan(1400);
      expect(distance).toBeLessThan(1800);
    });
  });

  describe('preselectLiveCandidates', () => {
    it('filtre, trie par distance croissante et limite a LIVE_MAX_ROUTING_CANDIDATES', () => {
      const events = Array.from({ length: 12 }, (_, index) =>
        createMockAppEvent({
          id: `evt-${String(index)}`,
          startAt: '2026-11-07T11:00:00.000Z',
          endAt: '2026-11-07T14:00:00.000Z',
          state: EventState.EVENT_STATE_PUBLISHED,
          location: {
            latitude: 48.8566 + (index + 1) * 0.001,
            longitude: 2.3522,
          },
        }),
      );

      const result = preselectLiveCandidates(events, ORIGIN, NOW);

      expect(result).toHaveLength(LIVE_MAX_ROUTING_CANDIDATES);
      expect(result[0]?.event.id).toBe('evt-0');
      for (let i = 1; i < result.length; i += 1) {
        const prev = result[i - 1]?.distanceMeters ?? 0;
        const curr = result[i]?.distanceMeters ?? 0;
        expect(curr).toBeGreaterThanOrEqual(prev);
      }
    });

    it('renvoie une liste vide quand aucun evenement n est joignable', () => {
      const cancelled = createMockAppEvent({
        startAt: '2026-11-07T11:00:00.000Z',
        endAt: '2026-11-07T14:00:00.000Z',
        state: EventState.EVENT_STATE_CANCELLED,
        location: { latitude: 48.858, longitude: 2.35 },
      });
      expect(preselectLiveCandidates([cancelled], ORIGIN, NOW)).toEqual([]);
    });
  });

  describe('buildLiveEventsResult', () => {
    const makeCandidate = (
      id: string,
      distanceMeters: number,
      endAt = '2026-11-07T13:00:00.000Z',
      maxParticipants = 20,
      currentParticipants = 5,
    ) => ({
      event: createMockAppEvent({
        id,
        startAt: '2026-11-07T11:00:00.000Z',
        endAt,
        type: EventType.EVENT_TYPE_ECOLOGY,
        state: EventState.EVENT_STATE_PUBLISHED,
        maxParticipants,
        currentParticipants,
        location: { latitude: 48.858, longitude: 2.35 },
      }),
      distanceMeters,
    });

    it('utilise la duree OSRM et marque isEstimated a false', () => {
      const candidates = [makeCandidate('e1', 500)];
      const result = buildLiveEventsResult(candidates, [300], NOW);

      expect(result.joinable).toHaveLength(1);
      expect(result.joinable[0]?.walkSeconds).toBe(300);
      expect(result.joinable[0]?.isEstimated).toBe(false);
      expect(result.joinable[0]?.availability).toBe('JOINABLE');
    });

    it('estime la duree via WALKING_SPEED_MPS avec isEstimated = true si duree null', () => {
      const distance = 750;
      const candidates = [makeCandidate('e1', distance)];
      const result = buildLiveEventsResult(candidates, [null], NOW);

      expect(result.joinable).toHaveLength(1);
      expect(result.joinable[0]?.walkSeconds).toBe(Math.round(distance / WALKING_SPEED_MPS));
      expect(result.joinable[0]?.isEstimated).toBe(true);
    });

    it('ecarte un evenement dont la marche depasse LIVE_MAX_WALK_S', () => {
      const candidates = [makeCandidate('too-far', 2000)];
      const result = buildLiveEventsResult(candidates, [LIVE_MAX_WALK_S + 1], NOW);
      expect(result.joinable).toHaveLength(0);
      expect(result.full).toHaveLength(0);
    });

    it('ecarte un evenement dont la fin est trop proche par rapport a la marche', () => {
      // Fin a 12:20 (20 min restantes = 1200 s), marche de 10 min (600 s) + 15 min utile (900 s) = 1500 s requis
      const candidates = [makeCandidate('too-close', 500, '2026-11-07T12:20:00.000Z')];
      const result = buildLiveEventsResult(candidates, [600], NOW);
      expect(result.joinable).toHaveLength(0);
    });

    it('classe dans full un evenement complet exactement a la capacite et joinable si capacite 0', () => {
      const fullEvt = makeCandidate('full', 300, '2026-11-07T14:00:00.000Z', 10, 10);
      const unlimitedEvt = makeCandidate('unlimited', 400, '2026-11-07T14:00:00.000Z', 0, 50);

      const result = buildLiveEventsResult([fullEvt, unlimitedEvt], [180, 240], NOW);

      expect(result.full).toHaveLength(1);
      expect(result.full[0]?.event.id).toBe('full');
      expect(result.full[0]?.availability).toBe('FULL');

      expect(result.joinable).toHaveLength(1);
      expect(result.joinable[0]?.event.id).toBe('unlimited');
      expect(result.joinable[0]?.availability).toBe('JOINABLE');
    });

    it('trie par walkSeconds et tronque a LIVE_MAX_JOINABLE et LIVE_MAX_FULL_SHOWN', () => {
      const joinableCandidates = [
        makeCandidate('j1', 500),
        makeCandidate('j2', 300),
        makeCandidate('j3', 800),
        makeCandidate('j4', 200),
      ];
      const fullCandidates = [
        makeCandidate('f1', 600, '2026-11-07T13:00:00.000Z', 5, 5),
        makeCandidate('f2', 400, '2026-11-07T13:00:00.000Z', 5, 5),
        makeCandidate('f3', 200, '2026-11-07T13:00:00.000Z', 5, 5),
      ];

      const all = [...joinableCandidates, ...fullCandidates];
      const durations = [400, 200, 600, 100, 500, 300, 150];

      const result = buildLiveEventsResult(all, durations, NOW);

      expect(result.joinable).toHaveLength(LIVE_MAX_JOINABLE);
      expect(result.joinable.map((c) => c.walkSeconds)).toEqual([100, 200, 400]);

      expect(result.full).toHaveLength(LIVE_MAX_FULL_SHOWN);
      expect(result.full.map((c) => c.walkSeconds)).toEqual([150, 300]);
    });

    it('renvoie des listes vides quand aucun candidat n est fourni', () => {
      const result = buildLiveEventsResult([], [], NOW);
      expect(result).toEqual({ joinable: [], full: [] });
    });
  });
});
