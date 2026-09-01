import { DarkTheme, DefaultTheme, type Theme } from '@react-navigation/native';
import { fonts, type AppColors, type ThemeMode } from '../constants/theme';
import { getTheme } from '../constants/theme';

function buildNavigationTheme(mode: ThemeMode): Theme {
  const { colors } = getTheme(mode);
  const base = mode === 'light' ? DefaultTheme : DarkTheme;
  return {
    ...base,
    dark: mode === 'dark',
    colors: {
      ...base.colors,
      primary: colors.coral,
      background: colors.background,
      card: colors.panel,
      text: colors.text,
      border: colors.border,
      notification: colors.coral,
    },
    fonts: {
      regular: { fontFamily: fonts.sans, fontWeight: '400' },
      medium: { fontFamily: fonts.sansMedium, fontWeight: '500' },
      bold: { fontFamily: fonts.sansBold, fontWeight: '700' },
      heavy: { fontFamily: fonts.sansBold, fontWeight: '700' },
    },
  };
}

const NAV_THEMES = {
  dark: () => buildNavigationTheme('dark'),
  light: () => buildNavigationTheme('light'),
} as const;

export function createNavigationTheme(
  mode: ThemeMode,
  _colors?: AppColors,
): Theme {
  return NAV_THEMES[mode]();
}
