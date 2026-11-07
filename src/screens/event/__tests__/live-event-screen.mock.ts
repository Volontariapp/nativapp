import type * as ReactNavigationNative from '@react-navigation/native';
import type { UseCurrentPositionResult } from '@/hooks/use-current-position';
import { LIVE_ORIGIN } from '@/api/event/__tests__/live-event.factory';

export const mockNavigate = jest.fn();
export const mockGoBack = jest.fn();

/** Module @react-navigation/native dont seul useNavigation est remplace. */
export const createNavigationModule = (): object => ({
  ...jest.requireActual<typeof ReactNavigationNative>('@react-navigation/native'),
  useNavigation: () => ({ navigate: mockNavigate, goBack: mockGoBack }),
});

export const createPositionState = (
  overrides?: Partial<UseCurrentPositionResult>,
): UseCurrentPositionResult => ({
  status: 'ready',
  coordinates: LIVE_ORIGIN,
  refresh: jest.fn().mockResolvedValue(LIVE_ORIGIN),
  ...overrides,
});
