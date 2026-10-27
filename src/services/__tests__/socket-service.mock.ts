type Listener = () => void;

export interface FakeManagerOptions {
  query?: Record<string, string>;
  extraHeaders?: Record<string, string>;
}

export interface FakeManagerSocket {
  id: string;
  connected: boolean;
  io: { opts: FakeManagerOptions };
  on: jest.Mock;
  disconnect: jest.Mock;
  emitLocal: (event: string) => void;
}

/** Faux socket socket.io : memorise les ecouteurs et expose les options du manager. */
export const createFakeManagerSocket = (opts: FakeManagerOptions = {}): FakeManagerSocket => {
  const listeners = new Map<string, Listener[]>();
  return {
    id: 'fake-socket',
    connected: false,
    io: { opts },
    on: jest.fn((event: string, handler: Listener) => {
      listeners.set(event, [...(listeners.get(event) ?? []), handler]);
    }),
    disconnect: jest.fn(),
    emitLocal: (event: string): void => {
      listeners.get(event)?.forEach((handler) => {
        handler();
      });
    },
  };
};

export const mockIo = jest.fn();
export const mockRefreshAccessToken = jest.fn();
export const mockGetAccessToken = jest.fn();
