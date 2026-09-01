import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
} from 'react-native';
import { fonts, radii, typography } from '../constants/theme';
import { useAppTheme } from '../store/ThemeContext';

type Props = TextInputProps & {
  label: string;
  error?: string;
};

export function Input({ label, error, style, onFocus, onBlur, ...props }: Props) {
  const [focused, setFocused] = useState(false);
  const { colors, typography: type } = useAppTheme();

  return (
    <View style={styles.wrap}>
      <Text style={[styles.label, type.label]}>{label}</Text>
      <TextInput
        accessibilityLabel={label}
        placeholderTextColor={colors.placeholder}
        {...props}
        onFocus={(e) => {
          setFocused(true);
          onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          onBlur?.(e);
        }}
        style={[
          styles.input,
          {
            borderColor: error || focused ? colors.coral : colors.border,
            backgroundColor: colors.panel,
            color: colors.text,
          },
          props.editable === false && styles.inputDisabled,
          style,
        ]}
      />
      {error ? (
        <Text style={[styles.error, { color: colors.coral }]}>{error}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: 16 },
  label: {
    ...typography.label,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: radii.md,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 16,
    lineHeight: 22,
    fontFamily: fonts.sans,
    minHeight: 52,
  },
  inputDisabled: {
    opacity: 0.55,
  },
  error: {
    marginTop: 6,
    fontSize: 12,
    fontFamily: fonts.sansMedium,
  },
});
