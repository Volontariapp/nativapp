import type { BUTTON_VARIANTS, ICONS_BUTTON_VARIANTS } from '@/shared/themes/buttonVariants';

export type IconLibrary =
  | 'Feather'
  | 'FontAwesome'
  | 'FontAwesome5'
  | 'MaterialDesignIcons'
  | 'Ionicons';
export type AppTextVariant = 'title' | 'subtitle' | 'body' | 'caption' | 'bigTitle';
export type FontType = 'primary' | 'secondary';

export type ButtonVariant = keyof typeof BUTTON_VARIANTS;
export type IconButtonVariant = keyof typeof ICONS_BUTTON_VARIANTS;
