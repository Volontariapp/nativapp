import React from 'react';
import { Dimensions } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.25;

interface SwipeableCardProps {
  children: React.ReactNode;
  onSwipe: (direction: 'left' | 'right') => void;
}

export default function SwipeableCard({
                                        children,
                                        onSwipe,
                                      }: SwipeableCardProps) {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  const gesture = Gesture.Pan()
    .onUpdate((event) => {
      translateX.value = event.translationX;
      translateY.value = event.translationY * 0.2;
    })
    .onEnd((event) => {
      const shouldSwipe =
        Math.abs(event.translationX) > SWIPE_THRESHOLD ||
        Math.abs(event.velocityX) > 800;

      if (shouldSwipe) {
        const direction = event.translationX > 0 ? 'right' : 'left';

        translateX.value = withTiming(
          direction === 'right'
            ? SCREEN_WIDTH * 1.5
            : -SCREEN_WIDTH * 1.5,
          { duration: 220 },
          () => {
            runOnJS(onSwipe)(direction);
          },
        );

        return;
      }

      translateX.value = withSpring(0);
      translateY.value = withSpring(0);
    });

  const animatedStyle = useAnimatedStyle(() => {
    const rotate = interpolate(
      translateX.value,
      [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
      [-6, 0, 6],
    );

    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { rotate: `${String(rotate)}deg` },
      ],
    };
  });

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View style={animatedStyle}>
        {children}
      </Animated.View>
    </GestureDetector>
  );
}
