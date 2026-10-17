import { getFakeEcologyImage } from '@/utils/fake-images.util';
import { getEventImageUri, readEventCover } from '../event-cover.utils';
import { createEventDto } from './event-web.factory';

const COVER_URL = 'https://cdn.test/event-cover/76c5b964-b5a1-43e3-85e2-040683457e56.webp';

describe('readEventCover', () => {
  it('reads the status and the url of a READY cover', () => {
    const event = createEventDto({ coverStatus: 'READY', coverUrl: COVER_URL });

    expect(readEventCover(event)).toEqual({ coverStatus: 'READY', coverUrl: COVER_URL });
  });

  it.each(['NONE', 'PENDING', 'REJECTED'] as const)(
    'keeps the %s status and no url when the gateway sends none',
    (coverStatus) => {
      expect(readEventCover(createEventDto({ coverStatus }))).toEqual({
        coverStatus,
        coverUrl: undefined,
      });
    },
  );

  it('ignores a status it does not know', () => {
    // Statut numérique d'un type gRPC brut, jamais pris pour un statut de la gateway.
    const event = Object.assign(createEventDto(), { coverStatus: 3 });

    expect(readEventCover(event).coverStatus).toBeUndefined();
  });

  it('treats an empty url as missing', () => {
    expect(readEventCover(createEventDto({ coverStatus: 'READY', coverUrl: '' })).coverUrl).toBe(
      undefined,
    );
  });
});

describe('getEventImageUri', () => {
  it('uses the cover url when there is one', () => {
    expect(getEventImageUri({ id: 'event-1', coverUrl: COVER_URL })).toBe(COVER_URL);
  });

  it('falls back to a stable stand-in image without a cover', () => {
    expect(getEventImageUri({ id: 'event-1' })).toBe(getFakeEcologyImage('event-1'));
    expect(getEventImageUri({ id: 'event-1', coverUrl: '' })).toBe(getFakeEcologyImage('event-1'));
  });
});
