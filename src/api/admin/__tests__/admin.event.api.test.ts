import { apiFetch } from '../../client';
import { adminEventApi } from '../admin.event.api';

jest.mock('../../client', () => ({ apiFetch: jest.fn() }));

const apiFetchMock = jest.mocked(apiFetch);

const lastQuery = (): URLSearchParams => {
  const lastCall = apiFetchMock.mock.calls.at(-1);
  return new URL(`http://x${lastCall?.[0] ?? ''}`).searchParams;
};

describe('adminEventApi.listEvents pagination', () => {
  beforeEach(() => {
    apiFetchMock.mockResolvedValue({ events: [] });
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('forwards page and limit from the payload', async () => {
    await adminEventApi.listEvents({ onlyAvailable: false, page: 3, limit: 100 });

    expect(lastQuery().get('page')).toBe('3');
    expect(lastQuery().get('limit')).toBe('100');
  });

  it('defaults to page 1 and limit 50 when absent', async () => {
    await adminEventApi.listEvents({ onlyAvailable: false });

    expect(lastQuery().get('page')).toBe('1');
    expect(lastQuery().get('limit')).toBe('50');
  });
});
