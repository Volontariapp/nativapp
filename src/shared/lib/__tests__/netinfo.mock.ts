import type { NetInfoState } from '@react-native-community/netinfo';

type NetInfoListener = (state: NetInfoState) => void;

export const mockNetInfoUnsubscribe = jest.fn();
export const mockNetInfoAddEventListener = jest.fn((listener: NetInfoListener) => {
  mockNetInfoListeners.push(listener);
  return mockNetInfoUnsubscribe;
});
export const mockNetInfoListeners: NetInfoListener[] = [];

export const emitNetInfoState = (state: Partial<NetInfoState>): void => {
  mockNetInfoListeners.forEach((listener) => {
    listener(state as NetInfoState);
  });
};

export const resetNetInfoMock = (): void => {
  mockNetInfoListeners.length = 0;
  mockNetInfoAddEventListener.mockClear();
  mockNetInfoUnsubscribe.mockClear();
};

jest.mock(
  '@react-native-community/netinfo',
  () => ({
    __esModule: true,
    default: { addEventListener: mockNetInfoAddEventListener },
  }),
  { virtual: true },
);
