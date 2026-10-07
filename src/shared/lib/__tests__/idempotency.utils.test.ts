import { generateIdempotencyKey } from '../idempotency.utils';

const UUID_V4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

describe('generateIdempotencyKey', () => {
  it('returns a UUID v4', () => {
    expect(generateIdempotencyKey()).toMatch(UUID_V4);
  });

  it('returns a different key on each call', () => {
    const keys = new Set(Array.from({ length: 200 }, () => generateIdempotencyKey()));

    expect(keys.size).toBe(200);
  });
});
