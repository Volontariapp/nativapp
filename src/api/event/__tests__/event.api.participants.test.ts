import { apiFetch } from '../../client';
import { eventApi } from '../event.api';

jest.mock('../../client', () => ({ apiFetch: jest.fn() }));

describe('eventApi.getEventParticipants', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('rethrows network errors instead of returning an empty list', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
    jest.mocked(apiFetch).mockRejectedValue(new Error('network'));

    await expect(eventApi.getEventParticipants('event-1', { page: 1, limit: 20 })).rejects.toThrow(
      'network',
    );
  });
});
