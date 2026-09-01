import React from 'react';
import { StyleSheet, ViewStyle } from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';
import { useAppTheme } from '../store/ThemeContext';

type Props = {
  children: React.ReactNode;
  style?: ViewStyle;
  edges?: Edge[];
  backgroundColor?: string;
};

export function Screen({
  children,
  style,
  edges = ['top'],
  backgroundColor,
}: Props) {
  const { colors } = useAppTheme();
  return (
    <SafeAreaView
      style={[
        styles.flex,
        { backgroundColor: backgroundColor ?? colors.background },
        style,
      ]}
      edges={edges}
    >
      {children}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
});
