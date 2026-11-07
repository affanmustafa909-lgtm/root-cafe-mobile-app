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
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Input } from '../components/Input';
import { Screen } from '../components/Screen';
import { spacing } from '../constants/theme';
import { authApi } from '../services/api';
import { useAuth } from '../store/AuthContext';
import { useAppTheme } from '../store/ThemeContext';
import { friendlyError } from '../utils/errors';

const schema = z
  .object({
    password: z.string().min(8),
    confirmPassword: z.string().min(8),
  })
  .refine((v) => v.password === v.confirmPassword, {
    message: 'Passwords must match',
    path: ['confirmPassword'],
  });

type Form = z.infer<typeof schema>;

type Props = {
  onDone?: () => void;
};

export function ChangePasswordScreen({ onDone }: Props) {
  const { t } = useTranslation();
  const { refreshUser } = useAuth();
  const { colors, typography } = useAppTheme();
  const [submitting, setSubmitting] = useState(false);
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: { password: '', confirmPassword: '' },
  });

  const styles = useMemo(
    () =>
      StyleSheet.create({
        flex: { flex: 1, backgroundColor: colors.background },
        container: {
          padding: spacing.md,
          paddingBottom: 48,
          flexGrow: 1,
        },
        title: {
          ...typography.h2,
          marginBottom: 8,
          color: colors.text,
          fontSize: 22,
        },
        body: {
          ...typography.body,
          color: colors.textSecondary,
          marginBottom: 16,
          lineHeight: 22,
        },
      }),
    [colors, typography],
  );

  const onSubmit = handleSubmit(async (values) => {
    setSubmitting(true);
    try {
      await authApi.changePassword(values.password);
      await refreshUser();
      reset({ password: '', confirmPassword: '' });
      Alert.alert(t('auth.passwordUpdatedTitle'), t('auth.passwordUpdatedBody'), [
        { text: t('common.ok'), onPress: onDone },
      ]);
    } catch (error) {
      Alert.alert(t('common.error'), friendlyError(error));
    } finally {
      setSubmitting(false);
    }
  });

  return (
    <Screen edges={['bottom']}>
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
          <Card>
            <Text style={styles.title}>{t('auth.changePasswordTitle')}</Text>
            <Text style={styles.body}>{t('auth.changePasswordBody')}</Text>
            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label={t('auth.newPassword')}
                  secureTextEntry
                  autoComplete="new-password"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  error={errors.password?.message}
                />
              )}
            />
            <Controller
              control={control}
              name="confirmPassword"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label={t('auth.confirmPassword')}
                  secureTextEntry
                  autoComplete="new-password"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  error={errors.confirmPassword?.message}
                />
              )}
            />
            <Button
              title={t('auth.updatePassword')}
              onPress={onSubmit}
              loading={submitting}
            />
          </Card>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}
