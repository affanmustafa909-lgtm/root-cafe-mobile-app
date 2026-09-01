import React from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { useAppTheme } from '../store/ThemeContext';

const LOGO = require('../assets/splash/logo.png');

type Props = {
  size?: 'sm' | 'md' | 'lg';
  /** Kept for API compat — logo already designed for dark surfaces */
  onDark?: boolean;
};

export function BrandMark({ size = 'md' }: Props) {
  useAppTheme();
  const dim =
    size === 'lg'
      ? { width: 180, height: 188 }
      : size === 'sm'
        ? { width: 96, height: 100 }
        : { width: 132, height: 138 };

  return (
    <View
      style={styles.wrap}
      accessibilityRole="header"
      accessibilityLabel="Roots Café"
    >
      <Image source={LOGO} style={dim} resizeMode="contain" />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center' },
});
