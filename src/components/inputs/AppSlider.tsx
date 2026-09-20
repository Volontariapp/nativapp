import React, { useRef, useCallback, useMemo, useEffect } from 'react';
import type {
  DimensionValue,
  StyleProp,
  ViewStyle,
  LayoutChangeEvent,
} from 'react-native';
import { View, StyleSheet, PanResponder } from 'react-native';
import { useAppTheme, useStyles } from '@/context/ThemeContext';
import type { AppTheme } from '@/shared/themes/theme';

export interface AppSliderProps {
  value: number;
  onValueChange: (value: number) => void;
  minimumValue?: number;
  maximumValue?: number;
  step?: number;
  disabled?: boolean;
  color?: string;
  trackHeight?: number;
  thumbSize?: number;
  style?: StyleProp<ViewStyle>;
}

export function AppSlider({
  value,
  onValueChange,
  minimumValue = 1,
  maximumValue = 50,
  step = 1,
  disabled = false,
  color,
  trackHeight = 6,
  thumbSize = 24,
  style,
}: AppSliderProps): React.JSX.Element {
  const { theme } = useAppTheme();
  const styles = useStyles(createStyles);
  const trackWidthRef = useRef<number>(0);
  const trackXRef = useRef<number>(0);
  const sliderViewRef = useRef<View>(null);

  const activeColor = color ?? theme.colors.primaryEco;

  const clamp = useCallback(
    (val: number, min: number, max: number) => Math.min(Math.max(val, min), max),
    [],
  );

  // Keep fresh references to avoid recreating PanResponder on every render
  const latestPropsRef = useRef({
    value,
    minimumValue,
    maximumValue,
    step,
    disabled,
    onValueChange,
  });

  useEffect(() => {
    latestPropsRef.current = {
      value,
      minimumValue,
      maximumValue,
      step,
      disabled,
      onValueChange,
    };
  });

  const calculateValueFromPosition = useCallback(
    (pageX: number): number => {
      const {
        value: currentVal,
        minimumValue: min,
        maximumValue: max,
        step: currentStep,
      } = latestPropsRef.current;
      if (trackWidthRef.current <= 0) return currentVal;
      const localX = pageX - trackXRef.current;
      const ratio = clamp(localX / trackWidthRef.current, 0, 1);
      const rawVal = min + ratio * (max - min);
      const stepped = Math.round(rawVal / currentStep) * currentStep;
      return clamp(stepped, min, max);
    },
    [clamp],
  );

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => !latestPropsRef.current.disabled,
        onMoveShouldSetPanResponder: () => !latestPropsRef.current.disabled,
        onPanResponderGrant: (evt) => {
          if (latestPropsRef.current.disabled) return;
          const newVal = calculateValueFromPosition(evt.nativeEvent.pageX);
          latestPropsRef.current.onValueChange(newVal);
        },
        onPanResponderMove: (evt) => {
          if (latestPropsRef.current.disabled) return;
          const newVal = calculateValueFromPosition(evt.nativeEvent.pageX);
          latestPropsRef.current.onValueChange(newVal);
        },
      }),
    [calculateValueFromPosition],
  );

  const updateMeasurements = useCallback(() => {
    sliderViewRef.current?.measure((_x, _y, width, _height, pageX) => {
      if (width > 0) {
        trackWidthRef.current = width;
      }
      trackXRef.current = pageX;
    });
  }, []);

  const onLayout = useCallback(
    (e: LayoutChangeEvent) => {
      trackWidthRef.current = e.nativeEvent.layout.width;
      updateMeasurements();
    },
    [updateMeasurements],
  );

  const percentage = clamp(
    (value - minimumValue) / (maximumValue - minimumValue),
    0,
    1,
  );

  const percentagePosition: DimensionValue = `${String(percentage * 100)}%` as DimensionValue;

  return (
    <View
      ref={sliderViewRef}
      style={[styles.container, style]}
      onLayout={onLayout}
      {...panResponder.panHandlers}
    >
      <View
        style={[
          styles.track,
          { height: trackHeight, backgroundColor: theme.colors.lightGrey },
        ]}
      >
        <View
          style={[
            styles.filledTrack,
            {
              width: percentagePosition,
              height: trackHeight,
              backgroundColor: activeColor,
            },
          ]}
        />
      </View>
      <View
        style={[
          styles.thumb,
          {
            width: thumbSize,
            height: thumbSize,
            borderRadius: thumbSize / 2,
            left: percentagePosition,
            marginLeft: -thumbSize / 2,
            borderColor: activeColor,
            backgroundColor: theme.colors.white,
          },
        ]}
      />
    </View>
  );
}

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      height: 40,
      justifyContent: 'center',
      position: 'relative',
    },
    track: {
      width: '100%',
      borderRadius: theme.radius.full,
      overflow: 'hidden',
    },
    filledTrack: {
      borderRadius: theme.radius.full,
    },
    thumb: {
      position: 'absolute',
      borderWidth: 2.5,
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.25)',
    },
  });
