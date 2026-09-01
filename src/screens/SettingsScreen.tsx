import React, { useEffect, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { radii, spacing } from '../constants/theme';
import i18n, { setLanguage } from '../i18n';
import {
  areNotificationsEnabled,
  registerForPushNotifications,
  setNotificationsPreference,
  unregisterPushToken,
} from '../hooks/usePushNotifications';
import { useAuth } from '../store/AuthContext';
import { useAppTheme } from '../store/ThemeContext';
import { friendlyError } from '../utils/errors';

type Props = {
  onOpenLegal: (type: 'terms' | 'privacy') => void;
};

export function SettingsScreen({ onOpenLegal }: Props) {
  const { t } = useTranslation();
  const { colors, typography } = useAppTheme();
  const { isAuthenticated, logout, deleteAccount } = useAuth();
  const [notifications, setNotifications] = useState(true);
  const [pushToken, setPushToken] = useState<string | null>(null);
  const [lang, setLang] = useState<'de' | 'en'>(
    (i18n.language?.startsWith('de') ? 'de' : 'en') as 'de' | 'en',
  );

  useEffect(() => {
    void (async () => {
      setNotifications(await areNotificationsEnabled());
    })();
  }, []);

  const toggleNotifications = async (value: boolean) => {
    setNotifications(value);
    await setNotificationsPreference(value);
    if (value) {
      const token = await registerForPushNotifications();
      setPushToken(token);
    } else if (pushToken) {
      await unregisterPushToken(pushToken);
      setPushToken(null);
    }
  };

  const changeLanguage = async (next: 'de' | 'en') => {
    setLang(next);
    await setLanguage(next);
  };

  return (
    <ScrollView
      style={[styles.flex, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
    >
      <Card>
        <View style={styles.row}>
          <Text style={[styles.label, { color: colors.text }]}>
            {t('profile.notifications')}
          </Text>
          <Switch
            value={notifications}
            onValueChange={(v) => void toggleNotifications(v)}
            accessibilityLabel={t('profile.notifications')}
            trackColor={{ false: colors.panelElevated, true: colors.coral }}
            thumbColor={colors.white}
            ios_backgroundColor={colors.panelElevated}
          />
        </View>
      </Card>

      <Text style={[styles.section, typography.label]}>{t('profile.language')}</Text>
      <View style={styles.langRow}>
        {([
          ['de', t('profile.german')],
          ['en', t('profile.english')],
        ] as const).map(([code, label]) => (
          <Pressable
            key={code}
            style={[
              styles.langChip,
              {
                borderColor: colors.border,
                backgroundColor: colors.panel,
              },
              lang === code && {
                backgroundColor: colors.navyMuted,
                borderColor: colors.sky,
              },
            ]}
            onPress={() => void changeLanguage(code)}
            accessibilityRole="button"
            accessibilityState={{ selected: lang === code }}
          >
            <Text
              style={[
                typography.bodyBold,
                { color: colors.textMuted },
                lang === code && { color: colors.text },
              ]}
            >
              {label}
            </Text>
          </Pressable>
        ))}
      </View>

      <Pressable
        style={[
          styles.linkRow,
          { backgroundColor: colors.panel, borderColor: colors.border },
        ]}
        onPress={() => onOpenLegal('privacy')}
      >
        <Text style={[styles.link, { color: colors.sky }]}>
          {t('auth.privacy')}
        </Text>
      </Pressable>
      <Pressable
        style={[
          styles.linkRow,
          { backgroundColor: colors.panel, borderColor: colors.border },
        ]}
        onPress={() => onOpenLegal('terms')}
      >
        <Text style={[styles.link, { color: colors.sky }]}>
          {t('auth.terms')}
        </Text>
      </Pressable>

      {isAuthenticated ? (
        <>
          <Button
            title={t('profile.logout')}
            variant="outline"
            onPress={() => void logout()}
            style={{ marginTop: 16 }}
          />
          <Button
            title={t('profile.deleteAccount')}
            variant="danger"
            style={{ marginTop: 12 }}
            onPress={() =>
              Alert.alert(t('profile.deleteAccount'), t('profile.deleteConfirm'), [
                { text: t('common.cancel'), style: 'cancel' },
                {
                  text: t('profile.deleteAccount'),
                  style: 'destructive',
                  onPress: () => {
                    void (async () => {
                      try {
                        await deleteAccount();
                      } catch (error) {
                        Alert.alert(t('common.error'), friendlyError(error));
                      }
                    })();
                  },
                },
              ])
            }
          />
        </>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { padding: spacing.md, paddingBottom: 40 },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: { fontFamily: 'Manrope_600SemiBold', fontSize: 16 },
  section: { marginTop: 24, marginBottom: 10 },
  langRow: { flexDirection: 'row', gap: 8 },
  langChip: {
    flex: 1,
    minHeight: 48,
    borderWidth: 1,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  linkRow: {
    marginTop: 12,
    padding: spacing.md,
    borderRadius: radii.md,
    borderWidth: 1,
  },
  link: { fontFamily: 'Manrope_600SemiBold' },
});
