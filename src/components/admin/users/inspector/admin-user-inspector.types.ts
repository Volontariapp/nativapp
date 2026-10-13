import type { UserWeb } from '@volontariapp/contracts';

export interface AdminUserInspectorModalProps {
  visible: boolean;
  user: UserWeb | null;
  onClose: () => void;
}

export type PickerAction = 'wishes' | 'participations' | 'follows' | 'blocks' | 'badges';
export type PickerMode = 'users' | 'events' | 'badges';

export interface PickerConfig {
  mode: PickerMode;
  action: PickerAction;
}

