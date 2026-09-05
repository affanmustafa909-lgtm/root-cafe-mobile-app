import { zodResolver } from '@hookform/resolvers/zod';
import React, { useMemo, useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type TextInput,
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
import { fonts, spacing } from '../constants/theme';
import { useAuth } from '../store/AuthContext';
import { useAppTheme } from '../store/ThemeContext';
import { friendlyError } from '../utils/errors';

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

type Form = z.infer<typeof schema>;

type Props = {
  onRegister: () => void;
  onSuccess?: () => void;
  onClose?: () => void;
};

export function LoginScreen({ onRegister, onSuccess, onClose }: Props) {
  const { t } = useTranslation();
  const { login } = useAuth();
  const { colors, typography } = useAppTheme();
  const [submitting, setSubmitting] = useState(false);
  const scrollRef = useRef<ScrollView>(null);
  const passwordRef = useRef<TextInput>(null);
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '' },
  });

  const styles = useMemo(
    () =>
      StyleSheet.create({
        flex: { flex: 1, backgroundColor: colors.background },
        container: {
          padding: spacing.lg,
          paddingTop: spacing.md,
          paddingBottom: 48,
          flexGrow: 1,
        },
        containerWithBack: { paddingTop: 64 },
        brandBlock: {
          alignItems: 'center',
          marginBottom: 8,
          paddingVertical: 8,
        },
        tagline: {
          ...typography.caption,
          textAlign: 'center',
          marginTop: 10,
          marginBottom: 24,
          color: colors.textSecondary,
        },
        title: { ...typography.h2, marginBottom: 20, color: colors.text },
        link: {
          ...typography.bodyBold,
          color: colors.sky,
          marginBottom: 20,
          fontSize: 14,
        },
        linkInline: { ...typography.bodyBold, color: colors.coral },
        footer: {
          marginTop: 28,
          alignItems: 'center',
          flexDirection: 'row',
          justifyContent: 'center',
          gap: 6,
        },
        footerText: {
          color: colors.textSecondary,
          fontFamily: fonts.sans,
          fontSize: 16,
        },
      }),
    [colors, typography],
  );

  const onSubmit = handleSubmit(async (values) => {
    setSubmitting(true);
    try {
      await login(values.email.trim(), values.password);
      onSuccess?.();
    } catch (error) {
      Alert.alert(t('common.error'), friendlyError(error));
    } finally {
      setSubmitting(false);
    }
  });

  const scrollFieldIntoView = (yHint = 120) => {
    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({ y: yHint, animated: true });
    });
  };

  return (
    <Screen edges={['top', 'bottom']}>
      {onClose ? <HeaderBack onPress={onClose} /> : null}
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}
      >
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={[
            styles.container,
            onClose ? styles.containerWithBack : null,
          ]}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          automaticallyAdjustKeyboardInsets
          showsVerticalScrollIndicator={false}
        >
          <FadeIn>
            <View style={styles.brandBlock}>
              <BrandMark size="lg" />
              <Text style={styles.tagline}>{t('auth.tagline')}</Text>
            </View>
          </FadeIn>

          <FadeIn delay={80}>
            <Card>
              <Text style={styles.title}>{t('auth.login')}</Text>
              <Controller
                control={control}
                name="email"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    label={t('auth.email')}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    autoComplete="email"
                    returnKeyType="next"
                    onSubmitEditing={() => passwordRef.current?.focus()}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    error={errors.email?.message}
                    onFocus={() => scrollFieldIntoView(80)}
                  />
                )}
              />
              <Controller
                control={control}
                name="password"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    ref={passwordRef}
                    label={t('auth.password')}
                    secureTextEntry
                    returnKeyType="done"
                    onSubmitEditing={onSubmit}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    error={errors.password?.message}
                    onFocus={() => scrollFieldIntoView(160)}
                  />
                )}
              />
              <Pressable
                onPress={() =>
                  Alert.alert(
                    t('auth.forgotPassword'),
                    t('auth.forgotPasswordHint'),
                  )
                }
                accessibilityRole="button"
              >
                <Text style={styles.link}>{t('auth.forgotPassword')}</Text>
              </Pressable>
              <Button
                title={t('auth.login')}
                onPress={onSubmit}
                loading={submitting}
              />
            </Card>
          </FadeIn>

          <View style={styles.footer}>
            <Text style={styles.footerText}>{t('auth.noAccount')}</Text>
            <Pressable onPress={onRegister} accessibilityRole="button">
              <Text style={styles.linkInline}>{t('auth.createAccount')}</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}
