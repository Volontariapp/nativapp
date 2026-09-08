import { makeMutable } from 'react-native-reanimated';
import { useAnimatedScrollHandler } from 'react-native-reanimated';

export const tabBarScale = makeMutable(1);
export const tabBarTranslateY = makeMutable(0);

interface ScrollContext extends Record<string, unknown> {
  prevY?: number;
}

/**
 * Hook à attacher au onScroll d'un Animated.ScrollView ou Animated.FlatList
 * pour faire "de-zoomer" et descendre la barre de navigation au scroll vers le bas.
 */
export function useScrollTabBar() {
  return useAnimatedScrollHandler<ScrollContext>({
    onBeginDrag: (event, ctx) => {
      ctx.prevY = event.contentOffset.y;
    },
    onScroll: (event, ctx) => {
      const prevY = ctx.prevY ?? 0;
      const currentY = event.contentOffset.y;
      const diff = currentY - prevY;

      if (currentY > 0) {
        if (diff > 5) {
          tabBarScale.value = 0.85;
          tabBarTranslateY.value = 30; // descend de 30px
        } else if (diff < -5) {
          tabBarScale.value = 1;
          tabBarTranslateY.value = 0;
        }
      } else if (currentY <= 0) {
        // En haut de la liste, on reset toujours
        tabBarScale.value = 1;
        tabBarTranslateY.value = 0;
      }

      ctx.prevY = currentY;
    },
  });
}
