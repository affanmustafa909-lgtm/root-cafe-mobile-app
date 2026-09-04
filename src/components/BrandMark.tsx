import React from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { useAppTheme } from '../store/ThemeContext';

/** Transparent marks — no black/gray box on light or dark screens. */
const LOGO_ON_DARK = require('../assets/splash/logo-dark.png');
const LOGO_ON_LIGHT = require('../assets/splash/logo-light.png');

type Props = {
  size?: 'sm' | 'md' | 'lg';
  /** Force white-text logo for dark surfaces. Default follows app theme. */
  onDark?: boolean;
};

export function BrandMark({ size = 'md', onDark }: Props) {
  const { mode } = useAppTheme();
  const darkSurface = onDark ?? mode === 'dark';
  const source = darkSurface ? LOGO_ON_DARK : LOGO_ON_LIGHT;

  // Both transparent assets are the same wide aspect ratio.
  const dim =
    size === 'lg'
      ? { width: 220, height: 112 }
      : size === 'sm'
        ? { width: 132, height: 68 }
        : { width: 176, height: 90 };

  return (
    <View
      style={styles.wrap}
      accessibilityRole="header"
      accessibilityLabel="Roots Café"
    >
      <Image source={source} style={dim} resizeMode="contain" />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
