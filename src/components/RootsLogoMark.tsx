import React from 'react';
import { Image, StyleSheet, View, type ViewStyle } from 'react-native';

const LOGO = require('../assets/splash/logo.png');

type Props = {
  size?: 'md' | 'lg';
  style?: ViewStyle;
};

/**
 * Official Roots Café logo (beans + RC + script).
 */
export function RootsLogoMark({ size = 'lg', style }: Props) {
  const large = size === 'lg';
  const width = large ? 220 : 160;
  const height = large ? 230 : 168;

  return (
    <View
      style={[styles.wrap, style]}
      accessibilityRole="header"
      accessibilityLabel="Roots Café"
    >
      <Image
        source={LOGO}
        style={{ width, height }}
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
