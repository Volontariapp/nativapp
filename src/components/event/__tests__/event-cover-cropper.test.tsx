import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { createPickedImage } from '@/api/storage/__tests__/picked-image.factory';
import * as mockSafeArea from '@/components/post/__tests__/safe-area.mock';
import * as mockGesture from './gesture-handler.mock';
import * as mockDeps from './event-cover-cropper.mock';
import { EventCoverCropper } from '../event-cover-cropper';

jest.mock('expo-image', () => ({ Image: 'Image' }));
jest.mock('expo-linear-gradient', () => ({ LinearGradient: 'LinearGradient' }));
jest.mock('react-native-safe-area-context', () => mockSafeArea);
jest.mock('react-native-gesture-handler', () => mockGesture);
jest.mock('@/api/storage/crop-image', () => ({
  cropImage: (...args: unknown[]) => mockDeps.cropImage(...args) as unknown,
}));

const mockOnSettle = jest.fn();
const IMAGE = createPickedImage({ uri: 'file:///gallery/IMG_0001.jpg', width: 4000, height: 3000 });
const CROPPED = createPickedImage({ uri: 'file:///cache/cropped.jpg', width: 3000, height: 3000 });

describe('EventCoverCropper', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it('shows the editor, its formats and the previews for the photo', () => {
    const { getByText, getByLabelText, getByTestId } = render(
      <EventCoverCropper image={IMAGE} onSettle={mockOnSettle} />,
    );

    expect(getByText('Cadrer la photo')).toBeTruthy();
    expect(getByLabelText('Format Carré')).toBeTruthy();
    expect(getByTestId('event-cover-cropper-viewport')).toBeTruthy();
    expect(getByTestId('event-image-preview-swipe')).toBeTruthy();
  });

  it('crops the centered square by default and hands the result back', async () => {
    mockDeps.cropImage.mockResolvedValue(CROPPED);
    const { getByText } = render(<EventCoverCropper image={IMAGE} onSettle={mockOnSettle} />);

    fireEvent.press(getByText('Valider'));

    await waitFor(() => {
      expect(mockOnSettle).toHaveBeenCalledWith(CROPPED);
    });
    expect(mockDeps.cropImage).toHaveBeenCalledWith(IMAGE, {
      originX: 500,
      originY: 0,
      width: 3000,
      height: 3000,
    });
  });

  it('crops a portrait region once the portrait format is chosen', async () => {
    mockDeps.cropImage.mockResolvedValue(CROPPED);
    const { getByText, getByLabelText } = render(
      <EventCoverCropper image={IMAGE} onSettle={mockOnSettle} />,
    );

    fireEvent.press(getByLabelText('Format Portrait'));
    fireEvent.press(getByText('Valider'));

    await waitFor(() => {
      expect(mockOnSettle).toHaveBeenCalledTimes(1);
    });
    expect(mockDeps.cropImage).toHaveBeenCalledWith(IMAGE, {
      originX: 875,
      originY: 0,
      width: 2250,
      height: 3000,
    });
  });

  it('settles with undefined when the user cancels, without cropping', () => {
    const { getByText } = render(<EventCoverCropper image={IMAGE} onSettle={mockOnSettle} />);

    fireEvent.press(getByText('Annuler'));

    expect(mockOnSettle).toHaveBeenCalledWith(undefined);
    expect(mockDeps.cropImage).not.toHaveBeenCalled();
  });

  it('stays open and re-enables the buttons when the crop fails', async () => {
    mockDeps.cropImage.mockRejectedValue(new Error('boom'));
    const { getByText } = render(<EventCoverCropper image={IMAGE} onSettle={mockOnSettle} />);

    fireEvent.press(getByText('Valider'));

    await waitFor(() => {
      expect(getByText('Valider')).toBeTruthy();
    });
    expect(mockOnSettle).not.toHaveBeenCalled();
  });
});
