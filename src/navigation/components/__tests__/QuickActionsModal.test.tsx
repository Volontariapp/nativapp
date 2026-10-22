import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import { QuickActionsModal } from '../QuickActionsModal';

describe('QuickActionsModal', () => {
  const defaultProps = {
    visible: true,
    onClose: jest.fn(),
    onSelectCreate: jest.fn(),
    onSelectManage: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders nothing visible when visible is false', () => {
    const { queryByText } = render(<QuickActionsModal {...defaultProps} visible={false} />);

    expect(queryByText('ACTIONS RAPIDES')).toBeNull();
    expect(queryByText('Créer')).toBeNull();
    expect(queryByText('Gérer')).toBeNull();
  });

  it('renders title, actions, and descriptions when visible is true', () => {
    const { getByText, getByLabelText } = render(<QuickActionsModal {...defaultProps} />);

    expect(getByText('ACTIONS RAPIDES')).toBeTruthy();
    expect(getByText('Que souhaitez-vous faire ?')).toBeTruthy();
    expect(getByText('Créer')).toBeTruthy();
    expect(getByText('Organiser un événement ou publier un post')).toBeTruthy();
    expect(getByText('Gérer')).toBeTruthy();
    expect(getByText('Mes événements, participations et publications')).toBeTruthy();
    expect(getByLabelText("Fermer le menu d'actions")).toBeTruthy();
    expect(getByLabelText('Fermer le menu')).toBeTruthy();
  });

  it('triggers onSelectCreate when pressing the Créer action', () => {
    const onSelectCreate = jest.fn();
    const { getByLabelText } = render(
      <QuickActionsModal {...defaultProps} onSelectCreate={onSelectCreate} />,
    );

    fireEvent.press(getByLabelText('Créer un événement ou un post'));
    expect(onSelectCreate).toHaveBeenCalledTimes(1);
  });

  it('triggers onSelectManage when pressing the Gérer action', () => {
    const onSelectManage = jest.fn();
    const { getByLabelText } = render(
      <QuickActionsModal {...defaultProps} onSelectManage={onSelectManage} />,
    );

    fireEvent.press(getByLabelText('Gérer mes événements et posts'));
    expect(onSelectManage).toHaveBeenCalledTimes(1);
  });

  it('triggers onClose when pressing the close icon', () => {
    const onClose = jest.fn();
    const { getByLabelText } = render(<QuickActionsModal {...defaultProps} onClose={onClose} />);

    fireEvent.press(getByLabelText('Fermer'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('triggers onClose when pressing the backdrop', () => {
    const onClose = jest.fn();
    const { getByLabelText } = render(<QuickActionsModal {...defaultProps} onClose={onClose} />);

    fireEvent.press(getByLabelText("Fermer le menu d'actions"));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('triggers onClose when pressing the bottom chevron trigger button', () => {
    const onClose = jest.fn();
    const { getByLabelText } = render(<QuickActionsModal {...defaultProps} onClose={onClose} />);

    fireEvent.press(getByLabelText('Fermer le menu'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
