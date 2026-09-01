import React from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';
import { beanTones } from '../constants/theme';

type Size = 'sm' | 'md' | 'lg' | 'xl';

const SIZES: Record<Size, { w: number; h: number }> = {
  sm: { w: 14, h: 9 },
  md: { w: 22, h: 14 },
  lg: { w: 30, h: 19 },
  /** Tall logo bean (matches RC mark proportions) */
  xl: { w: 18, h: 34 },
};

type BeanProps = {
  color: string;
  size?: Size;
  style?: ViewStyle;
};

/**
 * Classic kidney coffee-bean (two lobes + cleft) — not a pill capsule.
 */
export function CoffeeBean({ color, size = 'md', style }: BeanProps) {
  const { w, h } = SIZES[size];
  const lobe = w * 0.62;
  return (
    <View style={[{ width: w, height: h }, style]}>
      <View
        style={[
          styles.shell,
          {
            width: w,
            height: h,
            borderRadius: h / 2,
          },
        ]}
      >
        <View
          style={[
            styles.lobe,
            {
              width: lobe,
              height: h,
              borderRadius: h / 2,
              backgroundColor: color,
              left: 0,
            },
          ]}
        />
        <View
          style={[
            styles.lobe,
            {
              width: lobe,
              height: h,
              borderRadius: h / 2,
              backgroundColor: color,
              right: 0,
            },
          ]}
        />
        <View
          style={[
            styles.highlight,
            {
              width: w * 0.32,
              height: h * 0.4,
              borderRadius: h,
              top: h * 0.14,
              left: w * 0.16,
            },
          ]}
        />
        <View
          style={[
            styles.cleft,
            {
              width: Math.max(1.5, w * 0.08),
              height: h * 0.68,
              borderRadius: 99,
            },
          ]}
        />
      </View>
    </View>
  );
}

/** Soft blue · espresso · cream — splash loader (matches approved mock) */
export const SPLASH_BEAN_TONES = [
  '#A8C5D4',
  '#2A1B14',
  '#E8DFD4',
] as const;

type RowProps = {
  size?: Size;
  colors?: readonly string[];
  gap?: number;
  style?: ViewStyle;
};

export function CoffeeBeanRow({
  size = 'md',
  colors = beanTones,
  gap = 10,
  style,
  flat,
}: RowProps & { flat?: boolean }) {
  const rotates = flat
    ? ([-22, -14, -8] as const)
    : ([-42, -28, -18] as const);
  return (
    <View
      style={[styles.row, { gap }, style]}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      {colors.map((tone, i) => (
        <CoffeeBean
          key={`${tone}-${i}`}
          color={tone}
          size={size}
          style={{ transform: [{ rotate: `${rotates[i] ?? -20}deg` }] }}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shell: {
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  lobe: {
    position: 'absolute',
    top: 0,
  },
  highlight: {
    position: 'absolute',
    backgroundColor: 'rgba(255,248,240,0.2)',
  },
  cleft: {
    backgroundColor: 'rgba(0,0,0,0.42)',
    transform: [{ rotate: '14deg' }],
  },
});
