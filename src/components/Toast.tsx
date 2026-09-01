import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { duration, easing } from '../constants/motion';
import { radii, shadow, typography } from '../constants/theme';
import { useAppTheme } from '../store/ThemeContext';

type Tone = 'success' | 'error' | 'info';

type ToastItem = {
  id: number;
  message: string;
  tone: Tone;
};

type ToastContextValue = {
  show: (message: string, tone?: Tone) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const { colors } = useAppTheme();
  const [toast, setToast] = useState<ToastItem | null>(null);
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-8)).current;
  const scale = useRef(new Animated.Value(0.98)).current;
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const idRef = useRef(0);
  const insets = useSafeAreaInsets();

  const hide = useCallback(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 0,
        duration: duration.fast,
        easing,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: -8,
        duration: duration.fast,
        easing,
        useNativeDriver: true,
      }),
    ]).start(() => setToast(null));
  }, [opacity, translateY]);

  const show = useCallback(
    (message: string, tone: Tone = 'info') => {
      if (timer.current) clearTimeout(timer.current);
      idRef.current += 1;
      setToast({ id: idRef.current, message, tone });
      opacity.setValue(0);
      translateY.setValue(-8);
      scale.setValue(0.98);
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: duration.normal,
          easing,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: duration.normal,
          easing,
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 1,
          duration: duration.normal,
          easing,
          useNativeDriver: true,
        }),
      ]).start();
      timer.current = setTimeout(hide, 2600);
    },
    [hide, opacity, scale, translateY],
  );

  const value = useMemo(() => ({ show }), [show]);

  const accent =
    toast?.tone === 'error'
      ? colors.coral
      : toast?.tone === 'success'
        ? colors.sky
        : colors.navy;

  return (
    <ToastContext.Provider value={value}>
      {children}
      {toast ? (
        <Animated.View
          pointerEvents="none"
          style={[
            styles.wrap,
            {
              top: insets.top + 8,
              opacity,
              transform: [{ translateY }, { scale }],
            },
          ]}
          accessibilityLiveRegion="polite"
        >
          <View
            style={[
              styles.toast,
              {
                borderLeftColor: accent,
                backgroundColor: colors.panelElevated,
                borderColor: colors.border,
              },
            ]}
          >
            <Text style={[styles.text, { color: colors.text }]}>
              {toast.message}
            </Text>
          </View>
        </Animated.View>
      ) : null}
    </ToastContext.Provider>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 16,
    right: 16,
    zIndex: 80,
  },
  toast: {
    borderRadius: radii.md,
    borderWidth: 1,
    borderLeftWidth: 3,
    paddingHorizontal: 16,
    paddingVertical: 14,
    ...shadow,
  },
  text: {
    ...typography.bodySmall,
  },
});
