import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import { ProfileEventsCarouselNav } from '../profile-events-carousel-nav';

const mockOnPrevious = jest.fn();
const mockOnNext = jest.fn();

const renderNav = (index: number, total: number) =>
  render(
    <ProfileEventsCarouselNav
      index={index}
      total={total}
      onPrevious={mockOnPrevious}
      onNext={mockOnNext}
    />,
  );

describe('ProfileEventsCarouselNav', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it('renders nothing when there is nothing to browse', () => {
    const { toJSON } = renderNav(0, 1);

    expect(toJSON()).toBeNull();
  });

  it('only offers the next arrow on the first item', () => {
    const { getByLabelText, queryByLabelText, getByText } = renderNav(0, 4);

    expect(getByLabelText('Évènement suivant')).toBeTruthy();
    expect(queryByLabelText('Évènement précédent')).toBeNull();
    expect(getByText('1 / 4')).toBeTruthy();
  });

  it('only offers the previous arrow on the last item', () => {
    const { getByLabelText, queryByLabelText } = renderNav(3, 4);

    expect(getByLabelText('Évènement précédent')).toBeTruthy();
    expect(queryByLabelText('Évènement suivant')).toBeNull();
  });

  it('forwards the presses', () => {
    const { getByLabelText } = renderNav(1, 3);

    fireEvent.press(getByLabelText('Évènement précédent'));
    fireEvent.press(getByLabelText('Évènement suivant'));

    expect(mockOnPrevious).toHaveBeenCalledTimes(1);
    expect(mockOnNext).toHaveBeenCalledTimes(1);
  });
});
