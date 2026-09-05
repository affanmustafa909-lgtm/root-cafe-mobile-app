import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { duration, easing, useReducedMotion } from '../constants/motion';
import { resolveProductImageSource } from '../assets/products/productImages';
import { ImagePlaceholder } from './ImagePlaceholder';
import { mediaUrl } from '../services/api';
import { useAppTheme } from '../store/ThemeContext';
import type { Product } from '../types';
import { formatPrice, productSale } from '../utils/pricing';

function SaleRibbon({
  badge,
  percent,
  compact,
}: {
  badge: 'discount' | 'topSale';
  percent?: number | null;
  compact?: boolean;
}) {
  const { t } = useTranslation();
  const { colors, typography } = useAppTheme();
  const discount = badge === 'discount';
  const lines = discount ? [`${percent ?? 0}%`, 'OFF'] : ['TOP', 'SALE'];
  const tone = discount ? '#D4537A' : colors.navy;
  return (
    <View
      style={styles.ribbonWrap}
      accessibilityLabel={
        discount
          ? t('product.percentOff', { n: percent ?? 0 })
          : t('product.topSale')
      }
    >
      <View
        style={[
          styles.ribbon,
          compact && styles.ribbonCompact,
          { backgroundColor: tone },
        ]}
      >
        {lines.map((line) => (
          <Text
            key={line}
            style={[
              {
                color: '#FFFFFF',
                fontFamily: typography.small.fontFamily,
                fontSize: compact ? 7 : 8,
                lineHeight: compact ? 8 : 10,
                letterSpacing: 0.4,
                fontWeight: '700',
              },
            ]}
          >
            {line}
          </Text>
        ))}
      </View>
      <View
        style={[
          styles.ribbonTail,
          compact && styles.ribbonTailCompact,
          { borderTopColor: tone },
        ]}
      />
    </View>
  );
}

type Props = {
  product: Product;
  onPress: () => void;
  variant?: 'grid' | 'list';
};

export function ProductCard({ product, onPress, variant = 'list' }: Props) {
  const { t } = useTranslation();
  const { cafe, colors, cafeShadow, typography, mode } = useAppTheme();
  const accentIcon = mode === 'dark' ? colors.black : '#FFFFFF';
  const soldOut = product.soldOut || product.isSoldOut;
  const sale = productSale(product);
  const remote = mediaUrl(product.imageUrl);
  const imageSource = resolveProductImageSource(
    product.name,
    product.imageUrl,
    remote,
  );
  const [imageFailed, setImageFailed] = useState(false);
  useEffect(() => {
    setImageFailed(false);
  }, [product.id, product.imageUrl]);
  const showPhoto = Boolean(imageSource) && !imageFailed;
  const reduced = useReducedMotion();
  const lift = useRef(new Animated.Value(0)).current;
  const zoom = useRef(new Animated.Value(1)).current;

  const styles = useMemo(
    () =>
      StyleSheet.create({
        image: { width: '100%', height: '100%' },
        gridPress: { flex: 1 },
        gridCard: {
          backgroundColor: cafe.card,
          borderRadius: 20,
          overflow: 'hidden',
          marginBottom: 14,
          ...cafeShadow,
        },
        gridImageWrap: {
          height: 132,
          backgroundColor: cafe.peachSoft,
          overflow: 'hidden',
        },
        gridBody: {
          paddingHorizontal: 12,
          paddingTop: 10,
          paddingBottom: 12,
          gap: 8,
        },
        gridName: {
          fontFamily: typography.h3.fontFamily,
          fontSize: 15,
          lineHeight: 20,
          color: cafe.text,
        },
        gridRow: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        },
        gridPrice: {
          fontFamily: typography.bodyBold.fontFamily,
          fontSize: 16,
          color: colors.sky,
        },
        priceCol: {
          flexDirection: 'row',
          alignItems: 'baseline',
          gap: 6,
          flexShrink: 1,
        },
        strike: {
          fontFamily: typography.caption.fontFamily,
          fontSize: 12,
          color: colors.textTertiary,
          textDecorationLine: 'line-through',
        },
        arrowBtn: {
          width: 28,
          height: 28,
          borderRadius: 999,
          backgroundColor: colors.coral,
          alignItems: 'center',
          justifyContent: 'center',
        },
        badge: {
          position: 'absolute',
          top: 10,
          left: 10,
          backgroundColor: cafe.badgeOff,
          borderRadius: 6,
          paddingHorizontal: 8,
          paddingVertical: 3,
        },
        badgeText: {
          color: '#FFFFFF',
          fontFamily: typography.small.fontFamily,
          fontSize: 9,
          letterSpacing: 0.4,
        },
        listCard: {
          backgroundColor: cafe.card,
          borderRadius: 18,
          marginBottom: 14,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 14,
          padding: 10,
          borderWidth: 1,
          borderColor: cafe.border,
          ...cafeShadow,
        },
        listImageWrap: {
          width: 96,
          height: 96,
          borderRadius: 16,
          backgroundColor: cafe.peachSoft,
          overflow: 'hidden',
        },
        listBody: {
          flex: 1,
          gap: 4,
          justifyContent: 'center',
          paddingRight: 4,
          minHeight: 96,
        },
        listName: {
          fontFamily: typography.h3.fontFamily,
          fontSize: 16,
          lineHeight: 21,
          color: cafe.text,
        },
        listDesc: {
          fontFamily: typography.caption.fontFamily,
          fontSize: 13,
          lineHeight: 18,
          color: cafe.textMuted,
        },
        listRow: {
          marginTop: 6,
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        },
        listPrice: {
          fontFamily: typography.bodyBold.fontFamily,
          fontSize: 16,
          color: colors.sky,
        },
        addBtn: {
          width: 32,
          height: 32,
          borderRadius: 999,
          backgroundColor: colors.coral,
          alignItems: 'center',
          justifyContent: 'center',
        },
        soldLabel: {
          fontFamily: typography.small.fontFamily,
          fontSize: 11,
          color: cafe.badgeOff,
        },
      }),
    [cafe, cafeShadow, colors, typography],
  );

  const pressIn = () => {
    if (reduced) return;
    Animated.parallel([
      Animated.timing(lift, {
        toValue: -3,
        duration: duration.fast,
        easing,
        useNativeDriver: true,
      }),
      Animated.timing(zoom, {
        toValue: 1.04,
        duration: duration.slow,
        easing,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const pressOut = () => {
    Animated.parallel([
      Animated.timing(lift, {
        toValue: 0,
        duration: duration.fast,
        easing,
        useNativeDriver: true,
      }),
      Animated.timing(zoom, {
        toValue: 1,
        duration: duration.slow,
        easing,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const photo = showPhoto ? (
    <Animated.View style={{ flex: 1, transform: [{ scale: zoom }] }}>
      <Image
        source={imageSource!}
        style={styles.image}
        contentFit="cover"
        transition={100}
        cachePolicy="memory-disk"
        recyclingKey={product.id}
        accessibilityIgnoresInvertColors
        onError={() => setImageFailed(true)}
      />
    </Animated.View>
  ) : (
    <ImagePlaceholder
      id={product.id}
      label={product.name.slice(0, 2).toUpperCase()}
      style={{ flex: 1, width: '100%', height: '100%' }}
    />
  );

  if (variant === 'grid') {
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={product.name}
        onPress={onPress}
        onPressIn={pressIn}
        onPressOut={pressOut}
        style={styles.gridPress}
      >
        <Animated.View
          style={[styles.gridCard, { transform: [{ translateY: lift }] }]}
        >
          <View style={styles.gridImageWrap}>
            {photo}
            {sale.badge ? (
              <SaleRibbon badge={sale.badge} percent={sale.percent} />
            ) : null}
            {soldOut ? (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{t('common.soldOut')}</Text>
              </View>
            ) : null}
          </View>
          <View style={styles.gridBody}>
            <Text style={styles.gridName} numberOfLines={1}>
              {product.name}
            </Text>
            <View style={styles.gridRow}>
              <View style={styles.priceCol}>
                <Text style={styles.gridPrice}>
                  {formatPrice(product.price)}
                </Text>
                {sale.compareAt ? (
                  <Text style={styles.strike}>
                    {formatPrice(sale.compareAt)}
                  </Text>
                ) : null}
              </View>
              <View style={styles.arrowBtn}>
                <Feather name="arrow-right" size={14} color={accentIcon} />
              </View>
            </View>
          </View>
        </Animated.View>
      </Pressable>
    );
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={product.name}
      onPress={onPress}
      onPressIn={pressIn}
      onPressOut={pressOut}
    >
      <Animated.View
        style={[styles.listCard, { transform: [{ translateY: lift }] }]}
      >
        <View style={styles.listImageWrap}>{photo}
          {sale.badge ? (
            <SaleRibbon compact badge={sale.badge} percent={sale.percent} />
          ) : null}
        </View>
        <View style={styles.listBody}>
          <Text style={styles.listName} numberOfLines={1}>
            {product.name}
          </Text>
          {product.description ? (
            <Text style={styles.listDesc} numberOfLines={2}>
              {product.description}
            </Text>
          ) : null}
          <View style={styles.listRow}>
            <View style={styles.priceCol}>
              <Text style={styles.listPrice}>{formatPrice(product.price)}</Text>
              {sale.compareAt ? (
                <Text style={styles.strike}>{formatPrice(sale.compareAt)}</Text>
              ) : null}
            </View>
            {soldOut ? (
              <Text style={styles.soldLabel}>{t('common.soldOut')}</Text>
            ) : (
              <View style={styles.addBtn}>
                <Feather name="plus" size={16} color={accentIcon} />
              </View>
            )}
          </View>
        </View>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  ribbonWrap: {
    position: 'absolute',
    top: 0,
    left: 10,
    alignItems: 'center',
    zIndex: 2,
  },
  ribbon: {
    minWidth: 28,
    paddingHorizontal: 5,
    paddingTop: 7,
    paddingBottom: 4,
    alignItems: 'center',
  },
  ribbonCompact: {
    minWidth: 22,
    paddingHorizontal: 3,
    paddingTop: 5,
    paddingBottom: 2,
  },
  ribbonTail: {
    width: 0,
    height: 0,
    borderLeftWidth: 14,
    borderRightWidth: 14,
    borderTopWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },
  ribbonTailCompact: {
    borderLeftWidth: 11,
    borderRightWidth: 11,
    borderTopWidth: 6,
  },
});
