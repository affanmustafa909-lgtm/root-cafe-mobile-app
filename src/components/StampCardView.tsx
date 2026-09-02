import React, { useMemo } from 'react';
import { StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { CoffeeBean } from './CoffeeBean';
import { fonts, palette, radii } from '../constants/theme';
import { useAppTheme } from '../store/ThemeContext';
import type { StampCardStatus } from '../types';

type Props = {
  card: StampCardStatus;
};

/** Compact loyalty punch card — espresso header + clean stamp grid. */
export function StampCardView({ card }: Props) {
  const { mode } = useAppTheme();
  const { width: windowWidth } = useWindowDimensions();
  const slots = Math.max(1, Math.min(12, card.stampsRequired));
  const filled = Math.min(card.stampsTowardReward, slots);
  const remaining = Math.max(0, slots - filled);
  const columns = slots <= 6 ? 3 : 4;
  const pad = 20;
  const gap = 12;
  const usable = Math.min(windowWidth, 420) - pad * 2 - 8;
  const punch = Math.min(54, Math.floor((usable - gap * (columns - 1)) / columns));

  const isDark = mode === 'dark';
  const headerBg = isDark ? '#12100E' : palette.ink;
  const bodyBg = isDark ? '#1A1714' : '#FFFCFA';
  const border = isDark ? 'rgba(232,223,212,0.12)' : 'rgba(26,21,18,0.1)';
  const ink = isDark ? palette.creamDeep : palette.ink;
  const muted = isDark ? 'rgba(232,223,212,0.62)' : '#7A6B5D';
  const bean = isDark ? palette.sky : '#5C4033';
  const emptyFill = isDark ? 'rgba(255,255,255,0.04)' : '#F3EEE6';
  const emptyStroke = isDark ? 'rgba(232,223,212,0.2)' : '#D2C4B4';
  const onFill = isDark ? 'rgba(168,197,212,0.18)' : 'rgba(92,64,51,0.1)';

  const styles = useMemo(
    () =>
      StyleSheet.create({
        card: {
          borderRadius: 18,
          overflow: 'hidden',
          borderWidth: 1,
          borderColor: border,
          backgroundColor: bodyBg,
        },
        header: {
          backgroundColor: headerBg,
          paddingHorizontal: 18,
          paddingTop: 16,
          paddingBottom: 14,
          gap: 4,
        },
        brand: {
          fontFamily: fonts.sansSemi,
          fontSize: 10,
          letterSpacing: 1.8,
          textTransform: 'uppercase',
          color: isDark ? palette.sky : '#C9B8A4',
        },
        headerRow: {
          flexDirection: 'row',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          gap: 12,
        },
        title: {
          flex: 1,
          fontFamily: fonts.display,
          fontSize: 22,
          lineHeight: 28,
          color: '#FAFAF8',
        },
        counter: {
          fontFamily: fonts.sansBold,
          fontSize: 15,
          color: '#FAFAF8',
          opacity: 0.92,
        },
        subtitle: {
          marginTop: 2,
          fontFamily: fonts.sans,
          fontSize: 12,
          lineHeight: 17,
          color: 'rgba(250,250,248,0.68)',
        },
        body: {
          paddingHorizontal: pad,
          paddingTop: 18,
          paddingBottom: 16,
          gap: 14,
        },
        grid: {
          flexDirection: 'row',
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap,
        },
        stamp: {
          width: punch,
          height: punch,
          borderRadius: punch / 2,
          alignItems: 'center',
          justifyContent: 'center',
          borderWidth: 1.5,
          borderColor: emptyStroke,
          backgroundColor: emptyFill,
        },
        stampOn: {
          borderColor: bean,
          backgroundColor: onFill,
        },
        stampIndex: {
          fontFamily: fonts.sansSemi,
          fontSize: 11,
          color: emptyStroke,
        },
        footer: {
          alignItems: 'center',
          gap: 6,
          paddingTop: 2,
        },
        status: {
          fontFamily: fonts.sans,
          fontSize: 13,
          lineHeight: 18,
          color: muted,
          textAlign: 'center',
        },
        reward: {
          width: '100%',
          borderRadius: 12,
          paddingVertical: 12,
          paddingHorizontal: 14,
          backgroundColor: isDark ? 'rgba(243,142,34,0.14)' : '#FFF4E8',
          borderWidth: 1,
          borderColor: palette.orange,
          alignItems: 'center',
          gap: 2,
        },
        rewardTitle: {
          fontFamily: fonts.sansBold,
          fontSize: 14,
          color: ink,
        },
        rewardHint: {
          fontFamily: fonts.sans,
          fontSize: 12,
          lineHeight: 17,
          color: muted,
          textAlign: 'center',
        },
        track: {
          width: '100%',
          height: 4,
          borderRadius: 999,
          backgroundColor: emptyFill,
          overflow: 'hidden',
        },
        trackFill: {
          height: '100%',
          borderRadius: 999,
          backgroundColor: bean,
        },
      }),
    [
      bean,
      bodyBg,
      border,
      emptyFill,
      emptyStroke,
      gap,
      headerBg,
      ink,
      isDark,
      muted,
      onFill,
      pad,
      punch,
    ],
  );

  if (!card.enabled) return null;

  const progress = slots > 0 ? filled / slots : 0;

  return (
    <View style={styles.card} accessibilityRole="summary">
      <View style={styles.header}>
        <Text style={styles.brand}>Roots Café</Text>
        <View style={styles.headerRow}>
          <Text style={styles.title} numberOfLines={1}>
            {card.title}
          </Text>
          <Text style={styles.counter}>
            {filled}/{slots}
          </Text>
        </View>
        <Text style={styles.subtitle} numberOfLines={2}>
          {card.subtitle}
        </Text>
      </View>

      <View style={styles.body}>
        <View style={styles.track}>
          <View style={[styles.trackFill, { width: `${Math.round(progress * 100)}%` }]} />
        </View>

        <View style={styles.grid}>
          {Array.from({ length: slots }, (_, i) => {
            const on = i < filled;
            return (
              <View
                key={`s-${i}`}
                style={[styles.stamp, on && styles.stampOn]}
                accessibilityLabel={
                  on ? `Stamp ${i + 1} collected` : `Stamp ${i + 1} empty`
                }
              >
                {on ? (
                  <CoffeeBean color={bean} size={punch < 46 ? 'sm' : 'md'} />
                ) : (
                  <Text style={styles.stampIndex}>{i + 1}</Text>
                )}
              </View>
            );
          })}
        </View>

        <View style={styles.footer}>
          {card.freeDrinkAvailable ? (
            <View style={styles.reward}>
              <Text style={styles.rewardTitle}>Free drink ready</Text>
              <Text style={styles.rewardHint}>
                Turn on redeem at checkout on your next order.
              </Text>
            </View>
          ) : (
            <Text style={styles.status}>
              {remaining <= 0
                ? 'Keep collecting — reward unlocks soon.'
                : remaining === 1
                  ? '1 more collected order for a free drink.'
                  : `${remaining} more collected orders for a free drink.`}
            </Text>
          )}
        </View>
      </View>
    </View>
  );
}
