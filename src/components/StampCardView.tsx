import React, { useMemo } from 'react';
import { StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { CoffeeBean } from './CoffeeBean';
import { fonts, palette, radii } from '../constants/theme';
import { useAppTheme } from '../store/ThemeContext';
import type { StampCardStatus } from '../types';

type Props = {
  card: StampCardStatus;
};

/** Premium Roots Café loyalty punch card. */
export function StampCardView({ card }: Props) {
  const { mode } = useAppTheme();
  const { width: windowWidth } = useWindowDimensions();

  const slots = Math.max(1, Math.min(12, card.stampsRequired));
  const filled = Math.min(card.stampsTowardReward, slots);
  const remaining = Math.max(0, slots - filled);
  const columns = slots <= 6 ? 3 : 4;
  const gap = 11;
  const side = 18;
  const usable = Math.min(windowWidth - 48, 360) - side * 2;
  const punch = Math.min(52, Math.floor((usable - gap * (columns - 1)) / columns));
  const progress = slots > 0 ? filled / slots : 0;

  const dark = mode === 'dark';
  const cream = '#F7F1E8';
  const ink = dark ? cream : '#1C1410';
  const bean = dark ? '#B7D0DC' : '#6B4A34';
  const surface = dark ? '#14110F' : cream;
  const shell = dark ? '#0E0C0B' : '#FFFFFF';
  const line = dark ? 'rgba(247,241,232,0.12)' : 'rgba(28,20,16,0.08)';
  const muted = dark ? 'rgba(247,241,232,0.62)' : '#7D6A58';
  const empty = dark ? 'rgba(255,255,255,0.05)' : '#EFE6DA';
  const emptyBorder = dark ? 'rgba(247,241,232,0.18)' : '#D7C7B4';
  const filledBg = dark ? 'rgba(183,208,220,0.16)' : 'rgba(107,74,52,0.12)';

  const styles = useMemo(
    () =>
      StyleSheet.create({
        wrap: {
          borderRadius: 20,
          overflow: 'hidden',
          backgroundColor: shell,
          borderWidth: 1,
          borderColor: line,
        },
        top: {
          backgroundColor: surface,
          paddingHorizontal: side,
          paddingTop: 16,
          paddingBottom: 14,
          borderBottomWidth: StyleSheet.hairlineWidth,
          borderBottomColor: line,
          gap: 8,
        },
        brandRow: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        },
        brand: {
          fontFamily: fonts.sansSemi,
          fontSize: 10,
          letterSpacing: 1.6,
          textTransform: 'uppercase',
          color: bean,
        },
        pill: {
          paddingHorizontal: 10,
          paddingVertical: 4,
          borderRadius: 999,
          backgroundColor: dark ? 'rgba(183,208,220,0.14)' : 'rgba(28,20,16,0.06)',
        },
        pillText: {
          fontFamily: fonts.sansBold,
          fontSize: 12,
          color: ink,
        },
        title: {
          fontFamily: fonts.display,
          fontSize: 24,
          lineHeight: 30,
          color: ink,
          letterSpacing: -0.2,
        },
        subtitle: {
          fontFamily: fonts.sans,
          fontSize: 13,
          lineHeight: 18,
          color: muted,
        },
        track: {
          height: 5,
          borderRadius: 999,
          backgroundColor: empty,
          overflow: 'hidden',
          marginTop: 2,
        },
        trackFill: {
          height: '100%',
          borderRadius: 999,
          backgroundColor: bean,
        },
        body: {
          paddingHorizontal: side,
          paddingTop: 16,
          paddingBottom: 16,
          gap: 14,
          backgroundColor: shell,
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
          borderColor: emptyBorder,
          backgroundColor: empty,
        },
        stampOn: {
          borderColor: bean,
          backgroundColor: filledBg,
        },
        num: {
          fontFamily: fonts.sansSemi,
          fontSize: 12,
          color: muted,
        },
        footer: {
          alignItems: 'center',
        },
        hint: {
          fontFamily: fonts.sans,
          fontSize: 13,
          lineHeight: 18,
          color: muted,
          textAlign: 'center',
        },
        reward: {
          width: '100%',
          borderRadius: 14,
          paddingVertical: 12,
          paddingHorizontal: 14,
          backgroundColor: dark ? 'rgba(243,142,34,0.14)' : '#FFF3E5',
          borderWidth: 1,
          borderColor: palette.orange,
          gap: 2,
        },
        rewardTitle: {
          fontFamily: fonts.sansBold,
          fontSize: 14,
          color: ink,
          textAlign: 'center',
        },
        rewardHint: {
          fontFamily: fonts.sans,
          fontSize: 12,
          lineHeight: 17,
          color: muted,
          textAlign: 'center',
        },
      }),
    [
      bean,
      dark,
      empty,
      emptyBorder,
      filledBg,
      gap,
      ink,
      line,
      muted,
      punch,
      shell,
      side,
      surface,
    ],
  );

  if (!card.enabled) return null;

  return (
    <View style={styles.wrap} accessibilityRole="summary">
      <View style={styles.top}>
        <View style={styles.brandRow}>
          <Text style={styles.brand}>Roots Café Rewards</Text>
          <View style={styles.pill}>
            <Text style={styles.pillText}>
              {filled}/{slots}
            </Text>
          </View>
        </View>
        <Text style={styles.title} numberOfLines={1}>
          {card.title}
        </Text>
        <Text style={styles.subtitle} numberOfLines={2}>
          {card.subtitle}
        </Text>
        <View style={styles.track}>
          <View style={[styles.trackFill, { width: `${Math.round(progress * 100)}%` }]} />
        </View>
      </View>

      <View style={styles.body}>
        <View style={styles.grid}>
          {Array.from({ length: slots }, (_, i) => {
            const on = i < filled;
            return (
              <View
                key={`stamp-${i}`}
                style={[styles.stamp, on && styles.stampOn]}
                accessibilityLabel={
                  on ? `Stamp ${i + 1} collected` : `Stamp ${i + 1} empty`
                }
              >
                {on ? (
                  <CoffeeBean color={bean} size={punch < 46 ? 'sm' : 'md'} />
                ) : (
                  <Text style={styles.num}>{i + 1}</Text>
                )}
              </View>
            );
          })}
        </View>

        <View style={styles.footer}>
          {card.freeDrinkAvailable ? (
            <View style={styles.reward}>
              <Text style={styles.rewardTitle}>Free drink unlocked</Text>
              <Text style={styles.rewardHint}>
                Enable redeem at checkout on your next order.
              </Text>
            </View>
          ) : (
            <Text style={styles.hint}>
              {remaining <= 0
                ? 'Almost there — keep collecting.'
                : remaining === 1
                  ? '1 more order for a free drink.'
                  : `${remaining} more orders for a free drink.`}
            </Text>
          )}
        </View>
      </View>
    </View>
  );
}
