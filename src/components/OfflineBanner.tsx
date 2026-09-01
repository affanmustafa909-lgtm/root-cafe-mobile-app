import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNetworkStatus } from '../hooks/useNetworkStatus';
import { typography } from '../constants/theme';
import { useAppTheme } from '../store/ThemeContext';

export function OfflineBanner() {
  const { t } = useTranslation();
  const { colors } = useAppTheme();
  const { isOffline } = useNetworkStatus();
  const insets = useSafeAreaInsets();
  if (!isOffline) return null;
  return (
    <View
      style={[
        styles.banner,
        {
          paddingTop: Math.max(insets.top, 8),
          backgroundColor: colors.panel,
          borderBottomColor: colors.coral,
        },
      ]}
      accessibilityRole="alert"
    >
      <Text style={[styles.text, { color: colors.coral }]}>
        {t('common.offline')}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    borderBottomWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    zIndex: 90,
  },
  text: {
    ...typography.caption,
    textAlign: 'center',
    fontFamily: typography.bodyBold.fontFamily,
  },
});
