import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import { LogoutCard } from '../components/logout-card';

const mockLogout = jest.fn();

jest.mock('@/context/AuthContext', () => ({
  useAuth: (): unknown => ({ logout: mockLogout }),
}));

describe('LogoutCard', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('logs the user out when pressed', () => {
    const { getByLabelText } = render(<LogoutCard />);

    fireEvent.press(getByLabelText('Se déconnecter'));

    expect(mockLogout).toHaveBeenCalledTimes(1);
  });

  it('explains what the button does', () => {
    const { getByText } = render(<LogoutCard />);

    expect(getByText('Se déconnecter')).toBeTruthy();
    expect(getByText('Quitter ta session sur cet appareil')).toBeTruthy();
  });
});
