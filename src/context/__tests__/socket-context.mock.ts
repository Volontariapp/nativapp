type Listener = () => void;

export interface FakeSocket {
  connected: boolean;
  on: jest.Mock;
  off: jest.Mock;
  emitLocal: (event: string) => void;
}

/** Faux socket qui memorise les ecouteurs et permet de simuler les evenements. */
export const createFakeSocket = (): FakeSocket => {
  const listeners = new Map<string, Listener>();
  return {
    connected: false,
    on: jest.fn((event: string, handler: Listener) => {
      listeners.set(event, handler);
    }),
    off: jest.fn(),
    emitLocal: (event: string): void => {
      listeners.get(event)?.();
    },
  };
};

export const mockSocketServiceConnect = jest.fn();
export const mockSocketServiceDisconnect = jest.fn();
export const mockGetAccessToken = jest.fn();
export const mockUseAuth = jest.fn();
