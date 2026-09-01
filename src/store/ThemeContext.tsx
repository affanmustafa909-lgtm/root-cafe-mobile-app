import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { StyleSheet } from 'react-native';
import { STORAGE_KEYS } from '../constants/config';
import { getTheme, type ThemeMode } from '../constants/theme';

type ThemeContextValue = ReturnType<typeof getTheme> & {
  setMode: (mode: ThemeMode) => void;
  ready: boolean;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>('dark');
  const [ready, setReady] = useState(false);
  const modeRef = useRef<ThemeMode>('dark');

  useEffect(() => {
    let cancelled = false;
    void AsyncStorage.getItem(STORAGE_KEYS.theme).then((saved) => {
      if (cancelled) return;
      if (saved === 'light' || saved === 'dark') {
        modeRef.current = saved;
        setModeState(saved);
      }
      setReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const setMode = useCallback((next: ThemeMode) => {
    if (modeRef.current === next) return;
    modeRef.current = next;
    setModeState(next);
    // Persist off the critical path — never block the tap
    setTimeout(() => {
      void AsyncStorage.setItem(STORAGE_KEYS.theme, next);
    }, 0);
  }, []);

  const value = useMemo(() => {
    const base = getTheme(mode);
    return { ...base, setMode, ready };
  }, [mode, setMode, ready]);

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useAppTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    return { ...getTheme('dark'), setMode: () => undefined, ready: true };
  }
  return ctx;
}

export function useThemedStyles<T extends StyleSheet.NamedStyles<T>>(
  factory: (theme: ReturnType<typeof getTheme>) => T,
) {
  const theme = useAppTheme();
  return useMemo(() => StyleSheet.create(factory(theme)), [theme.mode]);
}
