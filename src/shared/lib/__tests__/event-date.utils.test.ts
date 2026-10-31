import {
  getCountdownLabel,
  getEventDateParts,
  sortEventsByStartAt,
  sortEventsByStartAtDesc,
} from '../event-date.utils';

const local = (year: number, month: number, day: number, hour = 10, minute = 0): string =>
  new Date(year, month - 1, day, hour, minute).toISOString();

describe('sortEventsByStartAt', () => {
  it('orders events from the soonest to the latest start', () => {
    const events = [
      { id: 'late', startAt: local(2026, 12, 3) },
      { id: 'soon', startAt: local(2026, 11, 2) },
      { id: 'middle', startAt: local(2026, 11, 20) },
    ];

    expect(sortEventsByStartAt(events).map((event) => event.id)).toEqual([
      'soon',
      'middle',
      'late',
    ]);
  });

  it('keeps events without a valid start date at the end without mutating the input', () => {
    const events = [
      { id: 'invalid', startAt: 'not-a-date' },
      { id: 'valid', startAt: local(2026, 11, 2) },
    ];

    expect(sortEventsByStartAt(events).map((event) => event.id)).toEqual(['valid', 'invalid']);
    expect(events[0]?.id).toBe('invalid');
  });
});

describe('sortEventsByStartAtDesc', () => {
  it('orders events from the most recent to the oldest start', () => {
    const events = [
      { id: 'old', startAt: local(2026, 1, 2) },
      { id: 'recent', startAt: local(2026, 10, 20) },
      { id: 'middle', startAt: local(2026, 6, 5) },
    ];

    expect(sortEventsByStartAtDesc(events).map((event) => event.id)).toEqual([
      'recent',
      'middle',
      'old',
    ]);
  });

  it('keeps events without a valid start date at the end without mutating the input', () => {
    const events = [
      { id: 'invalid', startAt: 'not-a-date' },
      { id: 'valid', startAt: local(2026, 6, 5) },
    ];

    expect(sortEventsByStartAtDesc(events).map((event) => event.id)).toEqual(['valid', 'invalid']);
    expect(events[0]?.id).toBe('invalid');
  });
});

describe('getEventDateParts', () => {
  it('splits the start date into the pieces shown on the date tile', () => {
    expect(getEventDateParts(local(2026, 11, 7, 9, 30))).toEqual({
      day: '7',
      month: 'NOV',
      weekday: 'SAM',
      time: '09:30',
      longDate: 'samedi 7 novembre',
    });
  });

  it('returns null for an unreadable date', () => {
    expect(getEventDateParts('')).toBeNull();
  });
});

describe('getCountdownLabel', () => {
  const now = new Date(2026, 9, 31, 18, 0);

  it.each([
    [local(2026, 10, 31, 20), "Aujourd'hui"],
    [local(2026, 11, 1, 8), 'Demain'],
    [local(2026, 11, 4), 'Dans 4 jours'],
    [local(2026, 11, 8), 'Dans 1 semaine'],
    [local(2026, 11, 21), 'Dans 3 semaines'],
    [local(2027, 1, 15), 'Dans 2 mois'],
  ])('labels an event starting on %s as "%s"', (startAt, expected) => {
    expect(getCountdownLabel(startAt, undefined, now)).toBe(expected);
  });

  it('says the event is happening now between its start and its end', () => {
    expect(getCountdownLabel(local(2026, 10, 31, 17), local(2026, 10, 31, 19), now)).toBe(
      'En ce moment',
    );
  });

  it('returns null for an unreadable date', () => {
    expect(getCountdownLabel('nope', undefined, now)).toBeNull();
  });
});
