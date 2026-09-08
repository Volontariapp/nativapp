import React, { useEffect } from 'react';
import { View, StyleSheet, Pressable, Dimensions } from 'react-native';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  interpolate,
  Extrapolation,
  type SharedValue,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { theme } from '@/shared/themes/theme';
import { tabBarScale, tabBarTranslateY } from '../hooks/useScrollTabBar';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const TAB_BAR_MARGIN = 30;
const TAB_BAR_WIDTH = SCREEN_WIDTH - TAB_BAR_MARGIN * 2;
const TAB_BAR_HEIGHT = 64; // Réduit de 70 à 64
const INDICATOR_SIZE = 54; // Réduit de 60 à 54

export function LiquidTabBar({
  state,
  descriptors,
  navigation,
}: BottomTabBarProps): React.JSX.Element {
  const insets = useSafeAreaInsets();
  const activeIndex = useSharedValue(state.index);

  useEffect(() => {
    activeIndex.value = withSpring(state.index, {
      damping: 16,
      stiffness: 120,
      mass: 0.8,
    });
  }, [state.index, activeIndex]);

  const tabWidth = TAB_BAR_WIDTH / state.routes.length;

  const indicatorStyle = useAnimatedStyle(() => {
    // On cache l'indicateur (opacité 0) quand on est sur le bouton "+" (index 2)
    const opacity = interpolate(activeIndex.value, [1.5, 2, 2.5], [1, 0, 1], Extrapolation.CLAMP);

    const translateX = activeIndex.value * tabWidth + tabWidth / 2 - INDICATOR_SIZE / 2;

    return {
      opacity,
      width: INDICATOR_SIZE,
      height: INDICATOR_SIZE,
      borderRadius: INDICATOR_SIZE / 2,
      transform: [{ translateX }],
    };
  });

  const containerAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: withTiming(tabBarScale.value, { duration: 350 }) },
        { translateY: withTiming(tabBarTranslateY.value, { duration: 350 }) },
      ],
    };
  });

  return (
    <Animated.View
      style={[styles.container, { bottom: Math.max(insets.bottom, 15) }, containerAnimatedStyle]}
    >
      {/* Background Pill */}
      <BlurView intensity={80} tint="light" style={styles.backgroundPill} />

      {/* Animated Liquid Indicator */}
      <Animated.View style={[styles.indicator, indicatorStyle]}>
        <View style={styles.indicatorInner} />
      </Animated.View>

      {/* Tab Buttons */}
      <View style={styles.tabsContainer}>
        {state.routes.map((route, index) => {
          const descriptor = descriptors[route.key];
          if (!descriptor) return null;
          const { options } = descriptor;
          const isFocused = state.index === index;

          const onPress = () => {
            // Reset tab bar scale and translation when switching tabs
            tabBarScale.value = 1;
            tabBarTranslateY.value = 0;

            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          return (
            <Pressable
              key={route.key}
              onPress={onPress}
              style={styles.tabButton}
              android_ripple={{ borderless: true, radius: 25 }}
            >
              {options.tabBarButton ? (
                options.tabBarButton({ onPress, children: null })
              ) : options.tabBarIcon ? (
                <IconWrapper isFocused={isFocused} activeIndex={activeIndex} index={index}>
                  {options.tabBarIcon({
                    focused: isFocused,
                    color: isFocused ? theme.colors.white : theme.colors.grey,
                    size: 26,
                  })}
                </IconWrapper>
              ) : null}
            </Pressable>
          );
        })}
      </View>
    </Animated.View>
  );
}

function IconWrapper({
  children,
  activeIndex,
  index,
}: {
  children: React.ReactNode;
  isFocused: boolean;
  activeIndex: SharedValue<number>;
  index: number;
}): React.JSX.Element {
  const animatedStyle = useAnimatedStyle(() => {
    const scale = interpolate(
      activeIndex.value,
      [index - 1, index, index + 1],
      [0.85, 1.15, 0.85],
      Extrapolation.CLAMP,
    );
    const translateY = interpolate(
      activeIndex.value,
      [index - 1, index, index + 1],
      [0, -5, 0],
      Extrapolation.CLAMP,
    );

    return {
      transform: [{ scale }, { translateY }],
    };
  });

  return <Animated.View style={animatedStyle}>{children}</Animated.View>;
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    alignSelf: 'center',
    width: TAB_BAR_WIDTH,
    height: TAB_BAR_HEIGHT,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    zIndex: 100,
  },
  backgroundPill: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: TAB_BAR_HEIGHT / 2,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)', // Subtle glass edge
    overflow: 'hidden',
  },
  tabsContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  tabButton: {
    flex: 1,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  indicator: {
    position: 'absolute',
    top: (TAB_BAR_HEIGHT - INDICATOR_SIZE) / 2,
    left: 0,
    width: INDICATOR_SIZE,
    height: INDICATOR_SIZE,
    borderRadius: INDICATOR_SIZE / 2,
    backgroundColor: 'rgba(255, 255, 255, 0.15)', // Glassy overlay
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
    // Glowing border from the image
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    shadowColor: '#5BC0F8', // subtle blue/white glow
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
  },
  indicatorInner: {
    width: '100%',
    height: '100%',
    borderRadius: 999, // Force un rond parfait peu importe la taille parente
    backgroundColor: 'transparent',
  },
});
