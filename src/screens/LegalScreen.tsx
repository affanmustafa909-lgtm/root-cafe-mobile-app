import React from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Card } from '../components/Card';
import { LEGAL_URLS } from '../constants/config';
import { spacing, typography } from '../constants/theme';
import { useAppTheme } from '../store/ThemeContext';

type Props = {
  type: 'terms' | 'privacy';
};

export function LegalScreen({ type }: Props) {
  const { t } = useTranslation();
  const { colors } = useAppTheme();
  const title = type === 'terms' ? t('auth.terms') : t('auth.privacy');
  const url = type === 'terms' ? LEGAL_URLS.terms : LEGAL_URLS.privacy;

  return (
    <ScrollView
      style={[styles.flex, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
    >
      <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
      <Card>
        <Text style={[styles.body, { color: colors.textMuted }]}>
          {url ? `${t('legal.pendingUrl')}\n${url}` : t('legal.placeholder')}
        </Text>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { padding: spacing.lg, paddingBottom: 40 },
  title: { ...typography.h1, marginBottom: 16 },
  body: { ...typography.body, lineHeight: 24 },
});
