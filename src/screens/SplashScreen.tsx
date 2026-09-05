import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Easing,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { CoffeeBeanRow } from '../components/CoffeeBean';
import { LoadingBean } from '../components/LoadingBean';
import { Screen } from '../components/Screen';
import { fonts } from '../constants/theme';
import { useAuth } from '../store/AuthContext';

const MIN_SPLASH_MS = 1200;
const QUICK_SPLASH_MS = 350;
/** Never leave the user on splash if auth/storage stalls */
const MAX_SPLASH_MS = 4500;

/** Mock mark row: soft blue · roast brown · cream */
const MARK_BEANS = ['#A8C5D4', '#6F4E37', '#E8DFD4'] as const;

/** Mock loader row: soft blue · espresso · cream */
const LOADER_BEANS = ['#A8C5D4', '#2A1B14', '#E8DFD4'] as const;

type Props = {
  onReady: (authenticated: boolean) => void;
  /** Skip long splash for returning users / boot checks */
  quick?: boolean;
};

export function SplashScreen({ onReady, quick = false }: Props) {
  const { isLoading, isAuthenticated } = useAuth();
  const startedAt = useRef(Date.now());
  const done = useRef(false);
  const fade = useRef(new Animated.Value(0)).current;
  const rise = useRef(new Animated.Value(10)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, {
        toValue: 1,
        duration: 700,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(rise, {
        toValue: 0,
        duration: 700,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, [fade, rise]);

  useEffect(() => {
    if (done.current) return;

    const finish = (authenticated: boolean) => {
      if (done.current) return;
      done.current = true;
      onReady(authenticated);
    };

    const maxTimer = setTimeout(() => finish(isAuthenticated), MAX_SPLASH_MS);

    if (isLoading) {
      return () => clearTimeout(maxTimer);
    }

    const minMs = quick ? QUICK_SPLASH_MS : MIN_SPLASH_MS;
    const elapsed = Date.now() - startedAt.current;
    const wait = Math.max(0, minMs - elapsed);

    const timer = setTimeout(() => finish(isAuthenticated), wait);

    return () => {
      clearTimeout(timer);
      clearTimeout(maxTimer);
    };
  }, [isLoading, isAuthenticated, onReady, quick]);

  return (
    <Screen edges={['top', 'bottom']} backgroundColor="#000000">
      <View style={styles.root}>
        <Animated.View
          style={[
            styles.center,
            { opacity: fade, transform: [{ translateY: rise }] },
          ]}
        >
          <Text style={styles.title} accessibilityRole="header">
            Roots Café
          </Text>

          <CoffeeBeanRow
            size="md"
            colors={MARK_BEANS}
            gap={10}
            flat
            style={styles.markBeans}
          />

          <Text style={styles.tagline}>Specialty coffee, ordered ahead.</Text>

          <View style={styles.loader}>
            <LoadingBean size="sm" colors={LOADER_BEANS} />
          </View>
        </Animated.View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  center: {
    alignItems: 'center',
    paddingHorizontal: 32,
    maxWidth: 360,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 40,
    lineHeight: 48,
    letterSpacing: -0.6,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  markBeans: {
    marginTop: 18,
    marginBottom: 18,
  },
  tagline: {
    fontFamily: fonts.displayRegular,
    fontSize: 16,
    lineHeight: 24,
    color: 'rgba(250, 250, 248, 0.62)',
    textAlign: 'center',
  },
  loader: {
    marginTop: 36,
  },
});
