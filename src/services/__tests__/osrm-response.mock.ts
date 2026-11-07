export interface MockOsrmTableResponse {
  code: string;
  durations: (number | null)[][];
}

export interface MockOsrmRouteResponse {
  code: string;
  routes: Array<{
    distance: number;
    duration: number;
    geometry: {
      type: string;
      coordinates: [number, number][];
    };
  }>;
}

export interface MockOsrmErrorResponse {
  code: string;
  message?: string;
}

export const createMockOsrmTableResponse = (
  durations: (number | null)[][],
): MockOsrmTableResponse => ({
  code: 'Ok',
  durations,
});

export const createMockOsrmRouteResponse = (
  distance: number,
  duration: number,
  coordinates: [number, number][],
): MockOsrmRouteResponse => ({
  code: 'Ok',
  routes: [
    {
      distance,
      duration,
      geometry: {
        type: 'LineString',
        coordinates,
      },
    },
  ],
});

export const createMockOsrmErrorResponse = (
  code = 'InvalidQuery',
  message = 'Invalid query',
): MockOsrmErrorResponse => ({
  code,
  message,
});
