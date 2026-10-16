import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import { SettingsScreen } from '../SettingsScreen';

const mockNavigate = jest.fn();
let mockIsDebugMode = false;

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: mockNavigate, goBack: jest.fn() }),
}));
jest.mock('@/context/DebugContext', () => ({
  useDebug: () => ({ isDebugMode: mockIsDebugMode, toggleDebugMode: jest.fn() }),
}));
jest.mock('@/api/user/hooks/use-delete-account', () => ({
  useDeleteAccount: () => ({ mutate: jest.fn(), isPending: false }),
}));
jest.mock('@/services/token.service', () => ({ TokenService: { deleteAccessToken: jest.fn() } }));

describe('SettingsScreen storage debug entry', () => {
  afterEach(() => {
    mockIsDebugMode = false;
    jest.clearAllMocks();
  });

  it('hides the storage test outside of debug mode', () => {
    const { queryByText } = render(<SettingsScreen />);

    expect(queryByText('Test du stockage')).toBeNull();
  });

  it('opens the storage test screen from the settings in debug mode', () => {
    mockIsDebugMode = true;
    const { getByText } = render(<SettingsScreen />);

    fireEvent.press(getByText('Test du stockage'));

    expect(mockNavigate).toHaveBeenCalledWith('StorageDebug');
  });
});
