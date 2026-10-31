import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import { ProfileManageEventsCta } from '../profile-manage-events-cta';

describe('ProfileManageEventsCta', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('explains what the management page contains', () => {
    const { getByText } = render(<ProfileManageEventsCta onPress={jest.fn()} />);

    expect(getByText('Gérer mes évènements')).toBeTruthy();
    expect(getByText('Participations, wishlist et évènements créés')).toBeTruthy();
  });

  it('is exposed as a button', () => {
    const { getByRole } = render(<ProfileManageEventsCta onPress={jest.fn()} />);

    expect(getByRole('button', { name: 'Gérer mes évènements' })).toBeTruthy();
  });

  it('calls onPress when pressed', () => {
    const onPress = jest.fn();
    const { getByRole } = render(<ProfileManageEventsCta onPress={onPress} />);

    fireEvent.press(getByRole('button', { name: 'Gérer mes évènements' }));

    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
