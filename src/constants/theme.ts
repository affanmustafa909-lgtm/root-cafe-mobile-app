import { Platform, TextStyle, ViewStyle } from 'react-native';

export type ThemeMode = 'dark' | 'light';

/** Brand palette — soft blue · espresso · cream (classic Roots Café) */
export const palette = {
  black: '#0A0A0A',
  panel: '#151515',
  sky: '#A8C5D4',
  navy: '#33427A',
  coral: '#A8C5D4',
  white: '#FAFAF8',
  cream: '#F6F3EE',
  creamDeep: '#E8DFD4',
  orange: '#F38E22',
  ink: '#1A1512',
  beanLight: '#E8DFD4',
  beanMid: '#6F4E37',
  beanDark: '#2A1B14',
  beanBlue: '#A8C5D4',
  beanRed: '#E02A3A',
  peach: '#FFE4C4',
  salePink: '#E15B4F',
} as const;

const darkColors = {
  black: '#000000',
  panel: palette.panel,
  panelElevated: '#1C1C1C',
  sky: palette.sky,
  navy: palette.navy,
  /** Primary buttons/chips — soft blue with black text */
  coral: palette.sky,
  white: palette.white,

  background: palette.black,
  surface: palette.black,
  card: palette.panel,
  elevated: '#1C1C1C',

  text: palette.creamDeep,
  textMuted: 'rgba(232, 223, 212, 0.78)',
  textSecondary: 'rgba(232, 223, 212, 0.62)',
  textTertiary: 'rgba(232, 223, 212, 0.42)',
  placeholder: 'rgba(232, 223, 212, 0.42)',

  border: 'rgba(232, 223, 212, 0.10)',
  borderStrong: 'rgba(232, 223, 212, 0.18)',
  hover: 'rgba(232, 223, 212, 0.06)',

  overlay: 'rgba(10, 8, 7, 0.72)',
  success: palette.sky,
  warning: palette.beanMid,
  danger: '#B85C38',
  disabled: 'rgba(232, 223, 212, 0.28)',
  skeleton: 'rgba(232, 223, 212, 0.08)',
  skeletonHighlight: 'rgba(232, 223, 212, 0.14)',

  coralPressed: '#8FB0C2',
  coralMuted: 'rgba(168, 197, 212, 0.16)',
  skyMuted: 'rgba(168, 197, 212, 0.16)',
  navyMuted: 'rgba(51, 66, 122, 0.55)',
} as const;

const lightColors = {
  black: palette.ink,
  panel: '#FFFFFF',
  panelElevated: '#FFFcf9',
  sky: '#5B7C8D',
  navy: palette.navy,
  /** Primary buttons/chips — ink black with white text */
  coral: palette.ink,
  white: '#FFFFFF',

  background: palette.cream,
  surface: palette.cream,
  card: '#FFFFFF',
  elevated: '#FFFFFF',

  text: palette.ink,
  textMuted: 'rgba(26, 21, 18, 0.72)',
  textSecondary: 'rgba(26, 21, 18, 0.58)',
  textTertiary: 'rgba(26, 21, 18, 0.38)',
  placeholder: 'rgba(26, 21, 18, 0.38)',

  border: 'rgba(26, 21, 18, 0.08)',
  borderStrong: 'rgba(26, 21, 18, 0.14)',
  hover: 'rgba(26, 21, 18, 0.05)',

  overlay: 'rgba(26, 21, 18, 0.45)',
  success: '#5B7C8D',
  warning: palette.beanMid,
  danger: '#8B4513',
  disabled: 'rgba(26, 21, 18, 0.28)',
  skeleton: 'rgba(26, 21, 18, 0.06)',
  skeletonHighlight: 'rgba(26, 21, 18, 0.12)',

  coralPressed: '#2A221C',
  coralMuted: 'rgba(26, 21, 18, 0.08)',
  skyMuted: 'rgba(91, 124, 141, 0.12)',
  navyMuted: 'rgba(60, 42, 33, 0.1)',
} as const;

export type AppColors = typeof darkColors;

const darkCafe = {
  bg: palette.black,
  card: palette.panel,
  orange: palette.sky,
  orangeDeep: '#8FB0C2',
  peach: palette.beanDark,
  peachSoft: '#1E1814',
  text: palette.creamDeep,
  textMuted: 'rgba(232, 223, 212, 0.62)',
  olive: palette.sky,
  border: 'rgba(232, 223, 212, 0.12)',
  banner: '#E7BC91',
  badgeSale: palette.salePink,
  badgeOff: palette.beanMid,
} as const;

const lightCafe = {
  bg: palette.cream,
  card: '#FFFFFF',
  orange: palette.ink,
  orangeDeep: '#2A221C',
  peach: '#E7BC91',
  peachSoft: palette.creamDeep,
  text: palette.ink,
  textMuted: 'rgba(26, 21, 18, 0.58)',
  olive: '#5B6B7A',
  border: 'rgba(26, 21, 18, 0.08)',
  banner: '#E7BC91',
  badgeSale: palette.salePink,
  badgeOff: palette.orange,
} as const;

export type CafeTokens = typeof darkCafe;

/** Dark-mode defaults (legacy static imports). Prefer useAppTheme(). */
export const colors: AppColors = darkColors;
export const cafe: CafeTokens = darkCafe;

export const cafeShadow: ViewStyle =
  Platform.OS === 'ios'
    ? {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.35,
        shadowRadius: 16,
      }
    : { elevation: 4 };

export const cafeShadowLight: ViewStyle =
  Platform.OS === 'ios'
    ? {
        shadowColor: '#3C2A21',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.1,
        shadowRadius: 14,
      }
    : { elevation: 3 };

/** Single elegant family (Fraunces) for UI; script for brand wordmark. */
export const fonts = {
  display: 'Fraunces_600SemiBold',
  displayBold: 'Fraunces_700Bold',
  displayRegular: 'Fraunces_400Regular',
  sans: 'Fraunces_400Regular',
  sansMedium: 'Fraunces_600SemiBold',
  sansSemi: 'Fraunces_600SemiBold',
  sansBold: 'Fraunces_700Bold',
  script: 'GreatVibes_400Regular',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 40,
} as const;

export const radii = {
  sm: 8,
  md: 12,
  lg: 16,
  hero: 22,
  button: 12,
  full: 999,
} as const;

function makeTypography(c: AppColors) {
  return {
    display: {
      fontFamily: fonts.display,
      fontSize: 34,
      lineHeight: 40,
      letterSpacing: -0.6,
      color: c.text,
    } satisfies TextStyle,
    h1: {
      fontFamily: fonts.display,
      fontSize: 28,
      lineHeight: 34,
      letterSpacing: -0.4,
      color: c.text,
    } satisfies TextStyle,
    h2: {
      fontFamily: fonts.display,
      fontSize: 22,
      lineHeight: 28,
      letterSpacing: -0.3,
      color: c.text,
    } satisfies TextStyle,
    h3: {
      fontFamily: fonts.sansSemi,
      fontSize: 18,
      lineHeight: 24,
      letterSpacing: -0.2,
      color: c.text,
    } satisfies TextStyle,
    body: {
      fontFamily: fonts.sans,
      fontSize: 16,
      lineHeight: 24,
      color: c.text,
    } satisfies TextStyle,
    bodyBold: {
      fontFamily: fonts.sansSemi,
      fontSize: 16,
      lineHeight: 24,
      color: c.text,
    } satisfies TextStyle,
    bodySmall: {
      fontFamily: fonts.sans,
      fontSize: 14,
      lineHeight: 20,
      color: c.textMuted,
    } satisfies TextStyle,
    label: {
      fontFamily: fonts.sansSemi,
      fontSize: 12,
      lineHeight: 16,
      letterSpacing: 0.6,
      textTransform: 'uppercase' as const,
      color: c.textSecondary,
    } satisfies TextStyle,
    caption: {
      fontFamily: fonts.sans,
      fontSize: 13,
      lineHeight: 18,
      color: c.textSecondary,
    } satisfies TextStyle,
    numeric: {
      fontFamily: fonts.sansBold,
      fontSize: 28,
      lineHeight: 32,
      letterSpacing: -0.4,
      color: c.text,
    } satisfies TextStyle,
    button: {
      fontFamily: fonts.sansSemi,
      fontSize: 15,
      lineHeight: 20,
      letterSpacing: 0.2,
    } satisfies TextStyle,
    title: {
      fontFamily: fonts.display,
      fontSize: 30,
      lineHeight: 36,
      letterSpacing: -0.5,
      color: c.text,
    } satisfies TextStyle,
    small: {
      fontFamily: fonts.sansSemi,
      fontSize: 12,
      lineHeight: 16,
      letterSpacing: 0.2,
      color: c.textSecondary,
    } satisfies TextStyle,
  };
}

export const typography = makeTypography(darkColors);

export const shadow: ViewStyle =
  Platform.OS === 'ios'
    ? {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.35,
        shadowRadius: 20,
      }
    : { elevation: 6 };

export const shadowSoft: ViewStyle =
  Platform.OS === 'ios'
    ? {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.22,
        shadowRadius: 10,
      }
    : { elevation: 2 };

export const touchTarget = 48;

/** Splash / brand beans — soft blue · espresso · cream */
export const beanTones = [
  '#A8C5D4',
  '#2A1B14',
  '#E8DFD4',
] as const;

export function placeholderTone(id?: string | null) {
  const s = id || 'rc';
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return beanTones[Math.abs(h) % beanTones.length];
}

function makeStatusColors(c: AppColors) {
  return {
    RECEIVED: {
      fg: c.textMuted,
      bg: c.hover,
      bean: c.textTertiary,
    },
    PREPARING: {
      fg: c.sky,
      bg: c.skyMuted,
      bean: c.sky,
    },
    READY_FOR_PICKUP: {
      fg: c.coral,
      bg: c.coralMuted,
      bean: c.coral,
    },
    COMPLETED: {
      fg: c.sky,
      bg: c.skyMuted,
      bean: c.sky,
    },
    DECLINED: {
      fg: c.danger,
      bg: c.coralMuted,
      bean: c.danger,
    },
  } as const;
}

export const statusColors = makeStatusColors(darkColors);

export function getTheme(mode: ThemeMode) {
  const themedColors = mode === 'light' ? lightColors : darkColors;
  const themedCafe = mode === 'light' ? lightCafe : darkCafe;
  return {
    mode,
    colors: themedColors as AppColors,
    cafe: themedCafe as CafeTokens,
    cafeShadow: mode === 'light' ? cafeShadowLight : cafeShadow,
    typography: makeTypography(themedColors as AppColors),
    statusColors: makeStatusColors(themedColors as AppColors),
  };
}
