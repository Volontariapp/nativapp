import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import type * as ReactNavigationNative from '@react-navigation/native';
import AppHeader from '../AppHeader';
import { mockNavigate, mockUseSocket } from './app-header.mock';

jest.mock('@react-navigation/native', () => {
  const actual = jest.requireActual<typeof ReactNavigationNative>('@react-navigation/native');
  return {
    ...actual,
    useNavigation: () => ({ navigate: mockNavigate, goBack: jest.fn() }),
  };
});

jest.mock('@/context/SocketContext', () => ({
  useSocket: (): unknown => mockUseSocket(),
}));

describe('AppHeader', () => {
  beforeEach(() => {
    mockUseSocket.mockReturnValue({ isConnected: true });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('does not render the wishlist shortcut by default', () => {
    const { queryByLabelText } = render(<AppHeader showSettings />);

    expect(queryByLabelText('Ouvrir ma wishlist')).toBeNull();
  });

  it('renders an accessible wishlist button when showWishlist is set', () => {
    const { getByLabelText } = render(<AppHeader showWishlist />);

    expect(getByLabelText('Ouvrir ma wishlist').props.accessibilityRole).toBe('button');
  });

  it('opens the wishlist tab of the manage hub when pressed', () => {
    const { getByLabelText } = render(<AppHeader showSettings showWishlist />);

    fireEvent.press(getByLabelText('Ouvrir ma wishlist'));

    expect(mockNavigate).toHaveBeenCalledWith('MainTabs', {
      screen: 'create',
      params: { screen: 'ManageHub', params: { initialTab: 'wished' } },
    });
  });
});
