import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { radii, shadowSoft } from '../constants/theme';
import { useAppTheme } from '../store/ThemeContext';

type Props = {
  children: React.ReactNode;
  style?: ViewStyle;
  elevated?: boolean;
  padded?: boolean;
};

export function Card({ children, style, elevated, padded = true }: Props) {
  const { colors } = useAppTheme();
  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: elevated ? colors.elevated : colors.panel,
          borderColor: colors.border,
        },
        padded && styles.padded,
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radii.lg,
    borderWidth: 1,
    overflow: 'hidden',
    ...shadowSoft,
  },
  padded: {
    padding: 16,
  },
});
