import { act } from 'react';
import { renderHook } from '@testing-library/react-native';
import * as Location from 'expo-location';
import { useCurrentPosition } from '../use-current-position';
import { createMockLocationObject, createMockPermissionResponse } from './expo-location.mock';

jest.mock('expo-location', () => ({
  PermissionStatus: { GRANTED: 'granted', DENIED: 'denied', UNDETERMINED: 'undetermined' },
  requestForegroundPermissionsAsync: jest.fn(),
  getCurrentPositionAsync: jest.fn(),
}));

const requestPermission = jest.mocked(Location.requestForegroundPermissionsAsync);
const getPosition = jest.mocked(Location.getCurrentPositionAsync);

describe('useCurrentPosition', () => {
  afterEach(() => {
    jest.restoreAllMocks();
    requestPermission.mockReset();
    getPosition.mockReset();
  });

  it('ne demande rien au montage', () => {
    const { result } = renderHook(() => useCurrentPosition());

    expect(result.current.status).toBe('idle');
    expect(result.current.coordinates).toBeNull();
    expect(requestPermission).not.toHaveBeenCalled();
  });

  it('passe en permission_denied sans lire la position', async () => {
    requestPermission.mockResolvedValue(createMockPermissionResponse(false));
    const { result } = renderHook(() => useCurrentPosition());

    let returned: unknown;
    await act(async () => {
      returned = await result.current.refresh();
    });

    expect(returned).toBeNull();
    expect(result.current.status).toBe('permission_denied');
    expect(getPosition).not.toHaveBeenCalled();
  });

  it('renvoie les coordonnees et passe en ready', async () => {
    requestPermission.mockResolvedValue(createMockPermissionResponse(true));
    getPosition.mockResolvedValue(createMockLocationObject(48.8566, 2.3522));
    const { result } = renderHook(() => useCurrentPosition());

    await act(async () => {
      await result.current.refresh();
    });

    expect(result.current.status).toBe('ready');
    expect(result.current.coordinates).toEqual({ latitude: 48.8566, longitude: 2.3522 });
  });

  it('passe en error si la lecture echoue', async () => {
    requestPermission.mockResolvedValue(createMockPermissionResponse(true));
    getPosition.mockRejectedValue(new Error('gps'));
    const { result } = renderHook(() => useCurrentPosition());

    await act(async () => {
      await result.current.refresh();
    });

    expect(result.current.status).toBe('error');
    expect(result.current.coordinates).toBeNull();
  });

  it('ne met pas a jour l etat apres le demontage', async () => {
    let resolvePosition: (value: Location.LocationObject) => void = () => undefined;
    requestPermission.mockResolvedValue(createMockPermissionResponse(true));
    getPosition.mockImplementation(
      async () =>
        new Promise<Location.LocationObject>((resolve) => {
          resolvePosition = resolve;
        }),
    );
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);
    const { result, unmount } = renderHook(() => useCurrentPosition());

    let pending: Promise<unknown> = Promise.resolve();
    await act(async () => {
      pending = result.current.refresh();
      await Promise.resolve();
    });
    unmount();
    resolvePosition(createMockLocationObject(1, 2));
    const returned = await pending;

    expect(returned).toBeNull();
    expect(errorSpy).not.toHaveBeenCalled();
  });
});
