import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import { SettingsScreen } from '../SettingsScreen';

const mockClearCache = jest.fn();

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: jest.fn(), goBack: jest.fn() }),
}));
jest.mock('@/context/AuthContext', () => ({ useAuth: () => ({ logout: jest.fn() }) }));
jest.mock('@/context/DebugContext', () => ({
  useDebug: () => ({ isDebugMode: false, toggleDebugMode: jest.fn() }),
}));
jest.mock('@/api/user/hooks/use-delete-account', () => ({
  useDeleteAccount: () => ({ mutate: jest.fn(), isPending: false }),
}));
jest.mock('@/services/token.service', () => ({ TokenService: { deleteAccessToken: jest.fn() } }));
jest.mock('@/hooks/use-clear-cache', () => ({
  useClearCache: () => ({ isClearing: false, clearCache: mockClearCache }),
}));

describe('SettingsScreen clear cache entry', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('clears the cache when pressing the button', () => {
    const { getByText } = render(<SettingsScreen />);

    fireEvent.press(getByText('Vider le cache'));

    expect(mockClearCache).toHaveBeenCalledTimes(1);
  });
});
