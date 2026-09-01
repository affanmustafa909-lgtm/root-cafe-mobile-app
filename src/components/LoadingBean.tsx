import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View, ViewStyle } from 'react-native';
import { duration, easing, useReducedMotion } from '../constants/motion';
import { CoffeeBean, SPLASH_BEAN_TONES } from './CoffeeBean';

type Props = {
  size?: 'sm' | 'md';
  colors?: readonly string[];
  style?: ViewStyle;
};

export function LoadingBean({
  size = 'md',
  colors = SPLASH_BEAN_TONES,
  style,
}: Props) {
  const reduced = useReducedMotion();
  const a = useRef(new Animated.Value(0.28)).current;
  const b = useRef(new Animated.Value(0.28)).current;
  const c = useRef(new Animated.Value(0.28)).current;
  const beanSize = size === 'sm' ? 'sm' : 'md';
  const opacities = [a, b, c] as const;

  useEffect(() => {
    if (reduced) {
      a.setValue(1);
      b.setValue(0.45);
      c.setValue(0.45);
      return;
    }
    const pulse = (value: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(value, {
            toValue: 1,
            duration: duration.slow,
            easing,
            useNativeDriver: true,
          }),
          Animated.timing(value, {
            toValue: 0.28,
            duration: duration.enter,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.delay(180),
        ]),
      );

    const anim = Animated.parallel([pulse(a, 0), pulse(b, 160), pulse(c, 320)]);
    anim.start();
    return () => anim.stop();
  }, [a, b, c, reduced]);

  return (
    <View
      style={[styles.row, style]}
      accessibilityRole="progressbar"
      accessibilityLabel="Loading"
    >
      {colors.map((tone, i) => (
        <Animated.View key={`${tone}-${i}`} style={{ opacity: opacities[i] }}>
          <CoffeeBean color={tone} size={beanSize} />
        </Animated.View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
});
