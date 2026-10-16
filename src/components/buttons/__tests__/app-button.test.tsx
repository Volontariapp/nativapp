import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import { AppButton } from '../AppButton';

describe('AppButton loading state', () => {
  it('shows no spinner by default', () => {
    const { queryByTestId } = render(<AppButton text="Valider" onPress={jest.fn()} />);

    expect(queryByTestId('app-button-spinner')).toBeNull();
  });

  it('shows a spinner next to the text while loading', () => {
    const { getByTestId, getByText } = render(
      <AppButton text="Envoi en cours" onPress={jest.fn()} loading />,
    );

    expect(getByTestId('app-button-spinner')).toBeTruthy();
    expect(getByText('Envoi en cours')).toBeTruthy();
  });

  it('ignores presses while loading', () => {
    const onPress = jest.fn();
    const { getByText } = render(<AppButton text="Valider" onPress={onPress} loading />);

    fireEvent.press(getByText('Valider'));

    expect(onPress).not.toHaveBeenCalled();
  });

  it('still reacts to presses when it is not loading', () => {
    const onPress = jest.fn();
    const { getByText } = render(<AppButton text="Valider" onPress={onPress} />);

    fireEvent.press(getByText('Valider'));

    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
