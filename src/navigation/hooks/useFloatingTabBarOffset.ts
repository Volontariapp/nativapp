import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const TAB_BAR_HEIGHT = 64;
export const CENTER_BUTTON_OVERFLOW = 13;
export const DEFAULT_BOTTOM_SPACING = 16;
export const PREVUE_CARD_HEIGHT_ESTIMATE = 186;

export interface FloatingTabBarOffset {
  tabBarHeight: number;
  bottomInset: number;
  /**
   * Offset for cards/modals spanning the full screen width,
   * clearing both the tab bar and the protruding center (+) button.
   */
  cardBottomOffset: number;
  /**
   * Offset for side-floating buttons (like recenter or FAB) that sit
   * on the side of the screen above the tab bar.
   */
  sideButtonBottomOffset: number;
}

export function useFloatingTabBarOffset(): FloatingTabBarOffset {
  const insets = useSafeAreaInsets();

  if (Platform.OS !== 'ios') {
    return {
      tabBarHeight: 60,
      bottomInset: insets.bottom,
      cardBottomOffset: 24,
      sideButtonBottomOffset: 24,
    };
  }

  // LiquidTabBar uses Math.max(insets.bottom, 15) as its bottom position
  const bottomInset = Math.max(insets.bottom, 15);

  return {
    tabBarHeight: TAB_BAR_HEIGHT,
    bottomInset,
    // Spacing above the center "+" button (64 + 13 + 16 = 93 above tab bar bottom)
    cardBottomOffset:
      bottomInset + TAB_BAR_HEIGHT + CENTER_BUTTON_OVERFLOW + DEFAULT_BOTTOM_SPACING,
    // Spacing above the tab bar pill (64 + 16 = 80 above tab bar bottom)
    sideButtonBottomOffset: bottomInset + TAB_BAR_HEIGHT + DEFAULT_BOTTOM_SPACING,
  };
}
