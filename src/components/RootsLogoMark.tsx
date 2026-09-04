import React from 'react';
import { Image, StyleSheet, View, type ViewStyle } from 'react-native';
import { useAppTheme } from '../store/ThemeContext';

const LOGO_ON_DARK = require('../assets/splash/logo-dark.png');
const LOGO_ON_LIGHT = require('../assets/splash/logo-light.png');

type Props = {
  size?: 'md' | 'lg';
  style?: ViewStyle;
};

/**
 * Official Roots Café logo (beans + RC + script).
 * Transparent on both light and dark backgrounds — no box.
 */
export function RootsLogoMark({ size = 'lg', style }: Props) {
  const { mode } = useAppTheme();
  const darkSurface = mode === 'dark';
  const large = size === 'lg';
  const source = darkSurface ? LOGO_ON_DARK : LOGO_ON_LIGHT;
  const width = large ? 220 : 160;
  const height = large ? 112 : 82;

  return (
    <View
      style={[styles.wrap, style]}
      accessibilityRole="header"
      accessibilityLabel="Roots Café"
    >
      <Image source={source} style={{ width, height }} resizeMode="contain" />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
