import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { duration, easing, useReducedMotion } from '../constants/motion';
import { typography } from '../constants/theme';
import { useAppTheme } from '../store/ThemeContext';
import type { OrderStatus } from '../types';

const STEPS: OrderStatus[] = [
  'RECEIVED',
  'PREPARING',
  'READY_FOR_PICKUP',
  'COMPLETED',
];

export function OrderTimeline({ status }: { status: OrderStatus }) {
  const { t } = useTranslation();
  const { colors, statusColors } = useAppTheme();
  const currentIndex = STEPS.indexOf(status);
  const reduced = useReducedMotion();
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (reduced) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1.18,
          duration: duration.enter,
          easing,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 1,
          duration: duration.enter,
          easing,
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [pulse, reduced]);

  if (status === 'DECLINED') {
    const tone = statusColors.DECLINED;
    return (
      <View style={styles.wrap} accessibilityRole="summary">
        <View style={styles.row}>
          <View style={styles.rail}>
            <View
              style={[styles.bean, { backgroundColor: tone.bean }]}
            />
          </View>
          <Text
            style={[
              styles.label,
              {
                color: colors.text,
                fontFamily: typography.bodyBold.fontFamily,
              },
            ]}
          >
            {t('orders.status.DECLINED')}
          </Text>
        </View>
        <Text style={[styles.hint, { color: colors.textMuted }]}>
          {t('orders.declinedHint')}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.wrap} accessibilityRole="summary">
      {STEPS.map((step, index) => {
        const done = index < currentIndex;
        const active = index === currentIndex;
        const tone = statusColors[step];
        return (
          <View key={step} style={styles.row}>
            <View style={styles.rail}>
              <Animated.View
                style={[
                  styles.bean,
                  {
                    backgroundColor: done || active ? tone.bean : colors.hover,
                    transform: [
                      { rotate: '-28deg' },
                      { scale: active ? pulse : 1 },
                    ],
                  },
                ]}
              />
              {index < STEPS.length - 1 ? (
                <View
                  style={[
                    styles.line,
                    { backgroundColor: done ? tone.bean : colors.border },
                  ]}
                />
              ) : null}
            </View>
            <Text
              style={[
                styles.label,
                { color: colors.textTertiary },
                (done || active) && {
                  color: colors.text,
                  fontFamily: typography.bodyBold.fontFamily,
                },
              ]}
            >
              {t(`orders.status.${step}`)}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingVertical: 4 },
  row: { flexDirection: 'row', minHeight: 52, alignItems: 'flex-start' },
  rail: { width: 28, alignItems: 'center' },
  bean: {
    width: 16,
    height: 10,
    borderRadius: 999,
    marginTop: 4,
  },
  line: {
    flex: 1,
    width: 1,
    marginVertical: 4,
  },
  label: {
    ...typography.body,
    marginLeft: 12,
    paddingTop: 2,
  },
  hint: {
    ...typography.caption,
    marginLeft: 40,
    marginTop: -8,
    marginBottom: 8,
  },
});
