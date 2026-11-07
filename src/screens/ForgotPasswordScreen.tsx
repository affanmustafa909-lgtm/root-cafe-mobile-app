import { zodResolver } from '@hookform/resolvers/zod';
import React, { useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { BrandMark } from '../components/BrandMark';
import { HeaderBack } from '../components/HeaderBack';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { FadeIn } from '../components/FadeIn';
import { Input } from '../components/Input';
import { Screen } from '../components/Screen';
import { spacing } from '../constants/theme';
import { authApi } from '../services/api';
import { useAppTheme } from '../store/ThemeContext';
import { friendlyError } from '../utils/errors';

const schema = z.object({
  email: z.string().email(),
});

type Form = z.infer<typeof schema>;

type Props = {
  onBack: () => void;
  onResetWithToken: (token: string) => void;
};

export function ForgotPasswordScreen({ onBack, onResetWithToken }: Props) {
  const { t } = useTranslation();
  const { colors, typography } = useAppTheme();
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: { email: '' },
  });

  const styles = useMemo(
    () =>
      StyleSheet.create({
        flex: { flex: 1, backgroundColor: colors.background },
        container: {
          padding: spacing.lg,
          paddingTop: 64,
          paddingBottom: 48,
          flexGrow: 1,
        },
        brandBlock: {
          alignItems: 'center',
          marginBottom: 8,
          paddingVertical: 8,
        },
        title: { ...typography.h2, marginBottom: 8, color: colors.text },
        body: {
          ...typography.body,
          color: colors.textSecondary,
          marginBottom: 20,
          lineHeight: 22,
        },
        success: {
          ...typography.body,
          color: colors.text,
          lineHeight: 22,
          marginBottom: 20,
        },
      }),
    [colors, typography],
  );

  const onSubmit = handleSubmit(async (values) => {
    setSubmitting(true);
    try {
      const result = await authApi.forgotPassword(values.email.trim());
      if (result.debugResetToken) {
        onResetWithToken(result.debugResetToken);
        return;
      }
      setSent(true);
      Alert.alert(
        t('auth.resetEmailSentTitle'),
        result.message || t('auth.resetEmailSentBody'),
      );
    } catch (error) {
      Alert.alert(t('common.error'), friendlyError(error));
    } finally {
      setSubmitting(false);
    }
  });

  return (
    <Screen edges={['top', 'bottom']}>
      <HeaderBack onPress={onBack} />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          showsVerticalScrollIndicator={false}
        >
          <FadeIn>
            <View style={styles.brandBlock}>
              <BrandMark size="lg" />
            </View>
          </FadeIn>

          <FadeIn delay={80}>
            <Card>
              <Text style={styles.title}>{t('auth.forgotPasswordTitle')}</Text>
              {sent ? (
                <>
                  <Text style={styles.success}>
                    {t('auth.resetEmailSentBody')}
                  </Text>
                  <Button title={t('auth.backToLogin')} onPress={onBack} />
                </>
              ) : (
                <>
                  <Text style={styles.body}>{t('auth.forgotPasswordBody')}</Text>
                  <Controller
                    control={control}
                    name="email"
                    render={({ field: { onChange, onBlur, value } }) => (
                      <Input
                        label={t('auth.email')}
                        autoCapitalize="none"
                        keyboardType="email-address"
                        autoComplete="email"
                        returnKeyType="done"
                        onSubmitEditing={onSubmit}
                        onBlur={onBlur}
                        onChangeText={onChange}
                        value={value}
                        error={errors.email?.message}
                      />
                    )}
                  />
                  <Button
                    title={t('auth.sendResetLink')}
                    onPress={onSubmit}
                    loading={submitting}
                  />
                </>
              )}
            </Card>
          </FadeIn>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}
