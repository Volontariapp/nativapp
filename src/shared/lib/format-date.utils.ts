export interface ProtobufLong {
  low: number;
  high?: number;
  unsigned?: boolean;
}

export interface TimestampObject {
  seconds?: number | string | ProtobufLong;
  _seconds?: number | string;
  toDate?: () => Date;
}

export type TimestampLike = Date | string | number | TimestampObject | null | undefined;

export const formatDate = (
  timestamp?: TimestampLike,
  options?: Intl.DateTimeFormatOptions,
): string => {
  if (timestamp === null || timestamp === undefined) return 'Non définie';

  let date: Date;
  if (timestamp instanceof Date) {
    date = timestamp;
  } else if (typeof timestamp === 'string' || typeof timestamp === 'number') {
    date = new Date(timestamp);
  } else if (typeof timestamp === 'object') {
    const ts = timestamp;

    if (typeof ts.toDate === 'function') {
      date = ts.toDate();
    } else if (ts.seconds !== undefined) {
      let secs = 0;
      if (typeof ts.seconds === 'number') {
        secs = ts.seconds;
      } else if (typeof ts.seconds === 'string') {
        secs = parseInt(ts.seconds, 10);
      } else if (typeof ts.seconds === 'object' && 'low' in ts.seconds) {
        secs = ts.seconds.low;
      }
      date = new Date(secs * 1000);
    } else if (ts._seconds !== undefined) {
      date = new Date(Number(ts._seconds) * 1000);
    } else {
      date = new Date(ts as unknown as string);
    }
  } else {
    return 'Invalide';
  }

  if (isNaN(date.getTime())) return 'Invalide';

  return date.toLocaleDateString(
    'fr-FR',
    options ?? {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    },
  );
};
