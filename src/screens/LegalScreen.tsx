import React, { useMemo } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Card } from '../components/Card';
import { spacing, typography } from '../constants/theme';
import { useAppSettings } from '../hooks/useMenu';
import { useAppTheme } from '../store/ThemeContext';

export type LegalDocType = 'impressum' | 'terms' | 'privacy';

type Props = {
  type: LegalDocType;
};

export function LegalScreen({ type }: Props) {
  const { t } = useTranslation();
  const { colors } = useAppTheme();
  const settings = useAppSettings();

  const title =
    type === 'impressum'
      ? t('legal.impressum')
      : type === 'terms'
        ? t('auth.terms')
        : t('auth.privacy');

  const body = useMemo(() => {
    const legal = settings.data?.legal;
    if (!legal) return null;
    if (type === 'impressum') return legal.impressum;
    if (type === 'terms') return legal.terms;
    return legal.privacy;
  }, [settings.data?.legal, type]);

  return (
    <ScrollView
      style={[styles.flex, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
    >
      <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
      <Card>
        {settings.isPending ? (
          <View style={styles.loading}>
            <ActivityIndicator color={colors.sky} />
          </View>
        ) : (
          <Text
            selectable
            style={[styles.body, { color: colors.textMuted }]}
          >
            {body?.trim() ? body : t('legal.placeholder')}
          </Text>
        )}
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { padding: spacing.lg, paddingBottom: 40 },
  title: { ...typography.h1, marginBottom: 16 },
  body: { ...typography.body, lineHeight: 24 },
  loading: { paddingVertical: 24, alignItems: 'center' },
});
