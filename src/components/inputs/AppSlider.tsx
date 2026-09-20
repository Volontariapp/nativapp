import React, { useRef, useState, useEffect, useCallback } from 'react';
import type { DimensionValue, StyleProp, ViewStyle, LayoutChangeEvent } from 'react-native';
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
  const [internalValue, setInternalValue] = useState(value);

  useEffect(() => {
    setInternalValue(value);
  }, [value]);

  const activeColor = color ?? theme.colors.primaryEco;

  const clamp = useCallback(
    (val: number, min: number, max: number) => Math.min(Math.max(val, min), max),
    [],
  );

  const calculateValueFromPosition = useCallback(
    (pageX: number): number => {
      if (trackWidthRef.current <= 0) return internalValue;
      const localX = pageX - trackXRef.current;
      const ratio = clamp(localX / trackWidthRef.current, 0, 1);
      const rawVal = minimumValue + ratio * (maximumValue - minimumValue);
      const stepped = Math.round(rawVal / step) * step;
      return clamp(stepped, minimumValue, maximumValue);
    },
    [clamp, internalValue, maximumValue, minimumValue, step],
  );

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => !disabled,
      onMoveShouldSetPanResponder: () => !disabled,
      onPanResponderGrant: (evt) => {
        if (disabled) return;
        const newVal = calculateValueFromPosition(evt.nativeEvent.pageX);
        setInternalValue(newVal);
        onValueChange(newVal);
      },
      onPanResponderMove: (evt) => {
        if (disabled) return;
        const newVal = calculateValueFromPosition(evt.nativeEvent.pageX);
        setInternalValue(newVal);
        onValueChange(newVal);
      },
    }),
  ).current;

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
    (internalValue - minimumValue) / (maximumValue - minimumValue),
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
      shadowColor: theme.colors.black,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3,
      elevation: 3,
    },
  });
