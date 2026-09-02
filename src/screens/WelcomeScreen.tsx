import { Image } from 'expo-image';
import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { fonts } from '../constants/theme';
import { useOnboarding } from '../hooks/useMenu';
import { mediaUrl } from '../services/api';
import type { OnboardingSlide } from '../services/api/onboardingApi';

const ORANGE = '#FAFAF8';
const AUTO_MS = 2500;
const SHADOW_STEPS = [0.02, 0.05, 0.1, 0.16, 0.24, 0.34, 0.46];
const FALLBACK_SLIDES = [
  require('../../assets/welcome/brew.png'),
  require('../../assets/welcome/joy.png'),
];

type Props = {
  onGetStarted: () => void;
};

function alignStyle(align: string) {
  if (align === 'left') return 'left' as const;
  if (align === 'right') return 'right' as const;
  return 'center' as const;
}

function copyBlockStyle(vertical: string, insetsBottom: number) {
  const base = { position: 'absolute' as const, left: 28, right: 28 };
  if (vertical === 'top') {
    return { ...base, top: 120 };
  }
  if (vertical === 'middle') {
    return { ...base, top: '42%' as const };
  }
  return { ...base, bottom: Math.max(insetsBottom, 16) + 118 };
}

function SlideBackground({
  imageUri,
  fallbackSource,
  width,
  height,
}: {
  imageUri?: string;
  fallbackSource: number;
  width: number;
  height: number;
}) {
  const [failed, setFailed] = useState(false);
  const source = imageUri && !failed ? { uri: imageUri } : fallbackSource;

  return (
    <Image
      source={source}
      style={{ width, height }}
      contentFit="cover"
      cachePolicy="memory-disk"
      transition={200}
      pointerEvents="none"
      onError={() => setFailed(true)}
    />
  );
}

export function WelcomeScreen({ onGetStarted }: Props) {
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const { data, isLoading } = useOnboarding();
  const listRef = useRef<FlatList<OnboardingSlide>>(null);
  const indexRef = useRef(0);
  const [index, setIndex] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const slides = useMemo(
    () => (data?.slides ?? []).filter((s) => s.isActive),
    [data?.slides],
  );
  const ctaText = data?.ctaText ?? 'Get Started';
  const footerReserve = Math.max(insets.bottom, 18) + 100;

  const goTo = useCallback(
    (next: number, animated = true) => {
      if (!slides.length) return;
      const clamped = ((next % slides.length) + slides.length) % slides.length;
      indexRef.current = clamped;
      setIndex(clamped);
      listRef.current?.scrollToOffset({ offset: clamped * width, animated });
    },
    [slides.length, width],
  );

  const startTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (slides.length <= 1) return;
    timerRef.current = setInterval(() => {
      goTo(indexRef.current + 1);
    }, AUTO_MS);
  }, [goTo, slides.length]);

  useEffect(() => {
    startTimer();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [startTimer]);

  const onMomentumEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const next = Math.round(event.nativeEvent.contentOffset.x / width);
    indexRef.current = next;
    setIndex(next);
    startTimer();
  };

  if (isLoading) {
    return (
      <View style={[styles.root, styles.centered]}>
        <StatusBar style="light" />
        <ActivityIndicator color="#FFFFFF" />
      </View>
    );
  }

  if (!slides.length) {
    return (
      <View style={[styles.root, styles.centered]}>
        <StatusBar style="light" />
        <Text style={styles.fallbackTitle}>Roots Café</Text>
        <Text style={styles.fallbackBody}>Specialty coffee, ordered ahead.</Text>
        <Pressable
          accessibilityRole="button"
          onPress={onGetStarted}
          style={[styles.cta, { marginTop: 24, alignSelf: 'stretch', marginHorizontal: 20 }]}
        >
          <Text style={styles.ctaText}>{ctaText}</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <FlatList
        ref={listRef}
        data={slides}
        keyExtractor={(item) => item.id}
        style={styles.slider}
        horizontal
        pagingEnabled
        bounces={false}
        showsHorizontalScrollIndicator={false}
        extraData={width}
        getItemLayout={(_, i) => ({
          length: width,
          offset: width * i,
          index: i,
        })}
        onScrollBeginDrag={() => {
          if (timerRef.current) clearInterval(timerRef.current);
        }}
        onMomentumScrollEnd={onMomentumEnd}
        renderItem={({ item, index: slideIndex }) => {
          const imageUri = mediaUrl(item.imageUrl);
          const fallbackSource =
            FALLBACK_SLIDES[slideIndex] ?? FALLBACK_SLIDES[0];
          const titleAlign = alignStyle(item.titleAlign);
          const bodyAlign = alignStyle(item.bodyAlign);
          const copyStyle = copyBlockStyle(item.copyBlockVertical, insets.bottom);
          const slideHeight = Math.max(320, height - footerReserve);

          return (
            <View style={{ width, height: slideHeight, overflow: 'hidden' }}>
              <SlideBackground
                imageUri={imageUri}
                fallbackSource={fallbackSource}
                width={width}
                height={slideHeight}
              />
              {item.showBottomShadow ? (
                <View pointerEvents="none" style={styles.bottomShadow}>
                  {SHADOW_STEPS.map((opacity, step) => (
                    <View
                      key={step}
                      style={[
                        styles.shadowBand,
                        { backgroundColor: `rgba(0,0,0,${opacity})` },
                      ]}
                    />
                  ))}
                </View>
              ) : null}
              {item.titlePlacement === 'top' ? (
                <Text
                  pointerEvents="none"
                  style={[
                    styles.title,
                    styles.titleTop,
                    {
                      paddingTop: insets.top + 36,
                      textAlign: titleAlign,
                    },
                  ]}
                >
                  {item.title}
                </Text>
              ) : null}
              <View pointerEvents="none" style={copyStyle}>
                {item.titlePlacement === 'bottom' ? (
                  <Text style={[styles.title, { textAlign: titleAlign }]}>
                    {item.title}
                  </Text>
                ) : null}
                <Text style={[styles.body, { textAlign: bodyAlign }]}>
                  {item.body}
                </Text>
              </View>
            </View>
          );
        }}
      />

      <View
        style={[
          styles.footerDock,
          { paddingBottom: Math.max(insets.bottom, 18) },
        ]}
      >
        <View style={styles.dots} accessibilityRole="adjustable">
          {slides.map((slide, i) => (
            <View
              key={slide.id}
              style={[styles.dot, i === index && styles.dotOn]}
            />
          ))}
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={ctaText}
          onPress={onGetStarted}
          hitSlop={12}
          style={styles.cta}
        >
          <Text style={styles.ctaText}>{ctaText}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#1A0F0A' },
  centered: { alignItems: 'center', justifyContent: 'center', padding: 24 },
  slider: { flex: 1 },
  bottomShadow: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '38%',
    justifyContent: 'flex-end',
  },
  shadowBand: { flex: 1 },
  titleTop: {
    position: 'absolute',
    left: 28,
    right: 28,
  },
  title: {
    color: '#FFFFFF',
    fontFamily: fonts.sansBold,
    fontSize: 28,
    lineHeight: 34,
    letterSpacing: -0.3,
    textShadowColor: 'rgba(0,0,0,0.45)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 8,
  },
  body: {
    color: '#FFFFFF',
    fontFamily: fonts.sans,
    fontSize: 15,
    lineHeight: 22,
    marginTop: 10,
    textShadowColor: 'rgba(0,0,0,0.45)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 8,
  },
  fallbackTitle: {
    color: '#FFFFFF',
    fontFamily: fonts.sansBold,
    fontSize: 32,
    marginBottom: 8,
  },
  fallbackBody: {
    color: 'rgba(255,255,255,0.8)',
    fontFamily: fonts.sans,
    fontSize: 16,
    textAlign: 'center',
  },
  footer: {
    position: 'absolute',
    left: 20,
    right: 20,
    bottom: 0,
    alignItems: 'center',
    gap: 18,
    zIndex: 50,
    elevation: 50,
  },
  footerDock: {
    paddingHorizontal: 20,
    paddingTop: 12,
    alignItems: 'center',
    gap: 18,
    backgroundColor: 'rgba(10, 8, 6, 0.55)',
  },
  dots: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.55)',
  },
  dotOn: {
    width: 28,
    backgroundColor: ORANGE,
  },
  cta: {
    alignSelf: 'stretch',
    minHeight: 56,
    borderRadius: 999,
    backgroundColor: ORANGE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaText: {
    color: '#0A0A0A',
    fontFamily: fonts.sansSemi,
    fontSize: 17,
    letterSpacing: 0.2,
  },
});
