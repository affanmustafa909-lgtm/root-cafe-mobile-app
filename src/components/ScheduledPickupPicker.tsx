import React, { useMemo, useState } from 'react';
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { fonts, radii, spacing } from '../constants/theme';
import { useAppTheme } from '../store/ThemeContext';

const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'] as const;

function parseYmd(value: string): Date {
  const [y, m, d] = value.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function toYmd(date: Date): string {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function formatDisplayDate(value?: string) {
  if (!value) return 'Select date';
  const d = parseYmd(value);
  return d.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

type Props = {
  dates: string[];
  slots: string[];
  pickupDate?: string;
  pickupTime?: string;
  onChangeDate: (date: string) => void;
  onChangeTime: (time: string | undefined) => void;
  /** After time is chosen — advance to next checkout step */
  onContinueNext?: () => void;
  dateLabel: string;
  timeLabel: string;
};

export function ScheduledPickupPicker({
  dates,
  slots,
  pickupDate,
  pickupTime,
  onChangeDate,
  onChangeTime,
  onContinueNext,
  dateLabel,
  timeLabel,
}: Props) {
  const { colors, typography } = useAppTheme();
  const allowed = useMemo(() => new Set(dates), [dates]);
  const minDate = dates[0] ? parseYmd(dates[0]) : new Date();
  const maxDate = dates.length
    ? parseYmd(dates[dates.length - 1])
    : new Date();

  const [cursor, setCursor] = useState(() =>
    pickupDate ? parseYmd(pickupDate) : minDate,
  );
  const [timeOpen, setTimeOpen] = useState(false);

  const pickDate = (ymd: string) => {
    onChangeDate(ymd);
    // Re-pick time whenever date changes
    if (pickupDate !== ymd) {
      onChangeTime(undefined);
    }
    // Open time sheet on the next frame so date state commits first
    requestAnimationFrame(() => setTimeOpen(true));
  };

  const pickTime = (slot: string) => {
    onChangeTime(slot);
    setTimeOpen(false);
    requestAnimationFrame(() => onContinueNext?.());
  };

  const year = cursor.getFullYear();
  const month = cursor.getMonth();

  const cells = useMemo(() => {
    const first = new Date(year, month, 1);
    const startPad = first.getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const list: Array<{ key: string; day?: number; ymd?: string }> = [];
    for (let i = 0; i < startPad; i += 1) {
      list.push({ key: `pad-${i}` });
    }
    for (let day = 1; day <= daysInMonth; day += 1) {
      const ymd = toYmd(new Date(year, month, day));
      list.push({ key: ymd, day, ymd });
    }
    while (list.length % 7 !== 0) {
      list.push({ key: `trail-${list.length}` });
    }
    return list;
  }, [year, month]);

  const canPrev =
    year > minDate.getFullYear() ||
    (year === minDate.getFullYear() && month > minDate.getMonth());
  const canNext =
    year < maxDate.getFullYear() ||
    (year === maxDate.getFullYear() && month < maxDate.getMonth());

  const styles = useMemo(
    () =>
      StyleSheet.create({
        block: { marginTop: 4 },
        label: {
          ...typography.label,
          marginBottom: 8,
          color: colors.textSecondary,
        },
        calendar: {
          backgroundColor: colors.panel,
          borderRadius: radii.lg,
          borderWidth: 1,
          borderColor: colors.border,
          padding: spacing.md,
        },
        monthRow: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 12,
        },
        monthTitle: {
          fontFamily: fonts.display,
          fontSize: 17,
          color: colors.text,
        },
        navBtn: {
          width: 40,
          height: 40,
          borderRadius: 20,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: colors.elevated,
        },
        navDisabled: { opacity: 0.35 },
        weekRow: {
          flexDirection: 'row',
          marginBottom: 6,
        },
        weekCell: {
          flex: 1,
          alignItems: 'center',
          paddingVertical: 4,
        },
        weekText: {
          fontFamily: fonts.sansSemi,
          fontSize: 11,
          letterSpacing: 0.4,
          color: colors.textTertiary,
        },
        grid: { flexDirection: 'row', flexWrap: 'wrap' },
        dayCell: {
          width: `${100 / 7}%` as `${number}%`,
          aspectRatio: 1,
          alignItems: 'center',
          justifyContent: 'center',
          padding: 2,
        },
        dayBtn: {
          width: '100%',
          aspectRatio: 1,
          maxWidth: 44,
          borderRadius: 22,
          alignItems: 'center',
          justifyContent: 'center',
        },
        dayOn: {
          backgroundColor: colors.coralMuted,
          borderWidth: 1,
          borderColor: colors.coral,
        },
        dayText: {
          fontFamily: fonts.sansSemi,
          fontSize: 14,
          color: colors.text,
        },
        dayMuted: { color: colors.textTertiary },
        dayDisabled: { opacity: 0.45 },
        selectedSummary: {
          marginTop: 10,
          fontFamily: fonts.sans,
          fontSize: 13,
          color: colors.textSecondary,
        },
        dropdown: {
          marginTop: 4,
          minHeight: 52,
          borderRadius: radii.md,
          borderWidth: 1,
          borderColor: colors.border,
          backgroundColor: colors.panel,
          paddingHorizontal: 14,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        },
        dropdownOn: {
          borderColor: colors.coral,
          backgroundColor: colors.coralMuted,
        },
        dropdownText: {
          fontFamily: fonts.sansSemi,
          fontSize: 16,
          color: colors.text,
        },
        dropdownPlaceholder: {
          color: colors.textTertiary,
        },
        modalRoot: {
          flex: 1,
          backgroundColor: colors.overlay,
          justifyContent: 'flex-end',
        },
        sheet: {
          backgroundColor: colors.panel,
          borderTopLeftRadius: radii.lg,
          borderTopRightRadius: radii.lg,
          borderTopWidth: 1,
          borderColor: colors.border,
          maxHeight: '58%',
          paddingBottom: spacing.lg,
        },
        sheetHandle: {
          alignSelf: 'center',
          width: 40,
          height: 4,
          borderRadius: 2,
          backgroundColor: colors.borderStrong,
          marginTop: 10,
          marginBottom: 8,
        },
        sheetTitle: {
          fontFamily: fonts.display,
          fontSize: 18,
          color: colors.text,
          paddingHorizontal: spacing.md,
          marginBottom: 8,
        },
        slotRow: {
          minHeight: 52,
          paddingHorizontal: spacing.md,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottomWidth: StyleSheet.hairlineWidth,
          borderBottomColor: colors.border,
        },
        slotRowOn: {
          backgroundColor: colors.coralMuted,
        },
        slotText: {
          fontFamily: fonts.sansSemi,
          fontSize: 16,
          color: colors.text,
        },
      }),
    [colors, typography],
  );

  const monthLabel = cursor.toLocaleDateString(undefined, {
    month: 'long',
    year: 'numeric',
  });

  return (
    <View>
      <View style={styles.block}>
        <Text style={styles.label}>{dateLabel}</Text>
        <View style={styles.calendar}>
          <View style={styles.monthRow}>
            <Pressable
              style={[styles.navBtn, !canPrev && styles.navDisabled]}
              disabled={!canPrev}
              onPress={() =>
                setCursor(new Date(year, month - 1, 1))
              }
              accessibilityRole="button"
              accessibilityLabel="Previous month"
            >
              <Ionicons name="chevron-back" size={18} color={colors.text} />
            </Pressable>
            <Text style={styles.monthTitle}>{monthLabel}</Text>
            <Pressable
              style={[styles.navBtn, !canNext && styles.navDisabled]}
              disabled={!canNext}
              onPress={() =>
                setCursor(new Date(year, month + 1, 1))
              }
              accessibilityRole="button"
              accessibilityLabel="Next month"
            >
              <Ionicons name="chevron-forward" size={18} color={colors.text} />
            </Pressable>
          </View>

          <View style={styles.weekRow}>
            {WEEKDAYS.map((d) => (
              <View key={d} style={styles.weekCell}>
                <Text style={styles.weekText}>{d}</Text>
              </View>
            ))}
          </View>

          <View style={styles.grid}>
            {cells.map((cell) => {
              if (!cell.day || !cell.ymd) {
                return <View key={cell.key} style={styles.dayCell} />;
              }
              const enabled = allowed.has(cell.ymd);
              const selected = pickupDate === cell.ymd;
              return (
                <View key={cell.key} style={styles.dayCell}>
                  <Pressable
                    style={[
                      styles.dayBtn,
                      selected && styles.dayOn,
                      !enabled && styles.dayDisabled,
                    ]}
                    disabled={!enabled}
                    onPress={() => pickDate(cell.ymd!)}
                    accessibilityRole="button"
                    accessibilityState={{ selected, disabled: !enabled }}
                  >
                    <Text
                      style={[
                        styles.dayText,
                        !enabled && styles.dayMuted,
                      ]}
                    >
                      {cell.day}
                    </Text>
                  </Pressable>
                </View>
              );
            })}
          </View>

          <Text style={styles.selectedSummary}>
            {formatDisplayDate(pickupDate)}
          </Text>
        </View>
      </View>

      <View style={[styles.block, { marginTop: 16 }]}>
        <Text style={styles.label}>{timeLabel}</Text>
        <Pressable
          style={[styles.dropdown, pickupTime ? styles.dropdownOn : null]}
          onPress={() => setTimeOpen(true)}
          accessibilityRole="button"
          accessibilityLabel={timeLabel}
        >
          <Text
            style={[
              styles.dropdownText,
              !pickupTime && styles.dropdownPlaceholder,
            ]}
          >
            {pickupTime ?? 'Select time'}
          </Text>
          <Ionicons
            name="chevron-down"
            size={18}
            color={colors.textMuted}
          />
        </Pressable>
      </View>

      <Modal
        visible={timeOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setTimeOpen(false)}
      >
        <Pressable style={styles.modalRoot} onPress={() => setTimeOpen(false)}>
          <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetTitle}>{timeLabel}</Text>
            <FlatList
              data={slots}
              keyExtractor={(item) => item}
              renderItem={({ item }) => {
                const selected = pickupTime === item;
                return (
                  <Pressable
                    style={[styles.slotRow, selected && styles.slotRowOn]}
                    onPress={() => pickTime(item)}
                    accessibilityRole="button"
                    accessibilityState={{ selected }}
                  >
                    <Text style={styles.slotText}>{item}</Text>
                    {selected ? (
                      <Ionicons
                        name="checkmark"
                        size={18}
                        color={colors.text}
                      />
                    ) : null}
                  </Pressable>
                );
              }}
            />
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}
