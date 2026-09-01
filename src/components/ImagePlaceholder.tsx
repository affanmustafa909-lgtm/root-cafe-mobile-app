import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import { colors, fonts, placeholderTone } from '../constants/theme';

type Props = {
  id?: string | null;
  label?: string;
  style?: ViewStyle;
};

export function ImagePlaceholder({ id, label = 'RC', style }: Props) {
  return (
    <View
      style={[styles.wrap, { backgroundColor: placeholderTone(id) }, style]}
      accessibilityElementsHidden
    >
      <View style={styles.beans}>
        <View style={[styles.bean, { backgroundColor: 'rgba(250,250,248,0.35)' }]} />
        <View style={[styles.bean, { backgroundColor: 'rgba(10,10,10,0.35)' }]} />
        <View style={[styles.bean, { backgroundColor: 'rgba(250,250,248,0.55)' }]} />
      </View>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  beans: { flexDirection: 'row', gap: 4 },
  bean: {
    width: 10,
    height: 6,
    borderRadius: 999,
    transform: [{ rotate: '-28deg' }],
  },
  label: {
    fontFamily: fonts.display,
    fontSize: 18,
    color: colors.white,
    letterSpacing: 1,
  },
});
