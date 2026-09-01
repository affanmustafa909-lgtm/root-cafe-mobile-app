import { Feather } from '@expo/vector-icons';
import React, { useMemo } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { fonts, radii, spacing } from '../constants/theme';
import { useAppTheme } from '../store/ThemeContext';
import type { Category } from '../types';

export type HomeSort = 'newest' | 'priceAsc' | 'priceDesc' | 'name';

type Props = {
  visible: boolean;
  onClose: () => void;
  categories: Category[];
  categoryId?: string;
  sort: HomeSort;
  onChangeCategory: (id: string | undefined) => void;
  onChangeSort: (sort: HomeSort) => void;
  onApply: () => void;
  onClear: () => void;
  title: string;
  categoryLabel: string;
  sortLabel: string;
  allLabel: string;
  applyLabel: string;
  clearLabel: string;
  sortNewest: string;
  sortPriceAsc: string;
  sortPriceDesc: string;
  sortName: string;
};

export function HomeFilterSheet({
  visible,
  onClose,
  categories,
  categoryId,
  sort,
  onChangeCategory,
  onChangeSort,
  onApply,
  onClear,
  title,
  categoryLabel,
  sortLabel,
  allLabel,
  applyLabel,
  clearLabel,
  sortNewest,
  sortPriceAsc,
  sortPriceDesc,
  sortName,
}: Props) {
  const insets = useSafeAreaInsets();
  const { cafe, colors, mode } = useAppTheme();
  const applyTextColor = mode === 'dark' ? colors.black : '#FFFFFF';

  const sorts: { id: HomeSort; label: string }[] = [
    { id: 'newest', label: sortNewest },
    { id: 'priceAsc', label: sortPriceAsc },
    { id: 'priceDesc', label: sortPriceDesc },
    { id: 'name', label: sortName },
  ];

  const styles = useMemo(
    () =>
      StyleSheet.create({
        root: {
          flex: 1,
          backgroundColor: colors.overlay,
          justifyContent: 'flex-start',
          paddingTop: insets.top + 108,
          paddingHorizontal: 20,
        },
        dropdown: {
          backgroundColor: cafe.card,
          borderRadius: radii.lg,
          borderWidth: 1,
          borderColor: cafe.border,
          maxHeight: '72%',
          overflow: 'hidden',
          shadowColor: '#000',
          shadowOpacity: 0.18,
          shadowRadius: 16,
          shadowOffset: { width: 0, height: 8 },
          elevation: 8,
        },
        header: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: spacing.md,
          paddingTop: 14,
          paddingBottom: 8,
          borderBottomWidth: StyleSheet.hairlineWidth,
          borderBottomColor: cafe.border,
        },
        title: {
          fontFamily: fonts.display,
          fontSize: 18,
          color: cafe.text,
        },
        close: {
          width: 36,
          height: 36,
          borderRadius: 18,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: cafe.bg,
        },
        body: {
          paddingHorizontal: spacing.md,
          paddingTop: 4,
        },
        label: {
          fontFamily: fonts.sansSemi,
          fontSize: 12,
          letterSpacing: 0.6,
          textTransform: 'uppercase',
          color: cafe.textMuted,
          marginTop: 12,
          marginBottom: 10,
        },
        option: {
          minHeight: 46,
          borderRadius: radii.md,
          borderWidth: 1,
          borderColor: cafe.border,
          backgroundColor: cafe.bg,
          paddingHorizontal: 14,
          marginBottom: 8,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        },
        optionOn: {
          borderColor: cafe.orange,
          backgroundColor: colors.coralMuted,
        },
        optionText: {
          fontFamily: fonts.sansSemi,
          fontSize: 15,
          color: cafe.text,
        },
        footer: {
          flexDirection: 'row',
          gap: 10,
          paddingHorizontal: spacing.md,
          paddingTop: 12,
          paddingBottom: 14,
          borderTopWidth: StyleSheet.hairlineWidth,
          borderTopColor: cafe.border,
        },
        clearBtn: {
          flex: 1,
          minHeight: 48,
          borderRadius: radii.md,
          borderWidth: 1,
          borderColor: cafe.border,
          backgroundColor: cafe.bg,
          alignItems: 'center',
          justifyContent: 'center',
        },
        clearText: {
          fontFamily: fonts.sansSemi,
          fontSize: 15,
          color: cafe.text,
        },
        applyBtn: {
          flex: 1.2,
          minHeight: 48,
          borderRadius: radii.md,
          backgroundColor: cafe.orange,
          alignItems: 'center',
          justifyContent: 'center',
        },
        applyText: {
          fontFamily: fonts.sansBold,
          fontSize: 15,
          color: applyTextColor,
        },
      }),
    [cafe, colors, insets.top, applyTextColor],
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.root} onPress={onClose}>
        <Pressable
          style={styles.dropdown}
          onPress={(e) => e.stopPropagation()}
        >
          <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>
            <Pressable
              style={styles.close}
              onPress={onClose}
              accessibilityRole="button"
            >
              <Feather name="x" size={18} color={cafe.text} />
            </Pressable>
          </View>

          <ScrollView
            style={styles.body}
            bounces={false}
            showsVerticalScrollIndicator={false}
            nestedScrollEnabled
          >
            <Text style={styles.label}>{categoryLabel}</Text>
            <Pressable
              style={[styles.option, !categoryId && styles.optionOn]}
              onPress={() => onChangeCategory(undefined)}
            >
              <Text style={styles.optionText}>{allLabel}</Text>
              {!categoryId ? (
                <Feather name="check" size={16} color={cafe.orange} />
              ) : null}
            </Pressable>
            {categories.map((category) => {
              const selected = categoryId === category.id;
              return (
                <Pressable
                  key={category.id}
                  style={[styles.option, selected && styles.optionOn]}
                  onPress={() => onChangeCategory(category.id)}
                >
                  <Text style={styles.optionText}>{category.name}</Text>
                  {selected ? (
                    <Feather name="check" size={16} color={cafe.orange} />
                  ) : null}
                </Pressable>
              );
            })}

            <Text style={styles.label}>{sortLabel}</Text>
            {sorts.map((item) => {
              const selected = sort === item.id;
              return (
                <Pressable
                  key={item.id}
                  style={[styles.option, selected && styles.optionOn]}
                  onPress={() => onChangeSort(item.id)}
                >
                  <Text style={styles.optionText}>{item.label}</Text>
                  {selected ? (
                    <Feather name="check" size={16} color={cafe.orange} />
                  ) : null}
                </Pressable>
              );
            })}
            <View style={{ height: 8 }} />
          </ScrollView>

          <View style={styles.footer}>
            <Pressable style={styles.clearBtn} onPress={onClear}>
              <Text style={styles.clearText}>{clearLabel}</Text>
            </Pressable>
            <Pressable style={styles.applyBtn} onPress={onApply}>
              <Text style={styles.applyText}>{applyLabel}</Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
