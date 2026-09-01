import React, { useEffect, useRef } from 'react';
import { Animated, ViewStyle } from 'react-native';
import { duration, easing, useReducedMotion } from '../constants/motion';

type Props = {
  children: React.ReactNode;
  delay?: number;
  style?: ViewStyle;
};

export function FadeIn({ children, delay = 0, style }: Props) {
  const reduced = useReducedMotion();
  const opacity = useRef(new Animated.Value(reduced ? 1 : 0)).current;
  const translateY = useRef(new Animated.Value(reduced ? 0 : 8)).current;

  useEffect(() => {
    if (reduced) return;
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: duration.enter,
        delay,
        easing,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: duration.enter,
        delay,
        easing,
        useNativeDriver: true,
      }),
    ]).start();
  }, [delay, opacity, reduced, translateY]);

  return (
    <Animated.View style={[{ opacity, transform: [{ translateY }] }, style]}>
      {children}
    </Animated.View>
  );
}
