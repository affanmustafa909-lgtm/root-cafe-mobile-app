import React, { useCallback, useEffect, useRef } from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
  type ViewStyle,
} from 'react-native';
import { Chip } from './Chip';

type Category = {
  id: string;
  name: string;
};

type Props = {
  categories: Category[];
  selectedId?: string;
  onSelect: (categoryId?: string) => void;
  allLabel: string;
  style?: ViewStyle;
  contentContainerStyle?: ViewStyle;
};

const ALL_KEY = '__all__';

export function CategoryChipBar({
  categories,
  selectedId,
  onSelect,
  allLabel,
  style,
  contentContainerStyle,
}: Props) {
  const scrollRef = useRef<ScrollView>(null);
  const chipLayouts = useRef<Record<string, { x: number; width: number }>>({});
  const viewportWidth = useRef(0);

  const scrollToKey = useCallback((key: string) => {
    const layout = chipLayouts.current[key];
    if (!layout || !scrollRef.current) return;
    const target =
      layout.x - viewportWidth.current / 2 + layout.width / 2;
    scrollRef.current.scrollTo({
      x: Math.max(0, target),
      animated: true,
    });
  }, []);

  const select = useCallback(
    (id?: string) => {
      onSelect(id);
      scrollToKey(id ?? ALL_KEY);
    },
    [onSelect, scrollToKey],
  );

  useEffect(() => {
    const key = selectedId ?? ALL_KEY;
    const timer = setTimeout(() => scrollToKey(key), 50);
    return () => clearTimeout(timer);
  }, [selectedId, categories, scrollToKey]);

  const rememberLayout = (key: string, x: number, width: number) => {
    chipLayouts.current[key] = { x, width };
  };

  return (
    <ScrollView
      ref={scrollRef}
      horizontal
      nestedScrollEnabled
      bounces
      alwaysBounceHorizontal={false}
      overScrollMode="never"
      showsHorizontalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      directionalLockEnabled
      style={style}
      contentContainerStyle={[styles.content, contentContainerStyle]}
      onLayout={(event) => {
        viewportWidth.current = event.nativeEvent.layout.width;
      }}
    >
      <View
        style={styles.chipWrap}
        onLayout={(event) => {
          const { x, width } = event.nativeEvent.layout;
          rememberLayout(ALL_KEY, x, width);
        }}
      >
        <Chip
          tone="cafe"
          label={allLabel}
          selected={!selectedId}
          onPress={() => select(undefined)}
          style={styles.chip}
        />
      </View>
      {categories.map((category) => (
        <View
          key={category.id}
          style={styles.chipWrap}
          onLayout={(event) => {
            const { x, width } = event.nativeEvent.layout;
            rememberLayout(category.id, x, width);
          }}
        >
          <Chip
            tone="cafe"
            label={category.name}
            selected={selectedId === category.id}
            onPress={() => select(category.id)}
            style={styles.chip}
          />
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    alignItems: 'center',
    paddingRight: 20,
  },
  chipWrap: {
    flexShrink: 0,
  },
  chip: {
    marginRight: 8,
  },
});
