import { AppState } from 'react-native';
import { focusManager, onlineManager } from '@tanstack/react-query';
import {
  emitNetInfoState,
  mockNetInfoAddEventListener,
  mockNetInfoUnsubscribe,
  resetNetInfoMock,
} from './netinfo.mock';
import {
  isNetworkOnline,
  setupFocusManager,
  setupOnlineManager,
  setupQueryManagers,
} from '../setup-query-managers';

describe('setup-query-managers', () => {
  afterEach(() => {
    jest.restoreAllMocks();
    resetNetInfoMock();
  });

  it('isNetworkOnline traite null comme inconnu', () => {
    expect(isNetworkOnline({ isConnected: true, isInternetReachable: null } as never)).toBe(true);
    expect(isNetworkOnline({ isConnected: true, isInternetReachable: false } as never)).toBe(false);
    expect(isNetworkOnline({ isConnected: false, isInternetReachable: null } as never)).toBe(false);
  });

  it('synchronise focusManager avec AppState et nettoie', () => {
    const remove = jest.fn();
    let handler: (status: string) => void = () => undefined;
    jest.spyOn(AppState, 'addEventListener').mockImplementation((_type, listener) => {
      handler = listener as (status: string) => void;
      return { remove };
    });
    const setFocused = jest.spyOn(focusManager, 'setFocused').mockImplementation(() => undefined);

    const cleanup = setupFocusManager();
    handler('active');
    handler('background');

    expect(setFocused).toHaveBeenNthCalledWith(1, true);
    expect(setFocused).toHaveBeenNthCalledWith(2, false);
    cleanup();
    expect(remove).toHaveBeenCalledTimes(1);
  });

  it('synchronise onlineManager avec netinfo et nettoie', () => {
    const setOnline = jest.spyOn(onlineManager, 'setOnline').mockImplementation(() => undefined);

    const cleanup = setupOnlineManager();
    expect(mockNetInfoAddEventListener).toHaveBeenCalledTimes(1);
    emitNetInfoState({ isConnected: false, isInternetReachable: false });
    emitNetInfoState({ isConnected: true, isInternetReachable: true });

    expect(setOnline).toHaveBeenNthCalledWith(1, false);
    expect(setOnline).toHaveBeenNthCalledWith(2, true);
    cleanup();
    expect(mockNetInfoUnsubscribe).toHaveBeenCalledTimes(1);
  });

  it('setupQueryManagers nettoie les deux abonnements', () => {
    const remove = jest.fn();
    jest.spyOn(AppState, 'addEventListener').mockReturnValue({ remove });

    const cleanup = setupQueryManagers();
    cleanup();

    expect(remove).toHaveBeenCalledTimes(1);
    expect(mockNetInfoUnsubscribe).toHaveBeenCalledTimes(1);
  });
});
