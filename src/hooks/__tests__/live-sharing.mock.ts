import { AppState, type AppStateStatus } from 'react-native';
import type * as Location from 'expo-location';
import type { Socket } from 'socket.io-client';
import { createMockLocationObject } from './expo-location.mock';

type Listener = (payload: never) => void;

export interface FakeSocket {
  socket: Socket;
  emit: jest.Mock;
  on: jest.Mock;
  off: jest.Mock;
  /** Declenche les handlers enregistres pour `event`. */
  trigger: (event: string, payload: object) => void;
  listenerCount: (event: string) => number;
}

/** Socket minimal : seuls on, off et emit servent au partage. */
export const createFakeSocket = (): FakeSocket => {
  const listeners = new Map<string, Set<Listener>>();
  const on = jest.fn((event: string, handler: Listener) => {
    const set = listeners.get(event) ?? new Set<Listener>();
    set.add(handler);
    listeners.set(event, set);
  });
  const off = jest.fn((event: string, handler: Listener) => {
    listeners.get(event)?.delete(handler);
  });
  const emit = jest.fn();
  const socket = Object.assign(Object.create(null) as Socket, { on, off, emit });
  return {
    socket,
    emit,
    on,
    off,
    trigger: (event, payload) => {
      listeners.get(event)?.forEach((handler) => {
        handler(payload as never);
      });
    },
    listenerCount: (event) => listeners.get(event)?.size ?? 0,
  };
};

export interface FakeWatch {
  subscription: Location.LocationSubscription;
  remove: jest.Mock;
  /** Simule une lecture GPS. */
  pushPosition: (latitude: number, longitude: number) => void;
  /** Simule l'echec du suivi (permission retiree). */
  fail: () => void;
}

export interface WatchRegistry {
  current: FakeWatch | null;
}

/** Implementation de watchPositionAsync qui memorise callback et errorHandler. */
export const createWatchImplementation = (registry: WatchRegistry) =>
  (
    _options: Location.LocationOptions,
    callback: Location.LocationCallback,
    errorHandler?: Location.LocationErrorCallback,
  ): Promise<Location.LocationSubscription> => {
    const remove = jest.fn();
    const subscription: Location.LocationSubscription = { remove };
    registry.current = {
      subscription,
      remove,
      pushPosition: (latitude, longitude) => {
        callback(createMockLocationObject(latitude, longitude));
      },
      fail: () => {
        errorHandler?.('permission');
      },
    };
    return Promise.resolve(subscription);
  };

export interface FakeAppState {
  setState: (state: AppStateStatus) => void;
  remove: jest.Mock;
}

/** Remplace AppState.addEventListener : restauree par jest.restoreAllMocks(). */
export const spyOnAppState = (): FakeAppState => {
  const handlers: ((state: AppStateStatus) => void)[] = [];
  const remove = jest.fn();
  jest.spyOn(AppState, 'addEventListener').mockImplementation((_type, handler) => {
    handlers.push(handler);
    return { remove };
  });
  return {
    remove,
    setState: (state) => {
      handlers.forEach((handler) => {
        handler(state);
      });
    },
  };
};
