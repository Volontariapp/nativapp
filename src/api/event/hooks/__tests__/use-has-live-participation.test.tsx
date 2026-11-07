import { renderHook, waitFor } from '@testing-library/react-native';
import { EventState } from '@volontariapp/contracts';
import { createQueryWrapper } from '@/api/__tests__/query-wrapper.factory';
import { eventApi } from '../../event.api';
import { createLiveEvent } from '../../__tests__/live-event.factory';
import { useHasLiveParticipation } from '../use-has-live-participation';

jest.mock('@/api/client', () => ({ apiFetch: jest.fn() }));

const NOW = new Date('2026-11-07T12:00:00.000Z').getTime();

const page = (events: ReturnType<typeof createLiveEvent>[]) => ({
  events,
  totalCount: events.length,
});

describe('useHasLiveParticipation', () => {
  beforeEach(() => {
    jest.spyOn(Date, 'now').mockReturnValue(NOW);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  const mockLists = (
    participated: ReturnType<typeof createLiveEvent>[],
    mine: ReturnType<typeof createLiveEvent>[],
  ) => {
    const participatedSpy = jest
      .spyOn(eventApi, 'getParticipatedEvents')
      .mockResolvedValue(page(participated));
    const mineSpy = jest.spyOn(eventApi, 'getMyEvents').mockResolvedValue(page(mine));
    return { participatedSpy, mineSpy };
  };

  it('is true when a participation is live', async () => {
    mockLists([createLiveEvent({ id: 'p1' }, NOW)], []);
    const { result } = renderHook(() => useHasLiveParticipation(true), {
      wrapper: createQueryWrapper(),
    });

    await waitFor(() => {
      expect(result.current).toBe(true);
    });
  });

  it('is true when an organized event is live', async () => {
    mockLists([], [createLiveEvent({ id: 'o1' }, NOW)]);
    const { result } = renderHook(() => useHasLiveParticipation(true), {
      wrapper: createQueryWrapper(),
    });

    await waitFor(() => {
      expect(result.current).toBe(true);
    });
  });

  it('ignores a cancelled event inside the time range', async () => {
    const { participatedSpy, mineSpy } = mockLists(
      [createLiveEvent({ id: 'c1', state: EventState.EVENT_STATE_CANCELLED }, NOW)],
      [],
    );
    const { result } = renderHook(() => useHasLiveParticipation(true), {
      wrapper: createQueryWrapper(),
    });

    await waitFor(() => {
      expect(participatedSpy).toHaveBeenCalledTimes(1);
      expect(mineSpy).toHaveBeenCalledTimes(1);
    });
    await waitFor(() => {
      expect(result.current).toBe(false);
    });
  });

  it('ignores a finished event inside the time range', async () => {
    const { participatedSpy, mineSpy } = mockLists(
      [],
      [createLiveEvent({ id: 'f1', state: EventState.EVENT_STATE_FINISHED }, NOW)],
    );
    const { result } = renderHook(() => useHasLiveParticipation(true), {
      wrapper: createQueryWrapper(),
    });

    await waitFor(() => {
      expect(participatedSpy).toHaveBeenCalledTimes(1);
      expect(mineSpy).toHaveBeenCalledTimes(1);
    });
    expect(result.current).toBe(false);
  });

  it('is false and sends no request when disabled', () => {
    const { participatedSpy, mineSpy } = mockLists([createLiveEvent({ id: 'p1' }, NOW)], []);
    const { result } = renderHook(() => useHasLiveParticipation(false), {
      wrapper: createQueryWrapper(),
    });

    expect(result.current).toBe(false);
    expect(participatedSpy).not.toHaveBeenCalled();
    expect(mineSpy).not.toHaveBeenCalled();
  });
});
